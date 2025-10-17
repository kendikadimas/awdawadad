import React, { Suspense, useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { CameraControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Daftar model yang tersedia dengan konfigurasi masing-masing
const MODEL_LIST = [
    { 
        label: 'Kemeja', 
        value: 'kemeja', 
        file: '/models/white_shirt.glb',
        cameraDistance: 1.2, // Multiplier untuk jarak kamera
        position: [0, 0, 0] // Posisi offset model
    },
    { 
        label: 'Kaos', 
        value: 'kaos', 
        file: '/models/kaos.glb',
        cameraDistance: 1.5,
        position: [0, 0, 0]
    },
    { 
        label: 'Polo', 
        value: 'polo', 
        file: '/models/polo.glb',
        cameraDistance: 1.3,
        position: [0, 0, 0]
    },
    { 
        label: 'Dress', 
        value: 'dress', 
        file: '/models/dress.glb',
        cameraDistance: 1.8,
        position: [0, 0, 0]
    },
];

// Fungsi helper untuk menghitung texture repeat berdasarkan ukuran canvas
function calculateTextureRepeat(canvasWidth, canvasHeight) {
    const baseWidth = 800;
    const baseHeight = 600;
    
    const widthRatio = canvasWidth / baseWidth;
    const heightRatio = canvasHeight / baseHeight;
    
    const baseRepeatX = 2.5;
    const baseRepeatY = 2.5;
    
    const repeatX = baseRepeatX * widthRatio;
    const repeatY = baseRepeatY * heightRatio;
    
    return [repeatX, repeatY];
}

// Komponen untuk memuat model dan secara otomatis memposisikan kamera
function Model({ patternUrl, cameraControlsRef, modelConfig, canvasWidth, canvasHeight, onLoadComplete }) {
    const groupRef = useRef();
    const [highResPattern, setHighResPattern] = useState(patternUrl);
    const [modelLoaded, setModelLoaded] = useState(false);

    // Load model dengan error handling
    let nodes;
    try {
        const gltf = useGLTF(modelConfig.file);
        nodes = gltf.nodes;
        
        useEffect(() => {
            if (nodes && !modelLoaded) {
                console.log('Model loaded successfully:', modelConfig.file);
                setModelLoaded(true);
                
                // Panggil callback setelah delay kecil untuk memastikan render selesai
                setTimeout(() => {
                    if (onLoadComplete) onLoadComplete();
                }, 100);
            }
        }, [nodes, modelLoaded, onLoadComplete]);
    } catch (error) {
        console.error('Error loading model:', error);
        return <group>Error loading model</group>;
    }

    // Load texture dengan error handling
    let patternTexture;
    try {
        patternTexture = useLoader(THREE.TextureLoader, highResPattern);
    } catch (error) {
        console.error('Error loading texture:', error);
        patternTexture = null;
    }

    // Hitung texture repeat berdasarkan ukuran canvas
    const textureRepeat = useMemo(() => {
        return calculateTextureRepeat(canvasWidth, canvasHeight);
    }, [canvasWidth, canvasHeight]);

    // Setup texture properties
    useEffect(() => {
        if (!patternTexture) return;
        
        patternTexture.wrapS = THREE.RepeatWrapping;
        patternTexture.wrapT = THREE.RepeatWrapping;
        patternTexture.repeat.set(textureRepeat[0], textureRepeat[1]);
        patternTexture.offset.set(0, 0);
        patternTexture.flipY = false;
        patternTexture.magFilter = THREE.LinearFilter;
        patternTexture.minFilter = THREE.LinearMipmapLinearFilter;
        patternTexture.needsUpdate = true;
    }, [patternTexture, textureRepeat]);

    const material = useMemo(() => {
        if (!patternTexture) {
            return new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                metalness: 0.1,
                roughness: 0.8,
                side: THREE.DoubleSide,
            });
        }
        
        return new THREE.MeshStandardMaterial({
            map: patternTexture,
            metalness: 0.1,
            roughness: 0.8,
            side: THREE.DoubleSide,
        });
    }, [patternTexture]);

    const meshNames = useMemo(() => {
        if (!nodes) return [];
        return Object.keys(nodes).filter(name => nodes[name]?.geometry);
    }, [nodes]);

    // Upgrade pattern ke high resolution
    useEffect(() => {
        if (!patternUrl) return;
        
        const sourceImage = new Image();
        sourceImage.crossOrigin = 'anonymous';
        
        sourceImage.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = Math.min(canvasWidth * 2, 4096);
                canvas.height = Math.min(canvasHeight * 2, 4096);
                const ctx = canvas.getContext('2d');
                ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
                const highResUrl = canvas.toDataURL('image/png');
                setHighResPattern(highResUrl);
            } catch (error) {
                console.error('Error creating high res pattern:', error);
            }
        };
        
        sourceImage.onerror = (error) => {
            console.error('Error loading pattern image:', error);
        };
        
        sourceImage.src = patternUrl;
    }, [patternUrl, canvasWidth, canvasHeight]);

    // Fit camera to model dengan distance multiplier
    useEffect(() => {
        if (groupRef.current && cameraControlsRef.current && modelLoaded) {
            try {
                setTimeout(() => {
                    const controls = cameraControlsRef.current;
                    const group = groupRef.current;
                    
                    if (controls && group) {
                        // Hitung bounding box untuk mendapatkan ukuran model
                        const box = new THREE.Box3().setFromObject(group);
                        const size = box.getSize(new THREE.Vector3());
                        const center = box.getCenter(new THREE.Vector3());
                        
                        // Fit dengan padding berdasarkan cameraDistance config
                        const maxDim = Math.max(size.x, size.y, size.z);
                        const fov = controls.camera.fov * (Math.PI / 180);
                        const cameraZ = Math.abs(maxDim / Math.tan(fov / 2)) * modelConfig.cameraDistance;
                        
                        // Set posisi kamera
                        controls.setLookAt(
                            center.x, 
                            center.y, 
                            center.z + cameraZ,
                            center.x, 
                            center.y, 
                            center.z,
                            true
                        );
                        
                        console.log('Camera fitted to model:', modelConfig.label, 'distance:', cameraZ);
                    }
                }, 300);
            } catch (error) {
                console.error('Error fitting camera:', error);
            }
        }
    }, [modelLoaded, cameraControlsRef, modelConfig]);

    if (!nodes || meshNames.length === 0) {
        return <group>Loading model geometry...</group>;
    }

    return (
        <group 
            ref={groupRef} 
            dispose={null}
            position={modelConfig.position}
        >
            {meshNames.map(name => (
                <mesh
                    key={name}
                    geometry={nodes[name].geometry}
                    material={material}
                />
            ))}
        </group>
    );
}

// Komponen utama untuk viewer 3D dengan tombol kontrol
function MockupViewer3D({ patternUrl, canvasWidth = 800, canvasHeight = 600 }) {
    const cameraControlsRef = useRef();
    const [selectedModel, setSelectedModel] = useState(MODEL_LIST[0]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Debug log saat component mount
    useEffect(() => {
        console.log('=== MOCKUP VIEWER 3D PROPS ===');
        console.log('Canvas Width:', canvasWidth);
        console.log('Canvas Height:', canvasHeight);
        console.log('Pattern URL length:', patternUrl?.length || 0);
    }, [canvasWidth, canvasHeight, patternUrl]);

    const handleModelReady = useCallback(() => {
        console.log('Model ready, hiding loading indicator');
        setLoading(false);
    }, []);

    const handleModelChange = useCallback((model) => {
        console.log('Changing model to:', model.label);
        setLoading(true);
        setError(null);
        setSelectedModel(model);
    }, []);

    const handleResetCamera = useCallback(() => {
        if (cameraControlsRef.current) {
            cameraControlsRef.current.reset(true);
        }
    }, []);

    // Auto-hide loading setelah 3 detik jika tidak ada callback
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (loading) {
                console.log('Auto-hiding loading after timeout');
                setLoading(false);
            }
        }, 3000);

        return () => clearTimeout(timeout);
    }, [loading, selectedModel]);

    return (
        <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg relative overflow-hidden">
            {/* Info Canvas Size */}
            <div className="absolute top-4 right-4 z-50 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
                <p className="text-xs font-medium text-gray-700">
                    Canvas: {canvasWidth} × {canvasHeight}px
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    Pattern: {patternUrl ? 'Loaded' : 'No pattern'}
                </p>
            </div>

            {/* Dropdown model */}
            <div className="absolute top-4 left-4 z-50 grid grid-cols-2 gap-2">
                {MODEL_LIST.map(model => (
                    <button
                        key={model.value}
                        type="button"
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg transition-all font-medium ${
                            selectedModel.value === model.value 
                                ? 'bg-[#BA682A] text-white shadow-md' 
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handleModelChange(model)}
                    >
                        {model.label}
                    </button>
                ))}
            </div>

            {/* Reset Camera Button */}
            <div className="absolute bottom-4 right-4 z-50">
                <button
                    onClick={handleResetCamera}
                    className="px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg shadow-md hover:bg-white transition-all font-medium"
                    title="Reset Camera"
                >
                    🔄 Reset View
                </button>
            </div>

            {/* Controls Info */}
            <div className="absolute bottom-4 left-4 z-50 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
                <p className="text-xs text-gray-600 font-medium">
                    🖱️ Drag: Rotate | Scroll: Zoom | Right-click: Pan
                </p>
            </div>

            {/* Loading indicator */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/20 backdrop-blur-sm">
                    <div className="bg-white px-8 py-4 rounded-xl shadow-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 border-3 border-[#BA682A] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm font-medium text-gray-700">Loading 3D Model...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/20">
                    <div className="bg-red-50 border border-red-200 px-6 py-4 rounded-xl shadow-xl">
                        <p className="text-sm font-medium text-red-700">{error}</p>
                        <button 
                            onClick={() => {
                                setError(null);
                                setLoading(true);
                            }}
                            className="mt-2 px-4 py-1 bg-red-600 text-white rounded-lg text-xs"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Canvas 3D */}
            <Canvas>
                <Suspense 
                    fallback={
                        <mesh>
                            <boxGeometry args={[1, 1, 1]} />
                            <meshStandardMaterial color="#cccccc" />
                        </mesh>
                    }
                >
                    <Model
                        patternUrl={patternUrl}
                        cameraControlsRef={cameraControlsRef}
                        modelConfig={selectedModel}
                        canvasWidth={canvasWidth}
                        canvasHeight={canvasHeight}
                        onLoadComplete={handleModelReady}
                    />
                </Suspense>
                
                {/* Lighting */}
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 10, 5]} intensity={2} />
                <hemisphereLight intensity={1} groundColor="white" />
                
                {/* Camera Controls */}
                <CameraControls ref={cameraControlsRef} />
            </Canvas>
        </div>
    );
}

// Export default
export default MockupViewer3D;

// Preload all models untuk performa lebih baik
MODEL_LIST.forEach(model => {
    useGLTF.preload(model.file);
});