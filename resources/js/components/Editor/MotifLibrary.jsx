import { useState } from 'react';
import { Search, RefreshCw, Loader2, X, Info } from 'lucide-react';

export default function MotifLibrary({ motifs = [], loading = false, onRefresh }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredMotif, setHoveredMotif] = useState(null);

    // Filter motifs berdasarkan search query
    const filteredMotifs = motifs.filter(motif => 
        motif.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Clear search
    const clearSearch = () => {
        setSearchQuery('');
    };

    return (
        <div className=''>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#BA682A]">Pustaka Motif</h3>
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Refresh motif"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                        ) : (
                            <RefreshCw className="w-4 h-4 text-gray-600" />
                        )}
                    </button>
                )}
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                <input
                    type="text"
                    placeholder="Cari motif..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-7 pr-7 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#BA682A] focus:border-transparent"
                />
                {searchQuery && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* Search Results Info */}
            {searchQuery && (
                <div className="mb-2 text-xs text-gray-500">
                    {filteredMotifs.length > 0 
                        ? `${filteredMotifs.length} motif ditemukan` 
                        : 'Tidak ada motif yang cocok'
                    }
                </div>
            )}
            
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-500">Memuat motif...</span>
                </div>
            ) : filteredMotifs.length === 0 ? (
                <div className="text-center py-8">
                    {searchQuery ? (
                        <>
                            <p className="text-sm text-gray-500 mb-2">Motif tidak ditemukan</p>
                            <button
                                onClick={clearSearch}
                                className="text-xs text-blue-600 hover:text-blue-800"
                            >
                                Hapus pencarian
                            </button>
                        </>
                    ) : motifs.length === 0 ? (
                        <>
                            <p className="text-sm text-gray-500">Tidak ada motif tersedia</p>
                            {onRefresh && (
                                <button
                                    onClick={onRefresh}
                                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                                >
                                    Coba lagi
                                </button>
                            )}
                        </>
                    ) : null}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2 relative">
                    {filteredMotifs.map((motif, index) => (
                        <div 
                            key={motif.id}
                            className="relative border border-gray-200 p-2 cursor-pointer hover:border-[#BA682A] hover:shadow-sm transition-all rounded-lg group"
                            onDragStart={(e) => {
                                e.dataTransfer.setData('application/json', JSON.stringify(motif));
                            }}
                            onMouseEnter={() => setHoveredMotif(motif.id)}
                            onMouseLeave={() => setHoveredMotif(null)}
                            draggable
                        >
                            <div className="relative">
                                <img 
                                    src={motif.preview_image_path} 
                                    alt={motif.name} 
                                    className="w-full h-20 object-cover rounded group-hover:scale-105 transition-transform"
                                    onError={(e) => {
                                        e.target.src = '/images/placeholder-motif.svg';
                                    }}
                                />
                                
                                {/* Info Icon - muncul saat hover */}
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-black/70 rounded-full p-1">
                                        <Info className="w-3 h-3 text-white" />
                                    </div>
                                </div>

                                {/* Tooltip Bubble - muncul di luar card */}
                                {hoveredMotif === motif.id && (
                                    <div className={`absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-48
                                        ${index % 2 === 0 ? 'left-full ml-2' : 'right-full mr-2'} top-0
                                        before:content-[''] before:absolute before:top-4 
                                        ${index % 2 === 0 
                                            ? 'before:left-0 before:-translate-x-1 before:border-r-gray-200 before:border-r-4' 
                                            : 'before:right-0 before:translate-x-1 before:border-l-gray-200 before:border-l-4'
                                        }
                                        before:border-t-4 before:border-b-4 before:border-t-transparent before:border-b-transparent
                                        animate-in fade-in-0 zoom-in-95 duration-150`}
                                    >
                                        {/* Arrow pointer */}
                                        <div className={`absolute top-4 w-0 h-0 
                                            ${index % 2 === 0 
                                                ? 'left-0 -translate-x-full border-r-8 border-r-white' 
                                                : 'right-0 translate-x-full border-l-8 border-l-white'
                                            }
                                            border-t-4 border-b-4 border-t-transparent border-b-transparent`}>
                                        </div>

                                        <div className="text-gray-800">
                                            <h4 className="font-semibold text-sm mb-2 text-[#BA682A]">
                                                {motif.name}
                                            </h4>
                                            {motif.description && (
                                                <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                                                    {motif.description.length > 80 
                                                        ? motif.description.substring(0, 80) + '...' 
                                                        : motif.description
                                                    }
                                                </p>
                                            )}
                                            {motif.category && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500">Kategori:</span>
                                                    <span className="inline-block bg-[#BA682A] text-white px-2 py-1 rounded-full text-xs font-medium">
                                                        {motif.category}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Stats */}
            {!loading && motifs.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                        Total: {motifs.length} motif tersedia
                    </p>
                    <p className="text-xs text-gray-400 text-center mt-1">
                        Hover untuk detail motif
                    </p>
                </div>
            )}
        </div>
    );
}