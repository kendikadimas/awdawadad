import React from 'react';

export default function LayerPanel({
    imageLayers = [],
    brushLayers = [],
    selectedId,
    onSelect,
    onRename,
    onToggle,
}) {
    const renderLayer = (layer, icon) => (
        <div
            key={layer.id}
            className={`flex items-center justify-between px-3 py-2 rounded ${
                selectedId === layer.id ? 'bg-[#F5E7D8]' : 'bg-white'
            }`}
        >
            <button
                type="button"
                className="flex items-center gap-2 text-left"
                onClick={() => onSelect?.(layer.id)}
            >
                {icon}
                <input
                    className="bg-transparent text-sm font-medium border-none focus:outline-none"
                    value={layer.name}
                    onChange={(e) => onRename?.(layer.id, e.target.value)}
                />
            </button>
            <button
                type="button"
                onClick={() => onToggle?.(layer.id)}
                className="text-xs text-[#BA682A]"
            >
                {layer.visible ? 'Hide' : 'Show'}
            </button>
        </div>
    );

    return (
        <div className="space-y-2">
            {imageLayers.map((layer) => renderLayer(layer, <ImageIcon className="w-4 h-4 text-[#BA682A]" />))}
            {brushLayers.map((layer) => renderLayer(layer, <BrushIcon className="w-4 h-4 text-[#BA682A]" />))}
        </div>
    );
}