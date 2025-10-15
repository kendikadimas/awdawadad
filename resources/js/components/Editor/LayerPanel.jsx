import React from 'react';
import { Image as ImageIcon, Brush as BrushIcon, Trash2, Eye, EyeOff } from 'lucide-react';

export default function LayerPanel({ objects = [], selectedId, onSelect, onClear }) {
    if (!objects || objects.length === 0) {
        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">Layers</h3>
                </div>
                <div className="text-center py-8 text-gray-400 text-sm">
                    Belum ada layer
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Layers ({objects.length})</h3>
                <button 
                    onClick={onClear}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                    title="Clear All"
                >
                    <Trash2 size={14} />
                    Clear
                </button>
            </div>
            
            <div className="space-y-1 max-h-64 overflow-y-auto">
                {objects.map((obj, index) => {
                    // Safely get dimensions dengan fallback
                    const width = typeof obj.width === 'number' && !isNaN(obj.width) ? Math.round(obj.width) : 0;
                    const height = typeof obj.height === 'number' && !isNaN(obj.height) ? Math.round(obj.height) : 0;
                    
                    return (
                        <div 
                            key={obj.id} 
                            className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition ${
                                selectedId === obj.id 
                                    ? 'bg-[#F5E7D8] border-l-2 border-[#BA682A]' 
                                    : 'bg-white hover:bg-gray-50'
                            }`}
                            onClick={() => onSelect(obj.id)}
                        >
                            {/* Icon berdasarkan tipe */}
                            {obj.tool === 'brush' || obj.tool === 'pencil' ? (
                                <BrushIcon className="w-4 h-4 text-[#BA682A] flex-shrink-0" />
                            ) : (
                                <ImageIcon className="w-4 h-4 text-[#BA682A] flex-shrink-0" />
                            )}
                            
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-700 truncate">
                                    {obj.name || `Layer ${index + 1}`}
                                </div>
                                {/* Tampilkan dimensi hanya untuk image, bukan brush strokes */}
                                {obj.type === 'image' && width > 0 && height > 0 && (
                                    <div className="text-xs text-gray-400">
                                        {width} × {height} px
                                    </div>
                                )}
                                {(obj.tool === 'brush' || obj.tool === 'pencil') && (
                                    <div className="text-xs text-gray-400">
                                        Brush Stroke
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}