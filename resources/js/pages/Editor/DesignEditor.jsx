import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import MockupViewer3D from '@/Components/Editor/MockupViewer3D';
import MotifLibrary from '@/Components/Editor/MotifLibrary';
import CanvasArea from '@/Components/Editor/CanvasArea';
import PropertiesToolbar from '@/Components/Editor/PropertiesToolbar';
import LayerPanel from '@/Components/Editor/LayerPanel';
import { nanoid } from 'nanoid';
import { debounce } from 'lodash';

function downloadURI(uri, name) {
    const link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export default function DesignEditor({ initialDesign }) {
    // State utama aplikasi editor
    const [canvasObjects, setCanvasObjects] = useState(initialDesign?.canvas_data || []);
    const [brushStrokes, setBrushStrokes] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [designName, setDesignName] = useState(initialDesign?.title || 'Desain Batik Baru');
    const [isSaving, setIsSaving] = useState(false);
    const [motifs, setMotifs] = useState([]);
    const [loadingMotifs, setLoadingMotifs] = useState(true);
    const [activeTool, setActiveTool] = useState('select');
    const [brushColor, setBrushColor] = useState('#000000');
    const [brushWidth, setBrushWidth] = useState(5);
    const [eraserWidth, setEraserWidth] = useState(10);
    const [uploadingMotif, setUploadingMotif] = useState(false);
    const [imageLayers, setImageLayers] = useState(() =>
        (initialDesign?.canvas_data ?? []).map((obj) => ({
            id: obj.id ?? nanoid(),
            name: obj.name ?? 'Image Layer',
            visible: true,
            data: obj,
        }))
    );
    const [brushLayers, setBrushLayers] = useState([]);
    const [history, setHistory] = useState({ past: [], present: null, future: [] });
    const [showGrid, setShowGrid] = useState(true);
    const [snapToGrid, setSnapToGrid] = useState(true);
    const [coordinate, setCoordinate] = useState({ x: 0, y: 0 });
    const [autosaveStatus, setAutosaveStatus] = useState('idle');

    const stageRef = useRef();
    const [show3DModal, setShow3DModal] = useState(false);
    const [patternFor3D, setPatternFor3D] = useState('');

    // Load motifs dari API saat komponen mount
    useEffect(() => {
        fetchMotifs();
    }, []);

    const fetchMotifs = async () => {
        try {
            setLoadingMotifs(true);
            const [globalRes, personalRes] = await Promise.all([
                window.axios.get(route('motifs.editor')),
                window.axios.get(route('motifs.user.index')),
            ]);
            setMotifs([...globalRes.data.motifs, ...personalRes.data.motifs]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingMotifs(false);
        }
    };

    const handleMotifUpload = async (file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);
        try {
            setUploadingMotif(true);
            const { data } = await window.axios.post(route('motifs.user.store'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMotifs((prev) => [...prev, data.motif]);
        } catch (error) {
            console.error(error);
        } finally {
            setUploadingMotif(false);
        }
    };

    // Fungsi untuk menyimpan desain ke database
    const handleSave = () => {
        if (!stageRef.current) return;
        setIsSaving(true);

        // 1. Generate thumbnail dari canvas
        const thumbnail = stageRef.current.toDataURL({
            mimeType: 'image/jpeg',
            quality: 0.8,
            pixelRatio: 1, // Resolusi 1x cukup untuk thumbnail
        });

        const designData = {
            title: designName,
            canvas_data: canvasObjects,
            thumbnail: thumbnail, // Kirim thumbnail sebagai data base64
        };

        // 2. Tentukan rute dan metode (buat baru atau update)
        const url = initialDesign ? `/designs/${initialDesign.id}` : '/designs';
        const method = initialDesign ? 'put' : 'post';

        // 3. Kirim data ke backend dan arahkan ke dashboard setelah selesai
        router[method](url, designData, {
            onSuccess: () => {
                alert('Desain berhasil disimpan!');
            },
            onError: (errors) => {
                console.error('Gagal menyimpan:', errors);
                alert('Gagal menyimpan desain.');
            },
            onFinish: () => {
                setIsSaving(false);
            },
        });
    };

    // Fungsi untuk membersihkan semua objek dari canvas
    const handleClearCanvas = () => {
        if (window.confirm('Apakah Anda yakin ingin menghapus semua motif dari canvas?')) {
            setCanvasObjects([]);
            setSelectedId(null);
        }
    };

    const handleShow3D = () => {
        if (!stageRef.current) return;

        // Ekspor hanya area canvas 800x600, mulai dari (0,0)
        const patternDataURL = stageRef.current.toDataURL({
            x: 0,
            y: 0,
            width: 800,
            height: 600,
            mimeType: 'image/png',
            pixelRatio: 1
        });
        setPatternFor3D(patternDataURL);
        setShow3DModal(true);
    };

    // Fungsi untuk memperbarui properti objek dari toolbar
    const updateObjectProperties = (id, newAttrs) => {
        const newObjects = canvasObjects.slice();
        const objIndex = newObjects.findIndex(obj => obj.id === id);
        if (objIndex !== -1) {
            newObjects[objIndex] = { ...newObjects[objIndex], ...newAttrs };
            setCanvasObjects(newObjects);
        }
    };

    const handleDrop = useCallback(
        (event) => {
            event.preventDefault();

            const transfer = event?.nativeEvent?.dataTransfer;
            if (!transfer) return;

            const motifPayload = transfer.getData('application/json');
            if (!motifPayload) return;

            let motifData;
            try {
                motifData = JSON.parse(motifPayload);
            } catch (error) {
                console.warn('Invalid motif payload dropped', error);
                return;
            }

            if (!motifData?.preview_image_path && !motifData?.file_path) return;

            const newObject = {
                id: nanoid(),
                type: 'image',
                name: motifData.name ?? 'Motif',
                imageUrl: motifData.preview_image_path ?? motifData.file_path,
                x: pointer.x - 100,
                y: pointer.y - 100,
                width: motifData.width ?? 200,
                height: motifData.height ?? 200,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                opacity: 1,
                draggable: true,
            };

            setCanvasObjects((prev) => [...prev, newObject]);
            setSelectedId(newObject.id);
        },
        [stageRef, canvasObjects]
    );

    // Hook untuk menangani semua shortcut keyboard
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Hapus Motif
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
                setCanvasObjects(canvasObjects.filter(obj => obj.id !== selectedId));
                setSelectedId(null);
            }
            
            // Simpan Desain
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                handleSave();
            }

            if (!selectedId) return;

            const selectedIndex = canvasObjects.findIndex(obj => obj.id === selectedId);
            const selectedObject = canvasObjects[selectedIndex];

            // Duplikasi Motif
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                const newObject = {
                    ...selectedObject,
                    id: 'obj' + Date.now(),
                    x: selectedObject.x + 15,
                    y: selectedObject.y + 15,
                };
                setCanvasObjects(prev => [...prev, newObject]);
                setSelectedId(newObject.id);
            }

            // Layer Ordering
            if (e.ctrlKey && (e.key === '[' || e.key === ']')) {
                e.preventDefault();
                const newObjects = [...canvasObjects];
                
                // Send Backward
                if (e.key === '[' && selectedIndex > 0) {
                    [newObjects[selectedIndex], newObjects[selectedIndex - 1]] = [newObjects[selectedIndex - 1], newObjects[selectedIndex]];
                    setCanvasObjects(newObjects);
                }

                // Bring Forward
                if (e.key === ']' && selectedIndex < newObjects.length - 1) {
                    [newObjects[selectedIndex], newObjects[selectedIndex + 1]] = [newObjects[selectedIndex + 1], newObjects[selectedIndex]];
                    setCanvasObjects(newObjects);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canvasObjects, selectedId]);

    // Mendapatkan objek yang dipilih berdasarkan ID
    const selectedObject = canvasObjects.find(obj => obj.id === selectedId);

    const handleMouseMove = useCallback(
        (event) => {
            const stage = stageRef.current?.getStage();
            if (stage) {
                const pointer = stage.getPointerPosition();
                if (pointer) setCoordinate(pointer);
            }
            if (!isDrawing || currentTool !== 'brush') return;
            if (!stage) return;
            const pointer = stage.getPointerPosition();
            setBrushLayers((prev) => {
                const next = [...prev];
                next[next.length - 1].data.points.push(pointer.x, pointer.y);
                return next;
            });
        },
        [isDrawing, currentTool]
    );

    const handleMouseDown = useCallback(
        (event) => {
            if (!stageRef.current) return;
            const stage = stageRef.current.getStage();
            const pointer = stage.getPointerPosition();
            if (!pointer) return;

            if (currentTool === 'brush') {
                setIsDrawing(true);
                setBrushLayers((prev) => [
                    ...prev,
                    {
                        id: nanoid(),
                        type: 'brush',
                        points: [pointer.x, pointer.y],
                        color: activeBrush.color,
                        size: activeBrush.size,
                        opacity: activeBrush.opacity,
                    },
                ]);
                return;
            }

            const clickedOnEmpty = event.target === stage;
            if (clickedOnEmpty) {
                setSelectedId(null);
            }
        },
        [currentTool, activeBrush]
    );

    const handleMouseUp = useCallback(() => {
        if (isDrawing && currentTool === 'brush') {
            setIsDrawing(false);
            setHistory((history) => ({
                past: [...history.past, history.present],
                present: {
                    ...history.present,
                    brushStrokes: [...brushStrokes],
                },
                future: [],
            }));
        }
    }, [isDrawing, currentTool, brushStrokes]);

    const updateHistory = useCallback(
        (next) => {
            setHistory(({ past, present }) => ({
                past: present ? [...past, present] : past,
                present: next,
                future: [],
            }));
        },
        []
    );

    const debouncedAutosave = useMemo(
        () =>
            debounce((payload) => {
                const designId = payload?.id;
                if (!designId) return;
                setAutosaveStatus('saving');
                window.axios
                    .post(route('designs.update.autosave'), payload)
                    .then(() => setAutosaveStatus('saved'))
                    .catch(() => setAutosaveStatus('error'));
            }, 2000),
        []
    );

    useEffect(() => {
        return () => debouncedAutosave.cancel();
    }, [debouncedAutosave]);

    useEffect(() => {
        if (!history.present?.id) return;
        debouncedAutosave({
            id: history.present.id,
            canvas_data: {
                images: imageLayers,
                brushes: brushLayers,
            },
        });
    }, [history.present, imageLayers, brushLayers, debouncedAutosave]);

    const pushHistory = useCallback((nextState) => {
        setHistory(({ past, present }) => ({
            past: present ? [...past, present] : past,
            present: nextState,
            future: [],
        }));
    }, []);

    const handleRenameLayer = useCallback((layerId, name) => {
        setLayers((prev) =>
            prev.map((layer) => (layer.id === layerId ? { ...layer, name } : layer))
        );
    }, []);

    const handleAddLayer = useCallback((type, payload) => {
        const newLayer = {
            id: nanoid(),
            type, // 'brush' | 'image'
            name: type === 'brush' ? 'Brush Layer' : 'Image Layer',
            data: payload,
        };
        setLayers((prev) => [...prev, newLayer]);
        pushHistory({ ...history.present, canvasObjects: [...canvasObjects, payload] });
    }, [canvasObjects, pushHistory, history.present]);

    const handleUndo = useCallback(() => {
        setHistory(({ past, present, future }) => {
            if (!past.length) return { past, present, future };
            const previous = past[past.length - 1];
            const newPast = past.slice(0, -1);
            setCanvasObjects(previous.canvasObjects || []);
            return {
                past: newPast,
                present: previous,
                future: present ? [present, ...future] : future,
            };
        });
    }, []);

    const handleRedo = useCallback(() => {
        setHistory(({ past, present, future }) => {
            if (!future.length) return { past, present, future };
            const next = future[0];
            const newFuture = future.slice(1);
            setCanvasObjects(next.canvasObjects || []);
            return {
                past: present ? [...past, present] : past,
                present: next,
                future: newFuture,
            };
        });
    }, []);

    const addImageLayer = useCallback(
        (motif) => {
            const layer = {
                id: nanoid(),
                name: motif.name ?? 'Image Layer',
                visible: true,
                data: {
                    ...motif,
                    imageUrl: motif.preview_image_path ?? motif.file_path,
                    x: motif.x ?? 100,
                    y: motif.y ?? 100,
                    width: motif.width ?? 200,
                    height: motif.height ?? 200,
                },
            };
            setImageLayers((prev) => [...prev, layer]);
            updateHistory({
                id: history.present?.id,
                canvasObjects: [...canvasObjects, layer.data],
            });
        },
        [canvasObjects, history.present, updateHistory]
    );

    return (
        <>
            <Head title="Editor Desain Batik" />
            <div className="flex flex-col h-screen bg-white font-sans">
                <header className="flex items-center justify-between px-8 py-5 bg-white border b rounded-b-xl">
                    <div className="flex items-center gap-3">
                        <Link 
                            href="/dashboard"
                            className="flex items-center gap-2 bg-[#F8F5F2] hover:bg-[#F3EDE7] text-[#BA682A] px-3 py-2 rounded-lg transition font-semibold shadow"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Kembali</span>
                        </Link>
                        <span className="ml-4 px-3 py-1 rounded-full bg-[#FFF7ED] text-[#BA682A] font-bold text-lg tracking-tight shadow">
                            Canvas Batik Editor
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <input 
                            type="text" 
                            value={designName} 
                            onChange={(e) => setDesignName(e.target.value)}
                            className="border border-[#D2691E] rounded-lg px-4 py-2 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#D2691E] w-56 shadow"
                            placeholder="Nama desain"
                        />
                        <button 
                            onClick={handleShow3D} 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 font-semibold shadow"
                        >
                            Preview 3D
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`px-4 py-2 rounded-lg transition font-semibold shadow ${
                                isSaving 
                                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                                    : 'bg-[#D2691E] hover:bg-[#A0522D] text-white'
                            }`}
                        >
                            {isSaving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </header>   
                <div className="flex flex-grow overflow-hidden gap-4 px-6 py-4">
                    {/* Sidebar Kiri */}
                    <aside className="w-64 bg-white rounded-xl overflow-y-auto shadow-lg p-4 flex flex-shrink-0 border border-[#F3EDE7]">
                        <MotifLibrary 
                            motifs={motifs} 
                            loading={loadingMotifs}
                            uploading={uploadingMotif}
                            onRefresh={fetchMotifs}
                            onUpload={handleMotifUpload}
                        />
                    </aside>
                    {/* Area Canvas */}
                    <main className="flex-1 flex bg-white rounded-xl shadow-lg border border-[#F3EDE7]">
                        <CanvasArea 
                            objects={canvasObjects} 
                            setObjects={setCanvasObjects}
                            selectedId={selectedId}
                            setSelectedId={setSelectedId}
                            stageRef={stageRef}
                            style={{ width: '100%'}}
                        />
                    </main>
                    {/* Sidebar Kanan */}
                    <aside className="w-72 bg-white rounded-xl shadow-lg p-4 flex flex-col flex-shrink-0 border border-[#F3EDE7]">
                        <PropertiesToolbar 
                            activeTool={activeTool}
                            setActiveTool={setActiveTool}
                            brushColor={brushColor}
                            setBrushColor={setBrushColor}
                            brushWidth={brushWidth}
                            setBrushWidth={setBrushWidth}
                            eraserWidth={eraserWidth}
                            setEraserWidth={setEraserWidth}
                            selectedObject={selectedObject}
                            onUpdate={updateObjectProperties}
                        />
                        <div className="mt-auto pt-4">
                            <LayerPanel
                                objects={canvasObjects}
                                selectedId={selectedId}
                                onSelect={setSelectedId}
                                onClear={handleClearCanvas}
                            />
                        </div>
                    </aside>
                </div>

                {/* Modal 3D */}
                {show3DModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-2xl w-3/4 h-3/4 p-6 relative flex flex-col z-50">
                            <button 
                                onClick={() => setShow3DModal(false)}
                                className="absolute z-50 top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow transition"
                            >
                                X
                            </button>
                            <MockupViewer3D patternUrl={patternFor3D} />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}