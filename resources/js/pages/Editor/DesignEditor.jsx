import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Download } from 'lucide-react';
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
    const { url } = usePage();
    
    // ✅ FIX: Parse initialDesign dengan benar
    useEffect(() => {
        console.log('========== DEBUG INITIAL DESIGN ==========');
        console.log('Raw initialDesign:', initialDesign);
        console.log('Type:', typeof initialDesign);
        console.log('canvas_width:', initialDesign?.canvas_width);
        console.log('canvas_height:', initialDesign?.canvas_height);
        console.log('==========================================');
    }, [initialDesign]);

    const urlParams = new URLSearchParams(url.split('?')[1]);
    
    // ✅ FIX: Jangan gunakan useMemo, langsung compute
    const defaultSize = (() => {
        // Mode EDIT - Ambil dari initialDesign
        if (initialDesign && initialDesign.id) {
            const width = parseInt(initialDesign.canvas_width) || 800;
            const height = parseInt(initialDesign.canvas_height) || 600;
            
            console.log('🔵 EDIT MODE - Loading existing design');
            console.log('Design ID:', initialDesign.id);
            console.log('Canvas Width (DB):', initialDesign.canvas_width, '→', width);
            console.log('Canvas Height (DB):', initialDesign.canvas_height, '→', height);
            
            return { width, height };
        }
        
        // Mode CREATE - Ambil dari URL params
        const width = parseInt(urlParams.get('width')) || 800;
        const height = parseInt(urlParams.get('height')) || 600;
        
        console.log('🟢 CREATE MODE - New design');
        console.log('Canvas Width (URL):', urlParams.get('width'), '→', width);
        console.log('Canvas Height (URL):', urlParams.get('height'), '→', height);
        
        return { width, height };
    })();

    console.log('✅ FINAL defaultSize:', defaultSize);

    // Parse canvas_data dengan benar
    const parseCanvasData = (data) => {
        if (!data) return [];
        
        let parsed = [];
        if (Array.isArray(data)) {
            parsed = data;
        } else if (typeof data === 'string') {
            try {
                parsed = JSON.parse(data);
            } catch (e) {
                console.error('Failed to parse canvas_data:', e);
                return [];
            }
        }

        // ✅ FIX: Normalisasi path gambar
        return parsed.map(obj => {
            if (obj.imageUrl) {
                // Jika path relatif, tambahkan /storage/
                if (!obj.imageUrl.startsWith('/') && !obj.imageUrl.startsWith('http')) {
                    obj.imageUrl = '/storage/' + obj.imageUrl;
                }
            }
            // Support backward compatibility dengan 'src'
            if (obj.src && !obj.imageUrl) {
                obj.imageUrl = obj.src.startsWith('/') ? obj.src : '/storage/' + obj.src;
            }
            
            console.log('📦 Loaded object:', { id: obj.id, type: obj.type, imageUrl: obj.imageUrl });
            
            return obj;
        });
    };

    // State utama aplikasi editor - LOAD dari initialDesign
    const [canvasObjects, setCanvasObjects] = useState(() => {
        const parsed = parseCanvasData(initialDesign?.canvas_data);
        console.log('🎨 Loading canvas objects:', parsed.length, 'items');
        return Array.isArray(parsed) ? parsed : []; // ✅ Pastikan selalu array
    });
    
    const [selectedId, setSelectedId] = useState(null);
    const [designName, setDesignName] = useState(initialDesign?.title || 'Desain Batik Baru');
    const [isSaving, setIsSaving] = useState(false);
    
    // State untuk motifs
    const [motifs, setMotifs] = useState([]);
    const [loadingMotifs, setLoadingMotifs] = useState(true);
    const [uploadingMotif, setUploadingMotif] = useState(false); // ✅ Tambahkan state ini

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

    // Fetch motifs dari server
    const fetchMotifs = async () => {
        try {
            console.log('=== FETCHING MOTIFS ===');
            setLoadingMotifs(true);

            // Fetch global motifs
            const globalUrl = '/api/motifs/editor'; // ✅ Langsung pakai URL
            console.log('Fetching global motifs from:', globalUrl);

            const globalResponse = await fetch(globalUrl, {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                }
            });

            console.log('Global response status:', globalResponse.status);

            if (!globalResponse.ok) {
                throw new Error(`Global motifs fetch failed: ${globalResponse.status}`);
            }

            const globalData = await globalResponse.json();
            console.log('Global motifs data:', globalData);
            console.log('Global motifs count:', globalData?.motifs?.length || 0);

            let allMotifs = globalData?.motifs || [];

            // Fetch user motifs
            try {
                const userUrl = '/api/user-motifs'; // ✅ Langsung pakai URL
                console.log('Fetching personal motifs from:', userUrl);
                
                const userResponse = await fetch(userUrl, {
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                    }
                });

                console.log('Personal response status:', userResponse.status);

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    console.log('Personal motifs data:', userData);
                    console.log('Personal motifs count:', userData?.motifs?.length || 0);

                    const personalMotifs = userData?.motifs || [];
                    allMotifs = [...allMotifs, ...personalMotifs];
                }
            } catch (userError) {
                console.warn('Failed to fetch user motifs:', userError);
                // Continue with global motifs only
            }

            console.log('=== MOTIFS LOADED ===');
            console.log('Total motifs:', allMotifs.length);

            if (allMotifs.length > 0) {
                console.log('First motif sample:', allMotifs[0]);
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

    // Upload motif user
    // Di bagian handleUploadMotif, ubah seperti ini:
const handleUploadMotif = async (file) => {
    try {
        console.log('=== UPLOADING MOTIF ===');
        console.log('File:', file);
        
        setUploadingMotif(true);

        if (!file) {
            throw new Error('File tidak valid');
        }

        const motifName = prompt('Masukkan nama motif:', file.name.replace(/\.[^/.]+$/, ''));
        
        if (!motifName) {
            setUploadingMotif(false);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', motifName);
        formData.append('description', 'Motif pribadi');
        formData.append('category', 'Personal');

        console.log('FormData entries:');
        for (let pair of formData.entries()) {
            console.log(pair[0], pair[1]);
        }

        // ✅ FIX: Ambil CSRF token dengan cara yang benar
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
        
        console.log('CSRF Token:', csrfToken ? 'Found' : 'Missing');
        console.log('Uploading to: /api/user-motifs');

        // Upload ke server
        const response = await fetch('/api/user-motifs', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'X-Requested-With': 'XMLHttpRequest', // ✅ Tambahkan ini
                'Accept': 'application/json',
            },
            body: formData,
            credentials: 'same-origin', // ✅ Tambahkan ini
        });

        console.log('Upload response status:', response.status);
        console.log('Upload response headers:', {
            contentType: response.headers.get('content-type'),
            status: response.status,
            statusText: response.statusText
        });

        // ✅ Cek apakah response adalah JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Response is not JSON:', text.substring(0, 500));
            throw new Error(`Server mengembalikan HTML (${response.status}). Mungkin session expired atau CSRF token tidak valid.`);
        }

        const result = await response.json();
        console.log('Upload response data:', result);

        if (!response.ok) {
            throw new Error(result.message || `Upload failed: ${response.status}`);
        }

        if (result.success && result.motif) {
            setMotifs(prevMotifs => [...prevMotifs, result.motif]);
            alert('Motif berhasil diunggah!');
            await fetchMotifs();
        } else {
            throw new Error(result.message || 'Response tidak valid');
        }

    } catch (error) {
        console.error('=== UPLOAD ERROR ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);
        
        // ✅ Tampilkan error yang lebih jelas
        let errorMessage = error.message;
        if (error.message.includes('Unexpected token')) {
            errorMessage = 'Session expired atau CSRF token tidak valid. Silakan refresh halaman.';
        }
        
        alert('Terjadi kesalahan saat mengunggah motif: ' + errorMessage);
    } finally {
        setUploadingMotif(false);
    }
};

    // Fungsi untuk menyimpan desain ke database
    const handleSave = async () => {
        if (!stageRef.current) return;

        try {
            setIsSaving(true);

            // Generate thumbnail
            const layer = stageRef.current.findOne('Layer');
            const tempStage = new window.Konva.Stage({
                container: document.createElement('div'),
                width: defaultSize.width,
                height: defaultSize.height,
            });

            const tempLayer = new window.Konva.Layer();
            tempStage.add(tempLayer);

            layer.getChildren().forEach((node) => {
                if (node.getClassName() === 'Transformer') return;
                if (node.getAttr('listening') === false && node.getClassName() === 'Line') return;
                
                const clone = node.clone();
                tempLayer.add(clone);
            });

            tempLayer.batchDraw();

            const thumbnail = tempStage.toDataURL({
                x: 0,
                y: 0,
                width: defaultSize.width,
                height: defaultSize.height,
                mimeType: 'image/jpeg',
                quality: 0.8,
                pixelRatio: 1
            });

            tempStage.destroy();

            const payload = {
                title: designName,
                description: 'Desain batik custom',
                canvas_data: canvasObjects,
                canvas_width: defaultSize.width,
                canvas_height: defaultSize.height,
                thumbnail: thumbnail,
            };

            console.log('=== SAVING DESIGN ===');
            console.log('Payload:', payload);
            console.log('Canvas Width:', payload.canvas_width);
            console.log('Canvas Height:', payload.canvas_height);
            console.log('Canvas Data count:', payload.canvas_data.length);

            if (initialDesign?.id) {
                console.log('Updating design ID:', initialDesign.id);
                await router.put(`/designs/${initialDesign.id}`, payload, {
                    preserveState: false,
                    preserveScroll: false,
                    onSuccess: () => {
                        setIsSaving(false); // ✅ FIX
                        alert('Desain berhasil disimpan!');
                    },
                    onError: (errors) => {
                        console.error('Save errors:', errors);
                        setIsSaving(false); // ✅ FIX
                        alert('Gagal menyimpan: ' + Object.values(errors).join(', '));
                    }
                });
            } else {
                console.log('Creating new design');
                await router.post('/designs', payload, {
                    preserveState: false,
                    preserveScroll: false,
                    onSuccess: () => {
                        setIsSaving(false); // ✅ FIX
                        alert('Desain berhasil disimpan!');
                    },
                    onError: (errors) => {
                        console.error('Save errors:', errors);
                        setIsSaving(false); // ✅ FIX
                        alert('Gagal menyimpan: ' + Object.values(errors).join(', '));
                    }
                });
            }
        } catch (error) {
            console.error('Error saving design:', error);
            console.error('Error details:', error.response?.data);
            setIsSaving(false); // ✅ FIX
            alert('Gagal menyimpan desain: ' + (error.response?.data?.message || error.message));
        }
    };

    // Fungsi untuk membersihkan semua objek dari canvas
    const handleClearCanvas = () => {
        if (window.confirm('Apakah Anda yakin ingin menghapus semua motif dari canvas?')) {
            setCanvasObjects([]);
            setSelectedId(null);
        }
    };

    // Tambahkan state
    const [exporting3D, setExporting3D] = useState(false);

    const handleShow3D = async () => {
        if (!stageRef.current) return;

        try {
            setExporting3D(true); // ✅ Show loading

            const stage = stageRef.current;
            const layer = stage.findOne('Layer');
            
            if (!layer) {
                console.error('Layer not found');
                return;
            }

            // ✅ FIX: Tunggu semua image ter-load penuh
            const imageNodes = layer.find('Image');
            const imageLoadPromises = [];

            imageNodes.forEach(node => {
                const image = node.image();
                if (image && !image.complete) {
                    // Image belum ter-load penuh
                    imageLoadPromises.push(
                        new Promise((resolve) => {
                            image.onload = () => resolve();
                            image.onerror = () => resolve(); // Tetap resolve meskipun error
                        })
                    );
                }
            });

            // Tunggu semua image selesai load
            if (imageLoadPromises.length > 0) {
                console.log('⏳ Waiting for', imageLoadPromises.length, 'images to load...');
                await Promise.all(imageLoadPromises);
                console.log('✅ All images loaded');
            }

            // Re-draw layer untuk memastikan semua image ter-render
            layer.batchDraw();

            // Tunggu sebentar untuk memastikan render selesai
            await new Promise(resolve => setTimeout(resolve, 100));

            // Buat stage baru temporary hanya untuk export
            const tempStage = new window.Konva.Stage({
                container: document.createElement('div'),
                width: defaultSize.width,
                height: defaultSize.height,
            });

            const tempLayer = new window.Konva.Layer();
            tempStage.add(tempLayer);

            // Clone semua objek dari layer asli ke temp layer
            layer.getChildren().forEach((node) => {
                // Skip transformer dan grid
                if (node.getClassName() === 'Transformer') return;
                if (node.getAttr('listening') === false && node.getClassName() === 'Line') return;
                
                const clone = node.clone();
                tempLayer.add(clone);
            });

            tempLayer.batchDraw();

            // ✅ Tunggu sebentar lagi untuk memastikan clone ter-render
            await new Promise(resolve => setTimeout(resolve, 100));

            // Export hanya area canvas putih dengan pixelRatio lebih tinggi
            const patternDataURL = tempStage.toDataURL({
                x: 0,
                y: 0,
                width: defaultSize.width,
                height: defaultSize.height,
                mimeType: 'image/png',
                quality: 1,
                pixelRatio: 2 // Higher quality
            });

            // Cleanup
            tempStage.destroy();

            console.log('=== EXPORTING PATTERN FOR 3D ===');
            console.log('Canvas size:', defaultSize.width, 'x', defaultSize.height);
            console.log('Pattern data URL length:', patternDataURL.length);

            setPatternFor3D(patternDataURL);
            setShow3DModal(true);
        } catch (error) {
            console.error('Error exporting to 3D:', error);
            alert('Gagal export ke 3D: ' + error.message);
        } finally {
            setExporting3D(false); // ✅ Hide loading
        }
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

    // Tambahkan state untuk dropdown download
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);

    // Tambahkan fungsi download (setelah handleSave)
    const handleDownload = (format) => {
        if (!stageRef.current) return;

        const stage = stageRef.current;
        const layer = stage.findOne('Layer');
        
        if (!layer) {
            alert('Canvas tidak ditemukan');
            return;
        }

        // Buat stage temporary untuk export
        const tempStage = new window.Konva.Stage({
            container: document.createElement('div'),
            width: defaultSize.width,
            height: defaultSize.height,
        });

        const tempLayer = new window.Konva.Layer();
        tempStage.add(tempLayer);

        // Clone semua objek
        layer.getChildren().forEach((node) => {
            if (node.getClassName() === 'Transformer') return;
            if (node.getAttr('listening') === false && node.getClassName() === 'Line') return;
            
            const clone = node.clone();
            tempLayer.add(clone);
        });

        tempLayer.batchDraw();

        const fileName = `${designName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}`;

        try {
            if (format === 'png') {
                // Export sebagai PNG (Lossless, Support Transparansi)
                const dataURL = tempStage.toDataURL({
                    mimeType: 'image/png',
                    quality: 1,
                    pixelRatio: 3 // ✅ Higher quality untuk print
                });
                downloadURI(dataURL, `${fileName}.png`);
            } else if (format === 'jpg') {
                // Export sebagai JPG (Kompres, Background Putih)
                const dataURL = tempStage.toDataURL({
                    mimeType: 'image/jpeg',
                    quality: 0.95,
                    pixelRatio: 3 // ✅ Higher quality
                });
                downloadURI(dataURL, `${fileName}.jpg`);
            }

            console.log(`✅ Download ${format.toUpperCase()} berhasil:`, fileName);
            setShowDownloadMenu(false);
            
        } catch (error) {
            console.error('Error downloading:', error);
            alert('Gagal mengunduh desain: ' + error.message);
        } finally {
            tempStage.destroy();
        }
    };

    // Tambahkan setelah useEffect yang sudah ada
useEffect(() => {
    const handleClickOutside = (event) => {
        if (showDownloadMenu && !event.target.closest('.relative')) {
            setShowDownloadMenu(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
}, [showDownloadMenu]);

    return (
        <>
            <Head title="Editor Desain Batik" />
            <div className="flex flex-col h-screen bg-white font-sans">
                {/* Header - tetap sama */}
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
                        
                        {/* Tombol Download dengan Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 font-semibold shadow"
                            >
                                <Download className="w-5 h-5" />
                                Unduh
                            </button>
                            
                            {showDownloadMenu && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                    <button
                                        onClick={() => handleDownload('png')}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-100 transition rounded-t-lg"
                                    >
                                        <div className="font-semibold text-gray-700">PNG</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Kualitas tinggi, support transparansi (Recommended)
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleDownload('jpg')}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-100 transition rounded-b-lg"
                                    >
                                        <div className="font-semibold text-gray-700">JPG</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            File lebih kecil, background putih
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={handleShow3D}
                            disabled={exporting3D}
                            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 font-semibold shadow ${
                                exporting3D 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {exporting3D ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    Preview 3D
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`px-4 py-2 rounded-lg transition font-semibold shadow ${
                                isSaving ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#D2691E] hover:bg-[#BA682A] text-white'
                            }`}
                        >
                            {isSaving ? 'Menyimpan...' : 'Simpan Desain'}
                        </button>
                    </div>
                </header>
                
                {/* Main Content - 3 kolom: Motif | Canvas | Properties */}
                <div className="flex-1 flex overflow-hidden">
                    {/* LEFT SIDEBAR - Pustaka Motif */}
                    <aside className="w-64 bg-[#FAFAFA] border-r flex flex-col overflow-hidden">
                        <div className="p-4 flex-1 overflow-y-auto">
                            <MotifLibrary 
                                motifs={motifs} 
                                loading={loadingMotifs}
                                uploading={uploadingMotif}
                                onRefresh={fetchMotifs}
                                onUpload={handleUploadMotif}
                            />
                        </div>
                    </aside>
                    
                    {/* CENTER - Canvas Area dengan Toolbar */}
                    <div className="flex-1 flex flex-col bg-gray-50">
                        {/* Canvas Container */}
                        <div className="flex-1 p-4">
                            <CanvasArea 
                                canvasObjects={canvasObjects || []}
                                setCanvasObjects={setCanvasObjects}
                                selectedId={selectedId}
                                setSelectedId={setSelectedId}
                                stageRef={stageRef}
                                pointer={pointer}
                                setPointer={setPointer}
                                activeBrush={activeBrush}
                                isDrawing={isDrawing}
                                setIsDrawing={setIsDrawing}
                                currentTool={currentTool}
                                showGrid={showGrid}
                                snapToGrid={snapToGrid}
                                onDrop={handleDrop}
                                defaultSize={defaultSize}
                                brushColor={brushColor}
                                setBrushColor={setBrushColor}
                                brushWidth={brushWidth}
                                setBrushWidth={setBrushWidth}
                                eraserWidth={eraserWidth}
                                setEraserWidth={setEraserWidth}
                                activeTool={activeTool}
                                setActiveTool={setActiveTool}
                            />
                        </div>
                    </div>
                    
                    {/* RIGHT SIDEBAR - Properties & Layers */}
                    <aside className="w-72 bg-white border-l flex flex-col overflow-hidden">
                        <div className="p-4 flex-1 overflow-y-auto space-y-6">
                            {/* Properties Section */}
                            <div className="bg-[#FAFAFA] rounded-lg p-4 border">
                                <PropertiesToolbar 
                                    selectedObject={selectedObject}
                                    onUpdate={updateObjectProperties}
                                />
                            </div>
                            
                            {/* Layers Section */}
                            <div className="bg-[#FAFAFA] rounded-lg p-4 border">
                                <LayerPanel 
                                    objects={canvasObjects}
                                    selectedId={selectedId}
                                    onSelect={setSelectedId}
                                    onClear={handleClearCanvas}
                                />
                            </div>
                        </div>
                    </aside>
                </div>
                
                {/* 3D Preview Modal - tetap sama */}
                {show3DModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-bold text-[#BA682A]">Preview 3D Desain</h3>
                                <button
                                    onClick={() => setShow3DModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                <MockupViewer3D 
                                    patternUrl={patternFor3D} // ✅ UBAH: patternImage → patternUrl
                                    canvasWidth={defaultSize.width}
                                    canvasHeight={defaultSize.height}
                                />
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-6">
                                <button 
                                    onClick={() => setShow3DModal(false)} 
                                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition font-semibold"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}