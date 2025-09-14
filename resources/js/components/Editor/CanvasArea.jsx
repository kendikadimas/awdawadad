import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer, Rect, Line, Circle } from 'react-konva';
import useImage from 'use-image';
import { Brush, Eraser, Hand, Move } from 'lucide-react';

// Komponen kecil untuk merender satu gambar motif di dalam canvas
const MotifImage = ({ shapeProps, isSelected, onSelect, onChange }) => {
    const shapeRef = useRef();
    // Hook 'useImage' untuk memuat gambar dengan aman ke dalam Konva
    const [image] = useImage(shapeProps.src, 'Anonymous');

    // Hubungkan Transformer ke node ini saat terpilih
    useEffect(() => {
        if (isSelected) {
            // trRef didapat dari parent melalui context atau prop, tapi cara ini lebih simpel
            const tr = shapeRef.current.getStage().findOne('Transformer');
            if (tr) {
                tr.nodes([shapeRef.current]);
                tr.getLayer().batchDraw();
            }
        }
    }, [isSelected]);

    return (
        <KonvaImage
            id={shapeProps.id} // ID penting untuk seleksi
            onClick={onSelect}
            onTap={onSelect}
            ref={shapeRef}
            {...shapeProps}
            image={image}
            draggable
            onDragEnd={(e) => {
                onChange({
                    ...shapeProps,
                    x: e.target.x(),
                    y: e.target.y(),
                });
            }}
            onTransformEnd={() => {
                const node = shapeRef.current;
                if (!node) return;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                
                // Reset skala untuk menghindari penumpukan transformasi
                node.scaleX(1);
                node.scaleY(1);

                onChange({
                    ...shapeProps,
                    x: node.x(),
                    y: node.y(),
                    width: Math.max(5, node.width() * scaleX),
                    height: Math.max(node.height() * scaleY),
                    rotation: node.rotation(),
                });
            }}
        />
    );
};

const TOOL_LIST = [
    { label: 'Brush', value: 'brush', icon: <Brush size={24} /> },
    { label: 'Eraser', value: 'eraser', icon: <Eraser size={24} /> },
    { label: 'Hand', value: 'hand', icon: <Hand size={24} /> },
    { label: 'Move', value: 'move', icon: <Move size={24} /> },
];

// Komponen utama untuk seluruh area canvas
export default function CanvasArea({ objects, setObjects, selectedId, setSelectedId, stageRef }) {
    const trRef = useRef();
    const containerRef = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    // State lokal untuk posisi dan skala panggung (canvas)
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
    const [stageScale, setStageScale] = useState(1);
    const [activeTool, setActiveTool] = useState('move');
    const [drawing, setDrawing] = useState(false);
    const [currentShape, setCurrentShape] = useState(null);
    const [pencilColor, setPencilColor] = useState('#222');
    const [brushColor, setBrushColor] = useState('#BA682A');
    const [eraserWidth, setEraserWidth] = useState(20);
    const [pencilWidth, setPencilWidth] = useState(2);
    const [brushWidth, setBrushWidth] = useState(6);

    // Efek untuk menghubungkan Transformer dengan node yang dipilih
    useEffect(() => {
        if (trRef.current) {
            const selectedNode = stageRef.current.findOne('#' + selectedId);
            if (selectedNode) {
                trRef.current.nodes([selectedNode]);
            } else {
                trRef.current.nodes([]);
            }
            trRef.current.getLayer()?.batchDraw();
        }
    }, [selectedId, objects, stageRef]);

    useEffect(() => {
        if (!containerRef.current) return;

        const checkSize = () => {
            setSize({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight,
            });
        };

        // Cek ukuran saat pertama kali mount dan saat window di-resize
        checkSize();
        window.addEventListener('resize', checkSize);

        return () => window.removeEventListener('resize', checkSize);
    }, []);

    // Fungsi untuk membatalkan pilihan jika klik di area kosong
    const checkDeselect = (e) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            setSelectedId(null);
        }
    };
    
    // Fungsi untuk menangani zoom dengan mouse scroll wheel
    const handleWheel = (e) => {
        e.evt.preventDefault();
        const scaleBy = 1.05;
        const stage = stageRef.current;
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };
        const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
        
        setStageScale(newScale);
        setStagePos({
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        });
    };
    
    // Fungsi untuk menangani pan (geser) canvas
    const handleStageDragEnd = (e) => {
        // Hanya update jika yang digeser adalah panggungnya langsung, bukan motif
        if (e.target === stageRef.current) {
            setStagePos({ x: e.target.x(), y: e.target.y() });
        }
    };

    // Fungsi untuk menangani drop motif dari pustaka
    const handleDrop = (e) => {
        e.preventDefault();
        if (!stageRef.current) return;
        stageRef.current.setPointersPositions(e);
        
        const pos = stageRef.current.getPointerPosition();
        const dropX = (pos.x - stagePos.x) / stageScale;
        const dropY = (pos.y - stagePos.y) / stageScale;
        
        const motifData = JSON.parse(e.dataTransfer.getData('application/json'));
        
        const newObject = {
            id: 'obj' + Date.now(),
            x: dropX,
            y: dropY,
            src: motifData.file_path,
            width: 150,
            height: 150,
            rotation: 0,
        };
        setObjects([...objects, newObject]);
    };

    // Handler untuk mouse/touch event
    const handleMouseDown = (e) => {
        if (activeTool === 'eraser') {
            setDrawing(true);
            const pos = getCanvasPointer(e.target.getStage());
            setCurrentShape({
                tool: 'eraser',
                points: [pos.x, pos.y],
                stroke: '#fff',
                strokeWidth: eraserWidth,
            });
            return;
        }
        if (activeTool === 'pencil') {
            setDrawing(true);
            const pos = getCanvasPointer(e.target.getStage());
            setCurrentShape({
                tool: 'pencil',
                points: [pos.x, pos.y],
                stroke: pencilColor,
                strokeWidth: pencilWidth,
            });
        }
        if (activeTool === 'brush') {
            setDrawing(true);
            const pos = getCanvasPointer(e.target.getStage());
            setCurrentShape({
                tool: 'brush',
                points: [pos.x, pos.y],
                stroke: brushColor,
                strokeWidth: brushWidth,
            });
        }
        // Tambahkan handler lain untuk eraser, dll
    };

    const handleMouseMove = (e) => {
        if (drawing && activeTool === 'eraser') {
            const pos = getCanvasPointer(e.target.getStage());
            let changed = false;
            setObjects(prevObjects => {
                let newObjects = [];
                for (const obj of prevObjects) {
                    if (obj.tool === 'pencil' || obj.tool === 'brush') {
                        let segment = [];
                        let segments = [];
                        let erased = false;
                        for (let i = 0; i < obj.points.length; i += 2) {
                            const dx = obj.points[i] - pos.x;
                            const dy = obj.points[i + 1] - pos.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist < eraserWidth) {
                                erased = true;
                                if (segment.length >= 4) segments.push([...segment]);
                                segment = [];
                            } else {
                                segment.push(obj.points[i], obj.points[i + 1]);
                            }
                        }
                        if (segment.length >= 4) segments.push([...segment]);
                        if (segments.length > 0) {
                            segments.forEach(segPoints => {
                                newObjects.push({
                                    ...obj,
                                    points: segPoints,
                                    id: obj.id + '-' + Math.random().toString(36).substr(2, 6)
                            });
                            });
                        }
                        if (erased) changed = true;
                    } else {
                        newObjects.push(obj);
                    }
                }
                // Hanya update jika ada perubahan
                return changed ? newObjects : prevObjects;
            });
        }
        if (drawing && (activeTool === 'pencil' || activeTool === 'brush')) {
            const pos = getCanvasPointer(e.target.getStage());
            setCurrentShape(prev => ({
                ...prev,
                points: [...prev.points, pos.x, pos.y]
            }));
        }
    };

    const handleMouseUp = () => {
        if (drawing && currentShape) {
            if (activeTool === 'eraser') {
                setObjects([...objects, { ...currentShape, id: 'erase' + Date.now() }]);
            } else if (activeTool === 'pencil' || activeTool === 'brush') {
                setObjects([...objects, { ...currentShape, id: 'draw' + Date.now() }]);
            }
            setDrawing(false);
            setCurrentShape(null);
        }
    };

    // Handler untuk eraser (hapus objek yang diklik)
    const handleEraser = (e) => {
        if (activeTool === 'eraser') {
            const pointer = getCanvasPointer(e.target.getStage());
            // Cari garis terdekat dengan pointer
            let minDist = Infinity;
            let targetId = null;
            objects.forEach(obj => {
                if (obj.tool === 'pencil' || obj.tool === 'brush') {
                    for (let i = 0; i < obj.points.length; i += 2) {
                        const dx = obj.points[i] - pointer.x;
                        const dy = obj.points[i + 1] - pointer.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < minDist && dist < 20) { // threshold 20px
                            minDist = dist;
                            targetId = obj.id;
                        }
                    }
                }
            });
            if (targetId) {
                setObjects(objects.filter(obj => obj.id !== targetId));
            }
        }
    };

    // Handler untuk hand tool (geser canvas)
    // Handler untuk move tool (geser objek)
    // Handler untuk shapes (tambahkan bentuk)

    const getCanvasPointer = (stage) => {
        const pointer = stage.getPointerPosition();
        return {
            x: (pointer.x - stage.x()) / stage.scaleX(),
            y: (pointer.y - stage.y()) / stage.scaleY(),
        };
    };

    return (
        <div className="relative w-full h-full">
            {/* Toolbar */}
            <div
    className="absolute top-4 left-4 z-20 flex gap-2 items-center rounded-lg shadow-lg p-2"
    style={{
        background: "rgba(255,255,255,0.5)", // transparan putih
        backdropFilter: "blur(4px)",         // efek blur kaca
        border: "1px solid #e5e7eb",         // border tipis
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    }}
>
    {TOOL_LIST.map(tool => (
        <button
            key={tool.value}
            className={`w-10 h-10 flex items-center justify-center text-2xl rounded-full border-2 ${activeTool === tool.value ? 'bg-[#BA682A] text-white border-[#BA682A]' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
            onClick={() => setActiveTool(tool.value)}
            title={tool.label}
        >
            {tool.icon}
        </button>
    ))}
    {/* Pengaturan warna dan ketebalan */}
    {activeTool === 'brush' && (
        <>
            <input
                type="color"
                value={brushColor}
                onChange={e => setBrushColor(e.target.value)}
                className="ml-2 w-8 h-8 border rounded"
                title="Warna Brush"
            />
            <input
                type="range"
                min={1}
                max={40}
                value={brushWidth}
                onChange={e => setBrushWidth(Number(e.target.value))}
                className="ml-2"
                title="Ketebalan Brush"
            />
            <span className="ml-1 text-xs">{brushWidth}px</span>
        </>
    )}
    {activeTool === 'eraser' && (
        <>
            <input
                type="range"
                min={5}
                max={60}
                value={eraserWidth}
                onChange={e => setEraserWidth(Number(e.target.value))}
                className="ml-2"
                title="Ketebalan Eraser"
            />
            <span className="ml-1 text-xs">{eraserWidth}px</span>
        </>
    )}
</div>
            {/* Canvas Konva */}
            <div 
                ref={containerRef}
                className={
                    "bg-white w-full h-full " +
                    (activeTool === 'hand' ? "cursor-grab active:cursor-grabbing" :
                     activeTool === 'move' ? "cursor-pointer" :
                     activeTool === 'brush' ? "cursor-crosshair" :
                     activeTool === 'pencil' ? "cursor-crosshair" :
                     activeTool === 'eraser' ? "cursor-cell" : "cursor-default")
                }
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
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
                    onDragEnd={handleStageDragEnd}
                    draggable={activeTool === 'hand'} // hanya bisa drag canvas saat hand tool
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onClick={handleEraser}
                >
                    <Layer>
                        <Rect
                            x={-stagePos.x / stageScale}
                            y={-stagePos.y / stageScale}
                            width={800 / stageScale}
                            height={600 / stageScale}
                            fill="white"
                            listening={false}
                        />
                        {objects.map((obj) => (
                            <MotifImage
                                key={obj.id}
                                shapeProps={obj}
                                isSelected={obj.id === selectedId}
                                onSelect={() => {
                                    setSelectedId(obj.id);
                            }}
                            onChange={(newAttrs) => {
                                const newObjects = objects.slice();
                                const objIndex = newObjects.findIndex(o => o.id === obj.id);
                                if (objIndex !== -1) {
                                    newObjects[objIndex] = newAttrs;
                                    setObjects(newObjects);
                                }
                            }}
                            draggable={activeTool === 'move'} // hanya bisa drag objek saat move tool
                        />
                        ))}
                        {/* Render objek gambar */}
                        {objects.map((obj) => {
    if (obj.tool === 'pencil' || obj.tool === 'brush') {
        return (
            <Line
                key={obj.id}
                points={obj.points}
                stroke={obj.stroke}
                strokeWidth={obj.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={obj.tool === 'eraser' ? 'destination-out' : 'source-over'}
            />
        );
    }
    return null;
})}
                        {drawing && currentShape && (currentShape.tool === 'pencil' || currentShape.tool === 'brush') && (
    <Line
        points={currentShape.points}
        stroke={currentShape.stroke}
        strokeWidth={currentShape.strokeWidth}
        tension={0.5}
        lineCap="round"
        lineJoin="round"
    />
)}
                        <Transformer ref={trRef} />
                    </Layer>
                </Stage>
            </div>
        </div>
    );
}