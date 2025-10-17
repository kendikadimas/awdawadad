import UserLayout from '@/layouts/User/Layout';
import { Link, router, usePage } from '@inertiajs/react';
import {
  Plus,
  Filter,
  Grid3X3,
  List,
  Heart,
  Edit3,
  Download,
  Share2,
  Search,
  Trash2
} from 'lucide-react';
import { useState } from 'react';

export default function Dashboard({ designs = [] }) {
  const { auth } = usePage().props;
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState(0);
  const [showCanvasModal, setShowCanvasModal] = useState(false);
  const [customSize, setCustomSize] = useState({ width: 800, height: 600 });
  const user = auth.user;

  const filterItems = ['Semua', 'Terbaru', 'Favorit', 'Draft'];

  const canvasPresets = [
    { label: '1:1 (800×800)', width: 800, height: 800 },
    { label: '3:4 (900×1200)', width: 900, height: 1200 },
    { label: '4:3 (1200×900)', width: 1200, height: 900 },
    { label: '16:9 (1600×900)', width: 1600, height: 900 },
  ];

  // Filter designs berdasarkan search term
  const filteredDesigns = designs.filter(design =>
    design.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (designId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus desain ini?')) {
      router.delete(`/designs/${designId}`, {
        onSuccess: () => {
          alert('Desain berhasil dihapus');
        },
        onError: () => {
          alert('Gagal menghapus desain');
        }
      });
    }
  };

  const handleDownload = (design) => {
    if (design.image_url) {
      const link = document.createElement('a');
      link.href = design.image_url;
      link.download = `${design.title}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const openEditor = (width, height) => {
    setShowCanvasModal(false);
    router.visit(`/editor?width=${width}&height=${height}`);
  };

  return (
    <UserLayout title="Batik Saya">
      {/* Header dengan Action Cards */}
      <div className="flex justify-between items-start mb-6">
        <div>
          {/* Judul 'Batik Saya' sekarang akan ditampilkan oleh Layout dari prop 'title' */}
          {/* Tampilkan sapaan di bawahnya */}
          <p className="text-gray-600 text-lg font-regular mb-2">
            Hi, <span className='text-[#BA682A]'>{user.name}</span>! Selamat datang kembali.<br /> Kamu sudah membuat : <span className='text-[#BA682A]'>{filteredDesigns.length} desain</span>
          </p>
        </div>
        
        {/* Action Cards */}
        <div className="flex gap-4">
          {/* Button Buat Batik - TAMPILKAN MODAL */}
          <button
            onClick={() => setShowCanvasModal(true)}
            className="relative overflow-hidden rounded-2xl p-4 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-16 w-48"
            style={{
              background: 'linear-gradient(135deg, #D2691E 0%, #A0522D 100%)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="relative z-10 h-full flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-md">Buat Batik</h3>
              </div>
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-transform group-hover:scale-110"
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                }}
              >
                <Plus className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* Button Generate AI - mengarah ke Batik Generator */}
          <Link
            href="/batik-generator"
            className="relative overflow-hidden rounded-2xl p-4 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-16 w-48 block"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.25)'
            }}
          >
            <div className="relative z-10 h-full flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-md">Generate AI</h3>
              </div>
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-transform group-hover:scale-110"
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                }}
              >
                <img src="/images/icons/ai.svg" alt="AI Icon" className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Filter Section dengan Search */}
      <div className="flex items-center justify-between gap-6 mb-6">
        <div className="flex gap-2">
          {filterItems.map((filter, index) => (
            <button
              key={index}
              onClick={() => setActiveFilter(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                index === activeFilter
                  ? 'bg-[#D2691E] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-gray-700 font-medium">Sort</span>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari desain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#D2691E] focus:border-transparent w-64"
            />
          </div>
          
          <div className="flex bg-white border border-gray-200 rounded-lg p-1">
            <button className="p-2 rounded-md bg-[#D2691E] text-white">
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDesigns.length > 0 ? (
          filteredDesigns.map((design) => (
            <div
              key={design.id}
              className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1 border border-gray-100"
            >
              <div className="relative overflow-hidden">
                <img
                  src={design.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={design.title}
                  className="w-full h-48 object-contain bg-gray-50" // ✅ Ubah dari cover ke contain
                />
                
                {/* Size badge - ✅ TAMPILKAN UKURAN CANVAS */}
                <div className="absolute top-3 left-3">
                  <span className="bg-blue-600/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium">
                    {design.canvas_width || 800} × {design.canvas_height || 600}
                  </span>
                </div>

                {/* Date Tag */}
                <div className="absolute top-3 right-3">
                  <span className="bg-white/90 backdrop-blur-sm text-gray-600 text-xs px-2 py-1 rounded-md font-medium">
                    {new Date(design.updated_at).toLocaleDateString('id-ID')}
                  </span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Hover Buttons */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="flex gap-2">
                    {/* Edit button */}
                    <Link
                      href={`/designs/${design.id}`}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 hover:bg-blue-500 hover:text-white transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    
                    {/* Download button */}
                    <button 
                      onClick={() => handleDownload(design)}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 hover:bg-[#D2691E] hover:text-white transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                    {/* Delete button */}
                    <button 
                      onClick={() => handleDelete(design.id)}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-gray-700 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-2 group-hover:text-[#D2691E] transition-colors">
                  {design.title}
                </h3>
                <p className="text-xs text-gray-500">
                  Terakhir diubah · {new Date(design.updated_at).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada desain</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Tidak ditemukan desain yang sesuai dengan pencarian' : 'Mulai buat desain batik pertama Anda'}
            </p>
            <button
              onClick={() => setShowCanvasModal(true)}
              className="inline-flex items-center px-4 py-2 bg-[#D2691E] hover:bg-[#A0522D] text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Buat Desain Baru
            </button>
          </div>
        )}
      </div>

      {/* Modal Pilih Canvas */}
      {showCanvasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-gray-800">Pilih Ukuran Canvas</h2>
            <p className="text-sm text-gray-600">Pilih ukuran canvas untuk desain batik Anda</p>
            
            <div className="space-y-2">
              {canvasPresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => openEditor(preset.width, preset.height)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-[#D2691E] hover:bg-[#FFF7ED] transition-all text-left group"
                >
                  <span className="font-medium text-gray-800 group-hover:text-[#D2691E]">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2 font-medium">Ukuran Custom (px)</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min={200}
                  max={3000}
                  value={customSize.width}
                  onChange={(e) => setCustomSize((prev) => ({ ...prev, width: Number(e.target.value) }))}
                  className="border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-[#D2691E] focus:outline-none"
                  placeholder="Lebar"
                />
                <input
                  type="number"
                  min={200}
                  max={3000}
                  value={customSize.height}
                  onChange={(e) => setCustomSize((prev) => ({ ...prev, height: Number(e.target.value) }))}
                  className="border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-[#D2691E] focus:outline-none"
                  placeholder="Tinggi"
                />
              </div>
              <button
                onClick={() => openEditor(customSize.width, customSize.height)}
                className="mt-3 w-full px-4 py-2 bg-[#D2691E] text-white rounded-lg hover:bg-[#A0522D] transition font-medium"
              >
                Gunakan ukuran custom
              </button>
            </div>
            
            <button
              onClick={() => setShowCanvasModal(false)}
              className="w-full px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </UserLayout>
  );
}