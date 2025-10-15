import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import MockupViewer3D from '@/components/Editor/MockupViewer3D';
import MotifLibrary from '@/components/Editor/MotifLibrary';
import CanvasArea from '@/components/Editor/CanvasArea';
import PropertiesToolbar from '@/components/Editor/PropertiesToolbar';
import LayerPanel from '@/components/Editor/LayerPanel';
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
    // Parse query string untuk mendapatkan width & height
    const { url } = usePage();
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const queryWidth = parseInt(urlParams.get('width')) || 800;
    const queryHeight = parseInt(urlParams.get('height')) || 600;

    const defaultSize = {
        width: queryWidth,
        height: queryHeight,
    };

    console.log('=== CANVAS SIZE ===');
    console.log('Query Width:', queryWidth);
    console.log('Query Height:', queryHeight);
    console.log('Default Size:', defaultSize);

    // State utama aplikasi editor 
    const [canvasObjects, setCanvasObjects] = useState(initialDesign?.canvas_data || []);
    const [selectedId, setSelectedId] = useState(null);
    const [designName, setDesignName] = useState(initialDesign?.title || 'Desain Batik Baru');
    const [isSaving, setIsSaving] = useState(false);
    const [motifs, setMotifs] = useState([]);
    const [loadingMotifs, setLoadingMotifs] = useState(true);
    
    // Tool states
    const [activeTool, setActiveTool] = useState('move');
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentTool, setCurrentTool] = useState('move');
    
    // Brush/Drawing states
    const [brushColor, setBrushColor] = useState('#BA682A');
    const [brushWidth, setBrushWidth] = useState(6);
    const [eraserWidth, setEraserWidth] = useState(20);
    const [activeBrush, setActiveBrush] = useState({
        color: '#BA682A',
        size: 6,
        opacity: 1
    });
    
    // Other states
    const [uploadingMotif, setUploadingMotif] = useState(false);
    const [showGrid, setShowGrid] = useState(true);
    const [snapToGrid, setSnapToGrid] = useState(true);
    const [pointer, setPointer] = useState({ x: 0, y: 0 });
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
            console.log('=== FETCHING MOTIFS ===');
            console.log('Route motifs.editor:', route('motifs.editor'));
            console.log('Route motifs.user.index:', route('motifs.user.index'));
            
            // Fetch global motifs
            console.log('Fetching global motifs...');
            const globalResponse = await fetch(route('motifs.editor'), {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin'
            });
            
            console.log('Global response status:', globalResponse.status);
            console.log('Global response ok:', globalResponse.ok);
            
            let globalMotifs = [];
            if (globalResponse.ok) {
                const globalData = await globalResponse.json();
                console.log('Global motifs data:', globalData);
                console.log('Global motifs count:', globalData.motifs?.length || 0);
                globalMotifs = globalData.motifs || [];
            } else {
                console.warn('Failed to fetch global motifs');
            }
            
            // Fetch personal motifs - JANGAN BIARKAN ERROR MENGHENTIKAN PROSES
            console.log('Fetching personal motifs...');
            let personalMotifs = [];
            try {
                const personalResponse = await fetch(route('motifs.user.index'), {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin'
                });
                
                console.log('Personal response status:', personalResponse.status);
                console.log('Personal response ok:', personalResponse.ok);
                
                if (personalResponse.ok) {
                    const personalData = await personalResponse.json();
                    console.log('Personal motifs data:', personalData);
                    console.log('Personal motifs count:', personalData.motifs?.length || 0);
                    personalMotifs = personalData.motifs || [];
                } else {
                    console.warn('Failed to fetch personal motifs, using only global motifs');
                }
            } catch (personalError) {
                console.warn('Personal motifs error (non-critical):', personalError.message);
                // Lanjutkan dengan global motifs saja
            }
            
            // Combine motifs
            const allMotifs = [...globalMotifs, ...personalMotifs];
            
            console.log('=== MOTIFS LOADED ===');
            console.log('Total motifs:', allMotifs.length);
            console.log('Global:', globalMotifs.length, 'Personal:', personalMotifs.length);
            
            if (allMotifs.length > 0) {
                console.log('First motif sample:', allMotifs[0]);
            } else {
                console.warn('No motifs found!');
            }
            
            setMotifs(allMotifs);
        } catch (error) {
            console.error('=== ERROR FETCHING MOTIFS ===');
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            setMotifs([]);
        } finally {
            setLoadingMotifs(false);
            console.log('=== FETCH COMPLETE ===');
        }
    };

    const handleMotifUpload = async (file) => {
        if (!file) return;
        
        console.log('Uploading motif:', file.name);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);
        
        try {
            setUploadingMotif(true);
            
            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            console.log('CSRF Token:', csrfToken);
            
            const response = await fetch(route('motifs.user.store'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                body: formData,
                credentials: 'same-origin'
            });
            
            console.log('Upload response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Upload error data:', errorData);
                throw new Error(errorData.message || 'Upload failed');
            }
            
            const data = await response.json();
            console.log('Uploaded motif:', data.motif);
            
            setMotifs((prev) => [...prev, data.motif]);
            alert('Motif berhasil diunggah!');
        } catch (error) {
            console.error('Upload error:', error);
            alert('Gagal mengunggah motif: ' + error.message);
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
            pixelRatio: 1,
        });

        const designData = {
            title: designName,
            canvas_data: canvasObjects,
            thumbnail: thumbnail,
            canvas_width: defaultSize.width,
            canvas_height: defaultSize.height,
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

        const patternDataURL = stageRef.current.toDataURL({
            x: 0,
            y: 0,
            width: defaultSize.width,
            height: defaultSize.height,
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
        [pointer, canvasObjects]
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
                    id: nanoid(),
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
                
                if (e.key === '[' && selectedIndex > 0) {
                    [newObjects[selectedIndex], newObjects[selectedIndex - 1]] = [newObjects[selectedIndex - 1], newObjects[selectedIndex]];
                    setCanvasObjects(newObjects);
                }

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

    // Sinkronkan activeBrush dengan state brush
    useEffect(() => {
        setActiveBrush({
            color: brushColor,
            size: brushWidth,
            opacity: 1
        });
    }, [brushColor, brushWidth]);

    // Sinkronkan currentTool dengan activeTool
    useEffect(() => {
        setCurrentTool(activeTool);
    }, [activeTool]);

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
                        <span className="ml-2 px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium">
                            {defaultSize.width} × {defaultSize.height} px
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
                    <main className="flex-1 flex bg-gray-100 rounded-xl shadow-lg border border-[#F3EDE7] items-center justify-center overflow-hidden">
                        <CanvasArea 
                            objects={canvasObjects} 
                            setObjects={setCanvasObjects}
                            selectedId={selectedId}
                            setSelectedId={setSelectedId}
                            stageRef={stageRef}
                            canvasWidth={defaultSize.width}
                            canvasHeight={defaultSize.height}
                            showGrid={showGrid}
                            snapToGrid={snapToGrid}
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