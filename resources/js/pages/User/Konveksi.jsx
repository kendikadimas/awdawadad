import UserLayout from '@/layouts/User/Layout';
import { Search, ChevronDown, MapPin, Star, CheckCircle, Briefcase, Award, Users, TrendingUp, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function Konveksi({ konveksis, stats, filters, locations }) {
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [selectedLocation, setSelectedLocation] = useState(filters.location || 'all');
  const [loading, setLoading] = useState(false);

  const statsCards = [
    {
      title: 'Total Partner',
      value: stats.total_partners.toString(),
      subtitle: 'Partner Konveksi',
      color: '#BA682A',
      icon: <Briefcase className="w-8 h-8 text-white" />
    },
    {
      title: 'Terverifikasi',
      value: stats.verified_partners.toString(),
      subtitle: 'Partner Verified',
      color: '#FF8C42',
      icon: <Award className="w-8 h-8 text-white" />
    },
    {
      title: 'Lokasi',
      value: stats.total_locations.toString(),
      subtitle: 'Daerah',
      color: '#82C341',
      icon: <Users className="w-8 h-8 text-white" />
    },
    {
      title: 'Rating Rata-rata',
      value: stats.average_rating.toString(),
      subtitle: 'Rating',
      color: '#FFD23F',
      icon: <TrendingUp className="w-8 h-8 text-white" />
    }
  ];

  const handleSearch = () => {
    setLoading(true);
    router.get('/konveksi', {
      search: searchQuery,
      location: selectedLocation !== 'all' ? selectedLocation : null,
    }, {
      preserveState: true,
      onFinish: () => setLoading(false)
    });
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    setLoading(true);
    router.get('/konveksi', {
      search: searchQuery,
      location: location !== 'all' ? location : null,
    }, {
      preserveState: true,
      onFinish: () => setLoading(false)
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <UserLayout title="Konveksi">
      <div className="mb-8">
        <p className="text-gray-600">
          Realisasikan ide yang ada kembankan dan menjadi kenyataan
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-4xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#BA682A' }} />
          <input
            type="text"
            placeholder="Jelajahi keragaman batik nusantara"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-12 pr-6 py-4 border-2 rounded-2xl text-lg focus:outline-none focus:border-[#BA682A] transition-colors"
            style={{ borderColor: '#BA682A' }}
          />
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative">
          <select 
            value={selectedLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl appearance-none bg-white focus:outline-none focus:border-[#BA682A] transition-colors text-gray-700"
          >
            <option value="all">Semua Lokasi</option>
            {locations.map((location) => (
              <option key={location.value} value={location.value}>
                {location.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
        
        <div className="relative">
          <select className="w-full px-4 py-3 border-2 rounded-xl appearance-none bg-white focus:outline-none focus:border-[#BA682A] transition-colors text-gray-700">
            <option>Rating & Ulasan</option>
            <option value="4.5">4.5+ Rating</option>
            <option value="4.0">4.0+ Rating</option>
            <option value="3.5">3.5+ Rating</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select className="w-full px-4 py-3 border-2 rounded-xl appearance-none bg-white focus:outline-none focus:border-[#BA682A] transition-colors text-gray-700">
            <option>Status Verifikasi</option>
            <option value="verified">Terverifikasi</option>
            <option value="all">Semua</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BA682A] mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data konveksi...</p>
        </div>
      )}

      {/* Konveksi Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {konveksis.data.map((konveksi) => (
          <div
            key={konveksi.id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:-translate-y-2 border border-gray-100"
          >
            {/* Header with verification */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-xl text-gray-800 group-hover:text-[#BA682A] transition-colors">
                      {konveksi.name}
                    </h3>
                    {konveksi.is_verified && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Bermitra
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Documentation Image */}
              <div className="mb-4 relative group/image">
                <div className="aspect-video w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
                  <img
                    src={konveksi.documentation_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop'}
                    alt={`Dokumentasi ${konveksi.name}`}
                    className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
                </div>
                {/* Optional: Overlay with "View More" text */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                    Lihat Portfolio
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4">
                {konveksi.description}
              </p>

              {/* Location and Rating */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-sm" style={{ color: '#BA682A' }}>
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{konveksi.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-800">{konveksi.rating}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                <Phone className="w-4 h-4" style={{ color: '#BA682A' }} />
                <span>{konveksi.no_telp}</span>
              </div>

              {/* Action Button */}
              <button
                onClick={() => router.visit(`/konveksi/${konveksi.id}`)}
                className="w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-300 hover:shadow-lg"
                style={{ backgroundColor: '#BA682A' }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#9d5a24';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#BA682A';
                }}
              >
                Lihat Detail Konveksi
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {konveksis.links && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            {konveksis.links.map((link, index) => (
              <button
                key={index}
                onClick={() => link.url && router.visit(link.url)}
                disabled={!link.url}
                className={`px-4 py-2 rounded-lg ${
                  link.active 
                    ? 'bg-[#BA682A] text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        </div>
      )}
    </UserLayout>
  );
}