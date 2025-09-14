import React from 'react';

export default function LayerPanel({ objects, selectedId, onSelect, onClear }) {
    return (
        <div className="mt-6 text-[#BA682A]">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold">Posisi</h3>
                <button
                    onClick={onClear}
                    className="text-xs text-red-600 hover:text-red-800"
                    title="Hapus semua motif dari canvas"
                >
                    Hapus Semua
                </button>
            </div>
            <div className="bg-gray-100 rounded p-2 max-h-48 overflow-y-auto">
                {objects.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-2">Canvas kosong.</p>
                ) : (
                    // Kita reverse() agar layer teratas muncul di paling atas daftar
                    [...objects].reverse().map(obj => (
                        <div
                            key={obj.id}
                            onClick={() => onSelect(obj.id)}
                            className={`p-2 mb-1 text-sm rounded cursor-pointer transition-colors ${
                                obj.id === selectedId
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white hover:bg-blue-100'
                            }`}
                        >
                            {/* Kita bisa beri nama default atau ambil dari properti objek nantinya */}
                            Motif - {obj.id.substring(3)}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}