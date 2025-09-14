import React from 'react';

// Komponen kecil untuk input properti
const PropertyInput = ({ label, value, onChange, type = 'number' }) => (
    <div className="flex items-center justify-between mb-2">
        <label className="text-sm text-gray-600">{label}</label>
        <input
            type={type}
            value={Math.round(value) || 0}
            onChange={e => onChange(parseFloat(e.target.value))}
            className="w-24 p-1 border rounded text-right text-black"
        />
    </div>
);

export default function PropertiesToolbar({ selectedObject, onUpdate }) {
    if (!selectedObject) {
        return (
            <div className='text-[#BA682A]'>
                <h3 className="font-bold mb-4">Properti</h3>
                <p className="text-sm text-gray-500">Pilih sebuah objek di canvas untuk diedit.</p>
            </div>
        );
    }

    const handleUpdate = (prop, value) => {
        if (!isNaN(value)) {
            onUpdate(selectedObject.id, { [prop]: value });
        }
    };

    return (
        <div>
            <h3 className="font-bold mb-4 text-black">Properti Objek</h3>
            <PropertyInput 
                label="Posisi X" 
                value={selectedObject.x} 
                onChange={val => handleUpdate('x', val)} 
            />
            <PropertyInput 
                label="Posisi Y" 
                value={selectedObject.y} 
                onChange={val => handleUpdate('y', val)} 
            />
            <hr className="my-4" />
            <PropertyInput 
                label="Lebar (W)" 
                value={selectedObject.width} 
                onChange={val => handleUpdate('width', val)} 
            />
            <PropertyInput 
                label="Tinggi (H)" 
                value={selectedObject.height} 
                onChange={val => handleUpdate('height', val)} 
            />
            <hr className="my-4" />
            <PropertyInput 
                label="Rotasi (°)" 
                value={selectedObject.rotation} 
                onChange={val => handleUpdate('rotation', val)} 
            />
        </div>
    );
}