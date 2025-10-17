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
            <div>
                <h3 className="font-bold text-[#BA682A] mb-3 text-lg">Properti Objek</h3>
                <p className="text-sm text-gray-500">Pilih objek di canvas untuk mengedit propertinya.</p>
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
            <h3 className="font-bold text-[#BA682A] mb-4 text-lg">Properti Objek</h3>
            
            <div className="space-y-3">
                <div className="text-xs text-gray-500 font-medium mb-2">POSISI</div>
                <PropertyInput 
                    label="X" 
                    value={selectedObject.x} 
                    onChange={val => handleUpdate('x', val)} 
                />
                <PropertyInput 
                    label="Y" 
                    value={selectedObject.y} 
                    onChange={val => handleUpdate('y', val)} 
                />
                
                <hr className="my-3 border-gray-200" />
                
                <div className="text-xs text-gray-500 font-medium mb-2">DIMENSI</div>
                <PropertyInput 
                    label="Lebar" 
                    value={selectedObject.width} 
                    onChange={val => handleUpdate('width', val)} 
                />
                <PropertyInput 
                    label="Tinggi" 
                    value={selectedObject.height} 
                    onChange={val => handleUpdate('height', val)} 
                />
                
                <hr className="my-3 border-gray-200" />
                
                <div className="text-xs text-gray-500 font-medium mb-2">TRANSFORMASI</div>
                <PropertyInput 
                    label="Rotasi (°)" 
                    value={selectedObject.rotation} 
                    onChange={val => handleUpdate('rotation', val)} 
                />
            </div>
        </div>
    );
}