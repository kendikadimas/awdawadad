// Pages/User/Motif.jsx
import UserLayout from '@/layouts/User/Layout';
import { Search, Grid3X3, List, MapPin, Clock, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function Motif({ motifs: initialMotifs = [], filters = {} }) {
  const [selectedCategory, setSelectedCategory] = useState(filters.category || 'Semua');
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [viewMode, setViewMode] = useState('grid');
  const [motifs, setMotifs] = useState(initialMotifs);

  const filterCategories = ['Semua', 'Tradisional', 'Modern', 'Kontemporer', 'Nusantara'];

  // Function to handle filter changes
  const handleFilterChange = (category = selectedCategory, search = searchQuery) => {
    const params = new URLSearchParams();
    
    if (category !== 'Semua') {
      params.append('category', category);
    }
    
    if (search.trim()) {
      params.append('search', search.trim());
    }

    const queryString = params.toString();
    const url = queryString ? `/motif?${queryString}` : '/motif';
    
    router.get(url, {}, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: (page) => {
        setMotifs(page.props.motifs);
      }
    });
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    handleFilterChange(category, searchQuery);
  };

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== filters.search) {
        handleFilterChange(selectedCategory, searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <UserLayout title="Motif Batik">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold" style={{ color: '#BA682A' }}>
            Galeri Motif Batik
          </h1>
          <div className="text-sm text-gray-500">
            {motifs.length} motif tersedia
          </div>
        </div>
        <p className="text-gray-600 text-lg">
          Jelajahi keindahan dan filosofi di balik setiap motif batik nusantara
        </p>
      </div>

      {/* Enhanced Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {filterCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category
                    ? 'text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: selectedCategory === category ? '#BA682A' : undefined,
                }}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Search and View Controls */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Cari motif batik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#BA682A] focus:border-transparent min-w-[250px] transition-all"
              />
            </div>
            
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white shadow-sm text-[#BA682A]' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white shadow-sm text-[#BA682A]' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Motif Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {motifs.map((motif) => (
          <div
            key={motif.id}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
          >
            {/* Main Image Container */}
            <div className="relative aspect-square overflow-hidden">
              <img
                src={motif.image}
                alt={motif.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Category Badge - Always Visible */}
              <div className="absolute top-4 left-4 z-10">
                <span 
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-white backdrop-blur-md shadow-lg"
                  style={{ backgroundColor: 'rgba(186, 104, 42, 0.9)' }}
                >
                  {motif.category}
                </span>
              </div>

              {/* Time Badge - Always Visible */}
              {/* <div className="absolute top-4 right-4 z-10">
                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/90 text-gray-700 backdrop-blur-md shadow-lg flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {motif.timeAgo}
                </span>
              </div> */}

              {/* Color Palette - Always Visible
              <div className="absolute bottom-4 left-4 z-10 flex gap-1">
                {motif.colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-3 h-3 rounded-full border-2 border-white shadow-lg"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div> */}

              {/* Hover Overlay with Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                
                {/* Title and Description - Only on Hover */}
                <div className="transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-white font-bold text-lg mb-2 drop-shadow-lg">
                    {motif.title}
                  </h3>
                  <p className="text-white/90 text-sm leading-relaxed mb-3 drop-shadow">
                    {motif.description}
                  </p>
                  
                  {/* Location */}
                  <div className="flex items-center gap-2">
                    <div 
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg backdrop-blur-md"
                      style={{ backgroundColor: 'rgba(186, 104, 42, 0.8)' }}
                    >
                      <MapPin className="w-4 h-4 text-white" />
                      <span className="text-white font-medium text-sm">{motif.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Load More Section */}
      {motifs.length > 0 && (
        <div className="text-center mt-12">
          <button 
            className="inline-flex items-center gap-3 px-8 py-4 text-white font-semibold rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 transform"
            style={{ backgroundColor: '#BA682A' }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#9d5a24';
              e.target.style.transform = 'translateY(-4px) scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#BA682A';
              e.target.style.transform = 'translateY(0) scale(1)';
            }}
          >
            <Filter className="w-5 h-5" />
            Jelajahi Lebih Banyak Motif
          </button>
          <p className="text-gray-500 text-sm mt-3">
            Temukan ribuan motif batik lainnya dari seluruh nusantara
          </p>
        </div>
      )}

      {/* Empty State */}
      {motifs.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Motif tidak ditemukan
          </h3>
          <p className="text-gray-500">
            Coba ubah kata kunci pencarian atau filter kategori
          </p>
        </div>
      )}
    </UserLayout>
  );
}