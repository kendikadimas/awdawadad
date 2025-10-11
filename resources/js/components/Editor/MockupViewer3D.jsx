import React, { Suspense, useRef, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { CameraControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Daftar model yang tersedia
const MODEL_LIST = [
    { label: 'Kemeja', value: 'kemeja', file: '/models/white_shirt.glb', textureRepeat: [3, 3] },
    { label: 'Kaos', value: 'kaos', file: '/models/kaos.glb', textureRepeat: [2.5, 2.5] },
    { label: 'Polo', value: 'polo', file: '/models/polo.glb', textureRepeat: [3, 3] },
    { label: 'Dress', value: 'dress', file: '/models/dress.glb', textureRepeat: [4, 4] },
    // Tambahkan model lain di sini
];

// Komponen untuk memuat model dan secara otomatis memposisikan kamera
function Model({ patternUrl, cameraControlsRef, modelFile }) {
    const { nodes } = useGLTF(modelFile);
    const groupRef = useRef();
    const textureNeedsUpdate = useRef(true);
    const [highResPattern, setHighResPattern] = React.useState(patternUrl);

    const patternTexture = useLoader(THREE.TextureLoader, highResPattern);

    patternTexture.wrapS = THREE.ClampToEdgeWrapping;
    patternTexture.wrapT = THREE.ClampToEdgeWrapping;
    patternTexture.repeat.set(1, 1);
    patternTexture.offset.set(0, 0);
    patternTexture.flipY = true;

    patternTexture.magFilter = THREE.LinearFilter;
    patternTexture.minFilter = THREE.LinearMipmapLinearFilter;

    const material = new THREE.MeshStandardMaterial({
        map: patternTexture,
        metalness: 0.1,
        roughness: 0.8,
        side: THREE.DoubleSide,
    });

    const meshNames = Object.keys(nodes).filter(name => nodes[name]?.geometry);

    useEffect(() => {
        if (!patternUrl) return;
        const sourceImage = new Image();
        sourceImage.crossOrigin = 'anonymous';
        sourceImage.src = patternUrl;
        sourceImage.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 2048;
            canvas.height = 2048;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
            const highResUrl = canvas.toDataURL('image/png');
            setHighResPattern(highResUrl);
        };
    }, [patternUrl]);

    useEffect(() => {
        if (groupRef.current && cameraControlsRef.current) {
            // Fungsi ini akan otomatis mengatur posisi dan zoom kamera agar pas dengan model
            cameraControlsRef.current.fitToBox(groupRef.current, true);
        }
    }, [nodes, cameraControlsRef]);

    return (
        <group ref={groupRef} dispose={null}>
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
export default function MockupViewer3D({ patternUrl }) {
    const cameraControlsRef = useRef();
    const [selectedModel, setSelectedModel] = React.useState(MODEL_LIST[0]);
    const [loading, setLoading] = React.useState(true);

    // Fungsi untuk mengubah sudut pandang kamera
    const setView = (position) => {
        if (cameraControlsRef.current) {
            // Posisi Kamera [x, y, z], Target Kamera [x, y, z]
            const [camX, camY, camZ] = position;
            cameraControlsRef.current.setLookAt(camX, camY, camZ, 0, 0, 0, true);
        }
    };

    const handleModelReady = useCallback(
        (mesh) => {
            const controls = cameraControlsRef.current;
            if (!mesh || !controls || typeof controls.fitToBox !== 'function') return;

            controls.fitToBox(mesh, true);
            setLoading(false);
        },
        []
    );

    return (
        <div className="w-full h-full bg-gray-400 rounded-lg relative z-0">
            {/* Dropdown model */}
            <div className="absolute top-4 left-4 z-50 grid grid-cols-2 gap-2">
                {MODEL_LIST.map(model => (
                    <button
                        key={model.value}
                        type="button"
                        className={`px-4 py-2 rounded-lg ${selectedModel.value === model.value ? 'bg-[#BA682A] text-white' : 'bg-white text-black border-none hover:bg-[#B5B5B5]'}`}
                        onClick={() => setSelectedModel(model)}
                    >
                        {model.label}
                    </button>
                ))}
            </div>
            <Canvas>
                <Suspense fallback={null}>
                    <Model
                        patternUrl={patternUrl}
                        cameraControlsRef={cameraControlsRef}
                        modelFile={selectedModel.file}
                        onModelReady={handleModelReady}
                    />
                </Suspense>
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 10, 5]} intensity={2} />
                <hemisphereLight intensity={1} groundColor="white" />
                <CameraControls ref={cameraControlsRef} />
            </Canvas>
            {/* Tombol Kontrol Kamera */}
            {/* <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-70 backdrop-blur-sm p-2 rounded-lg flex gap-2 shadow-lg">
                <button onClick={() => setView([0, 0, 0])} className="px-3 py-1 rounded hover:bg-gray-200">Depan</button>
                <button onClick={() => setView([0, Math.PI, 0])} className="px-3 py-1 rounded hover:bg-gray-200">Belakang</button>
                <button onClick={() => setView([0, Math.PI / 2, 0])} className="px-3 py-1 rounded hover:bg-gray-200">Kiri</button>
                <button onClick={() => setView([0, -Math.PI / 2, 0])} className="px-3 py-1 rounded hover:bg-gray-200">Kanan</button>
                <button onClick={() => setView([-Math.PI / 4, 0, 0])} className="px-3 py-1 rounded hover:bg-gray-200">Atas</button>
            </div> */}
        </div>
    );
}