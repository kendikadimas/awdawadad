import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer, Rect, Line, Group } from 'react-konva';
import useImage from 'use-image';
import { Brush, Eraser, Hand, Move } from 'lucide-react';

// Komponen untuk render motif image
const MotifImage = ({ shapeProps, isSelected, onSelect, onChange, trRef, activeTool }) => {
    const shapeRef = useRef();
    const resolvedImage = React.useMemo(() => {
        if (!shapeProps.imageUrl) return { src: null, crossOrigin: undefined };

        const isSameOrigin = shapeProps.imageUrl.startsWith('/')
            || shapeProps.imageUrl.startsWith(window.location.origin);

        return {
            src: shapeProps.imageUrl,
            crossOrigin: isSameOrigin ? undefined : 'Anonymous',
        };
    }, [shapeProps.imageUrl]);

    const [image] = useImage(resolvedImage.src, resolvedImage.crossOrigin);

    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer()?.batchDraw();
        }
    }, [isSelected, trRef]);

    return (
        <KonvaImage
            id={shapeProps.id}
            onClick={onSelect}
            onTap={onSelect}
            ref={shapeRef}
            {...shapeProps}
            image={image}
            draggable={activeTool === 'move'}
            listening={activeTool === 'move'}
            onDragEnd={(e) => {
                const node = shapeRef.current;
                if (!node) return;

                onChange({
                    ...shapeProps,
                    x: node.x(),
                    y: node.y(),
                });
            }}
            onTransformEnd={(e) => {
                const node = shapeRef.current;
                if (!node) return;

                const scaleX = node.scaleX();
                const scaleY = node.scaleY();

                node.scaleX(1);
                node.scaleY(1);

                const newWidth = Math.max(10, node.width() * scaleX);
                const newHeight = Math.max(10, node.height() * scaleY);
                const rotation = node.rotation();

                node.width(newWidth);
                node.height(newHeight);
                node.rotation(rotation);

                onChange({
                    ...shapeProps,
                    x: node.x(),
                    y: node.y(),
                    rotation: rotation,
                    width: newWidth,
                    height: newHeight,
                });
            }}
        />
    );
};

const TOOL_LIST = [
    { label: 'Move', value: 'move', icon: <Move size={24} /> },
    { label: 'Brush', value: 'brush', icon: <Brush size={24} /> },
    { label: 'Eraser', value: 'eraser', icon: <Eraser size={24} /> },
];

// Helper function untuk memotong line dengan eraser
function splitLineByEraser(linePoints, eraserPoints, eraserRadius) {
    if (!linePoints || linePoints.length < 4) return [linePoints];
    if (!eraserPoints || eraserPoints.length < 2) return [linePoints];

    const segments = [];
    let currentSegment = [];
    
    for (let i = 0; i < linePoints.length; i += 2) {
        const px = linePoints[i];
        const py = linePoints[i + 1];
        let isErased = false;

        for (let j = 0; j < eraserPoints.length; j += 2) {
            const ex = eraserPoints[j];
            const ey = eraserPoints[j + 1];
            const distance = Math.sqrt(
                Math.pow(px - ex, 2) + Math.pow(py - ey, 2)
            );

            if (distance < eraserRadius) {
                isErased = true;
                break;
            }
        }

        if (isErased) {
            if (currentSegment.length >= 4) {
                segments.push([...currentSegment]);
            }
            currentSegment = [];
        } else {
            currentSegment.push(px, py);
        }
    }

    if (currentSegment.length >= 4) {
        segments.push(currentSegment);
    }

    return segments.length > 0 ? segments : null;
}

export default function CanvasArea({ 
    objects, 
    setObjects, 
    selectedId, 
    setSelectedId, 
    stageRef, 
    canvasWidth, 
    canvasHeight,
    showGrid,
    snapToGrid,
}) {
    const trRef = useRef();
    const containerRef = useRef(null);
    const layerRef = useRef(null);
    const clipGroupRef = useRef(null);
    const isDrawingRef = useRef(false);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [stageScale, setStageScale] = useState(1);
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
    const [activeTool, setActiveTool] = useState('move');
    const [drawing, setDrawing] = useState(false);
    const [currentShape, setCurrentShape] = useState(null);
    const [brushColor, setBrushColor] = useState('#BA682A');
    const [eraserWidth, setEraserWidth] = useState(20);
    const [brushWidth, setBrushWidth] = useState(6);
    const gridSize = 40;

    // Update transformer when selection changes
    useEffect(() => {
        if (!trRef.current || !layerRef.current) return;

        if (selectedId && activeTool === 'move') {
            const selectedNode = layerRef.current.findOne('#' + selectedId);
            if (selectedNode && selectedNode.getClassName() === 'Image') {
                trRef.current.nodes([selectedNode]);
                trRef.current.getLayer()?.batchDraw();
            } else {
                trRef.current.nodes([]);
            }
        } else {
            trRef.current.nodes([]);
        }
    }, [selectedId, activeTool, objects]);

    // Responsive sizing - LANGSUNG tanpa delay
    useEffect(() => {
        if (!containerRef.current) return;

        const checkSize = () => {
            if (!containerRef.current) return;
            
            const containerWidth = containerRef.current.offsetWidth;
            const containerHeight = containerRef.current.offsetHeight;
            
            console.log('Container dimensions:', { containerWidth, containerHeight });
            
            // Langsung set size tanpa validasi width/height === 0
            setSize({ width: containerWidth, height: containerHeight });

            const padding = 100;
            const scaleX = (containerWidth - padding * 2) / canvasWidth;
            const scaleY = (containerHeight - padding * 2) / canvasHeight;
            const optimalScale = Math.min(scaleX, scaleY, 1);

            setStageScale(optimalScale);
            
            const stageX = (containerWidth - canvasWidth * optimalScale) / 2;
            const stageY = (containerHeight - canvasHeight * optimalScale) / 2;
            setStagePos({ x: stageX, y: stageY });
            
            console.log('Canvas ready:', { containerWidth, containerHeight, scale: optimalScale });
        };

        // Immediate check
        checkSize();
        
        // Backup check dengan requestAnimationFrame
        requestAnimationFrame(checkSize);
        
        // Resize listener
        window.addEventListener('resize', checkSize);
        return () => {
            window.removeEventListener('resize', checkSize);
        };
    }, [canvasWidth, canvasHeight]);

    // Deselect on empty click
    const checkDeselect = (e) => {
        const clickedOnTransformer = e.target.getParent()?.className === 'Transformer';
        if (clickedOnTransformer) return;

        const clickedOnEmpty = e.target === e.target.getStage() || 
                               e.target.getClassName() === 'Rect';
        
        if (clickedOnEmpty && activeTool === 'move') {
            setSelectedId(null);
        }
    };

    // Zoom handler
    const handleWheel = (e) => {
        e.evt.preventDefault();
        const scaleBy = 1.05;
        const stage = stageRef.current;
        const oldScale = stage.scaleX();

        let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
        newScale = Math.max(0.1, Math.min(4, newScale));
        
        setStageScale(newScale);
        
        const newStageX = (size.width - canvasWidth * newScale) / 2;
        const newStageY = (size.height - canvasHeight * newScale) / 2;
        setStagePos({ x: newStageX, y: newStageY });
    };

    // Get pointer position relative to canvas
    const getCanvasPointer = (stage) => {
        const pointer = stage.getPointerPosition();
        return {
            x: (pointer.x - stagePos.x) / stageScale,
            y: (pointer.y - stagePos.y) / stageScale,
        };
    };

    // Drawing handlers
    const handleMouseDown = (e) => {
        if (activeTool === 'move') return;

        if (activeTool === 'brush') {
            isDrawingRef.current = true;
            setDrawing(true);
            const pos = getCanvasPointer(e.target.getStage());
            
            if (pos.x < 0 || pos.x > canvasWidth || pos.y < 0 || pos.y > canvasHeight) {
                return;
            }
            
            setCurrentShape({
                tool: 'brush',
                points: [pos.x, pos.y],
                stroke: brushColor,
                strokeWidth: brushWidth,
                id: 'temp-' + Date.now(),
            });
        } else if (activeTool === 'eraser') {
            isDrawingRef.current = true;
            setDrawing(true);
            const pos = getCanvasPointer(e.target.getStage());
            
            if (pos.x < 0 || pos.x > canvasWidth || pos.y < 0 || pos.y > canvasHeight) {
                return;
            }
            
            setCurrentShape({
                tool: 'eraser',
                points: [pos.x, pos.y],
                eraserWidth: eraserWidth,
                id: 'temp-eraser-' + Date.now(),
            });
        }
    };

    const handleMouseMove = (e) => {
        if (!drawing || !isDrawingRef.current) return;

        const pos = getCanvasPointer(e.target.getStage());
        const clampedX = Math.max(0, Math.min(canvasWidth, pos.x));
        const clampedY = Math.max(0, Math.min(canvasHeight, pos.y));
        
        if (activeTool === 'brush') {
            setCurrentShape(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    points: [...prev.points, clampedX, clampedY]
                };
            });
        } else if (activeTool === 'eraser') {
            setCurrentShape(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    points: [...prev.points, clampedX, clampedY]
                };
            });
        }
    };

    const handleMouseUp = () => {
        if (!drawing || !currentShape) {
            isDrawingRef.current = false;
            setDrawing(false);
            setCurrentShape(null);
            return;
        }

        if (activeTool === 'brush') {
            if (currentShape.points && currentShape.points.length >= 4) {
                const finalShape = {
                    ...currentShape,
                    type: 'line',
                    id: 'stroke-' + Date.now(),
                };
                setObjects(prev => [...prev, finalShape]);
            }
        } else if (activeTool === 'eraser' && currentShape.points) {
            const eraserRadius = eraserWidth / 2;
            
            setObjects(prev => {
                const newObjects = [];
                
                prev.forEach(obj => {
                    if (obj.type !== 'line') {
                        newObjects.push(obj);
                        return;
                    }
                    
                    const segments = splitLineByEraser(
                        obj.points, 
                        currentShape.points, 
                        eraserRadius
                    );
                    
                    if (segments && segments.length > 0) {
                        segments.forEach((segmentPoints, idx) => {
                            newObjects.push({
                                ...obj,
                                id: obj.id + '-segment-' + idx + '-' + Date.now(),
                                points: segmentPoints
                            });
                        });
                    }
                });
                
                return newObjects;
            });
        }

        isDrawingRef.current = false;
        setDrawing(false);
        setCurrentShape(null);
    };

    // Handle drop motif
    const handleContainerDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!stageRef.current) return;
        
        try {
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const dropX = (x - stagePos.x) / stageScale;
            const dropY = (y - stagePos.y) / stageScale;
            
            const motifDataString = e.dataTransfer.getData('application/json');
            if (!motifDataString) return;
            
            const motifData = JSON.parse(motifDataString);
            
            const motifWidth = 150;
            const motifHeight = 150;
            
            const finalX = dropX - (motifWidth / 2);
            const finalY = dropY - (motifHeight / 2);
            
            const newObject = {
                id: 'motif-' + Date.now(),
                type: 'image',
                name: motifData.name || 'Motif',
                imageUrl: motifData.preview_image_path || motifData.image_url || motifData.file_path,
                x: finalX,
                y: finalY,
                width: motifWidth,
                height: motifHeight,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
            };
            
            setObjects(prev => [...prev, newObject]);
            setSelectedId(newObject.id);
            setActiveTool('move');
        } catch (error) {
            console.error('Drop error:', error);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
    };

    // Jangan tampilkan loading jika size.width === 0
    // Biarkan canvas render dengan size default dulu
    const shouldShowCanvas = size.width > 0 && size.height > 0;

    return (
        <div className="relative w-full h-full bg-gray-100">
            {!shouldShowCanvas && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-30">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-[#BA682A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Initializing Canvas...</p>
                        <p className="text-gray-400 text-sm mt-2">
                            {canvasWidth} × {canvasHeight} px
                        </p>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div
                className="absolute top-4 left-4 z-20 flex gap-2 items-center rounded-lg shadow-lg p-2"
                style={{
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(4px)",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
            >
                {TOOL_LIST.map(tool => (
                    <button
                        key={tool.value}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                            activeTool === tool.value 
                                ? 'bg-[#BA682A] text-white shadow-md' 
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                            setActiveTool(tool.value);
                            if (tool.value !== 'move') {
                                setSelectedId(null);
                            }
                        }}
                        title={tool.label}
                    >
                        {tool.icon}
                    </button>
                ))}
                
                {activeTool === 'brush' && (
                    <>
                        <div className="w-px h-8 bg-gray-300 mx-1"></div>
                        <input
                            type="color"
                            value={brushColor}
                            onChange={e => setBrushColor(e.target.value)}
                            className="w-8 h-8 border-2 border-gray-300 rounded cursor-pointer"
                            title="Warna Brush"
                        />
                        <input
                            type="range"
                            min={1}
                            max={40}
                            value={brushWidth}
                            onChange={e => setBrushWidth(Number(e.target.value))}
                            className="w-24"
                            title="Ketebalan Brush"
                        />
                        <span className="text-xs font-medium text-gray-700 min-w-[35px]">{brushWidth}px</span>
                    </>
                )}
                
                {activeTool === 'eraser' && (
                    <>
                        <div className="w-px h-8 bg-gray-300 mx-1"></div>
                        <input
                            type="range"
                            min={5}
                            max={60}
                            value={eraserWidth}
                            onChange={e => setEraserWidth(Number(e.target.value))}
                            className="w-24"
                            title="Ketebalan Eraser"
                        />
                        <span className="text-xs font-medium text-gray-700 min-w-[35px]">{eraserWidth}px</span>
                    </>
                )}
            </div>

            {/* Zoom Control */}
            <div className="absolute bottom-4 right-4 z-20 flex gap-2 items-center bg-white rounded-lg shadow-lg p-2 border">
                <button
                    onClick={() => {
                        const newScale = Math.max(0.1, stageScale - 0.1);
                        setStageScale(newScale);
                        const newStageX = (size.width - canvasWidth * newScale) / 2;
                        const newStageY = (size.height - canvasHeight * newScale) / 2;
                        setStagePos({ x: newStageX, y: newStageY });
                    }}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition"
                    title="Zoom Out"
                >
                    -
                </button>
                <span className="px-2 text-sm font-medium min-w-[60px] text-center">
                    {Math.round(stageScale * 100)}%
                </span>
                <button
                    onClick={() => {
                        const newScale = Math.min(4, stageScale + 0.1);
                        setStageScale(newScale);
                        const newStageX = (size.width - canvasWidth * newScale) / 2;
                        const newStageY = (size.height - canvasHeight * newScale) / 2;
                        setStagePos({ x: newStageX, y: newStageY });
                    }}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition"
                    title="Zoom In"
                >
                    +
                </button>
                <button
                    onClick={() => {
                        setStageScale(1);
                        const newStageX = (size.width - canvasWidth) / 2;
                        const newStageY = (size.height - canvasHeight) / 2;
                        setStagePos({ x: newStageX, y: newStageY });
                    }}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition"
                    title="Reset Zoom"
                >
                    Reset
                </button>
            </div>

            {/* Canvas Container - SELALU RENDER */}
            <div 
                ref={containerRef}
                className={
                    "w-full h-full " +
                    (activeTool === 'brush' ? "cursor-crosshair" :
                     activeTool === 'eraser' ? "cursor-cell" : 
                     "cursor-default")
                }
                onDrop={handleContainerDrop}
                onDragOver={handleDragOver}
            >
                {shouldShowCanvas && (
                    <Stage
                        width={size.width}
                        height={size.height}
                        onMouseDown={checkDeselect}
                        onTouchStart={checkDeselect}
                        ref={stageRef}
                        scaleX={stageScale}
                        scaleY={stageScale}
                        x={stagePos.x}
                        y={stagePos.y}
                        onWheel={handleWheel}
                        draggable={false}
                    >
                        <Layer ref={layerRef}>
                            <Rect
                                x={0}
                                y={0}
                                width={canvasWidth}
                                height={canvasHeight}
                                fill="white"
                                shadowColor="black"
                                shadowBlur={20}
                                shadowOpacity={0.3}
                                shadowOffsetX={0}
                                shadowOffsetY={0}
                                listening={true}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            />
                            
                            {showGrid && (
                                <>
                                    {Array.from({ length: Math.ceil(canvasHeight / gridSize) + 1 }).map((_, i) => (
                                        <Line
                                            key={`h-${i}`}
                                            points={[0, i * gridSize, canvasWidth, i * gridSize]}
                                            stroke="#e5e7eb"
                                            strokeWidth={1}
                                            listening={false}
                                        />
                                    ))}
                                    {Array.from({ length: Math.ceil(canvasWidth / gridSize) + 1 }).map((_, i) => (
                                        <Line
                                            key={`v-${i}`}
                                            points={[i * gridSize, 0, i * gridSize, canvasHeight]}
                                            stroke="#e5e7eb"
                                            strokeWidth={1}
                                            listening={false}
                                        />
                                    ))}
                                </>
                            )}

                            <Group
                                ref={clipGroupRef}
                                clipFunc={(ctx) => {
                                    ctx.rect(0, 0, canvasWidth, canvasHeight);
                                }}
                            >
                                {objects.map((obj) => {
                                    if (obj.type === 'line') {
                                        return (
                                            <Line
                                                key={obj.id}
                                                points={obj.points}
                                                stroke={obj.stroke}
                                                strokeWidth={obj.strokeWidth}
                                                tension={0.5}
                                                lineCap="round"
                                                lineJoin="round"
                                                listening={false}
                                            />
                                        );
                                    }
                                    
                                    if (obj.type === 'image') {
                                        return (
                                            <MotifImage
                                                key={obj.id}
                                                shapeProps={obj}
                                                isSelected={obj.id === selectedId}
                                                onSelect={() => {
                                                    if (activeTool === 'move') {
                                                        setSelectedId(obj.id);
                                                    }
                                                }}
                                                onChange={(newAttrs) => {
                                                    setObjects((prev) =>
                                                        prev.map((item) =>
                                                            item.id === obj.id ? newAttrs : item
                                                        )
                                                    );
                                                }}
                                                trRef={trRef}
                                                activeTool={activeTool}
                                            />
                                        );
                                    }
                                    
                                    return null;
                                })}
                                
                                {drawing && currentShape && currentShape.points && currentShape.points.length >= 2 && (
                                    <>
                                        {activeTool === 'brush' && (
                                            <Line
                                                points={currentShape.points}
                                                stroke={currentShape.stroke}
                                                strokeWidth={currentShape.strokeWidth}
                                                tension={0.5}
                                                lineCap="round"
                                                lineJoin="round"
                                                listening={false}
                                            />
                                        )}
                                        {activeTool === 'eraser' && (
                                            <Line
                                                points={currentShape.points}
                                                stroke="rgba(255,0,0,0.3)"
                                                strokeWidth={currentShape.eraserWidth}
                                                tension={0}
                                                lineCap="round"
                                                lineJoin="round"
                                                listening={false}
                                            />
                                        )}
                                    </>
                                )}
                            </Group>
                            
                            {activeTool === 'move' && (
                                <Transformer 
                                    ref={trRef}
                                    rotateEnabled={true}
                                    keepRatio={false}
                                    enabledAnchors={[
                                        'top-left',
                                        'top-right',
                                        'bottom-left',
                                        'bottom-right',
                                        'top-center',
                                        'middle-right',
                                        'bottom-center',
                                        'middle-left',
                                    ]}
                                    borderStroke="#4A90E2"
                                    borderStrokeWidth={2}
                                    anchorSize={10}
                                    anchorStroke="#4A90E2"
                                    anchorFill="white"
                                    anchorStrokeWidth={2}
                                    anchorCornerRadius={50}
                                />
                            )}
                        </Layer>
                    </Stage>
                )}
            </div>
        </div>
    );
}