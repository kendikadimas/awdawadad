
import { useState } from 'react';
import UserLayout from '@/layouts/User/Layout';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  MessageCircle, 
  Phone, 
  Mail, 
  HelpCircle,
  Clock,
  CheckCircle,
  Filter,
  X,
  Star,
  Users,
  BookOpen,
  Award
} from 'lucide-react';

export default function Bantuan() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const faqData = [
    {
      id: 1,
      category: 'Batik & Motif',
      question: 'Apa perbedaan antara Batik Tulis, Cap, dan Printing?',
      answer: 'Batik Tulis dilukis tangan menggunakan canting dan malam, proses pembuatan sangat detail dan membutuhkan waktu lama sehingga harga lebih tinggi namun sangat eksklusif. Batik Cap menggunakan stempel tembaga dengan motif tertentu, lebih cepat dari tulis namun tetap berkualitas. Batik Printing dicetak menggunakan mesin dengan teknik sablon, paling terjangkau dan cocok untuk produksi massal.',
      popularity: 5,
      tags: ['batik tulis', 'batik cap', 'batik printing', 'perbedaan']
    },
    {
      id: 2,
      category: 'Batik & Motif',
      question: 'Bagaimana cara merawat kain batik agar awet?',
      answer: 'Cuci batik dengan air dingin atau suam-suam kuku, gunakan deterjen khusus atau yang lembut tanpa pemutih. Hindari meremas terlalu kuat, cukup ditekan-tekan lembut. Jemur di tempat teduh, hindari sinar matahari langsung. Setrika dengan suhu rendah-sedang dan gunakan kain pelapis. Simpan di tempat kering dengan gantungan atau lipat rapi dengan tisu bebas asam.',
      popularity: 5,
      tags: ['perawatan', 'cuci', 'setrika', 'penyimpanan']
    },
    {
      id: 3,
      category: 'Batik & Motif',
      question: 'Motif batik mana yang cocok untuk acara formal?',
      answer: 'Untuk acara formal, pilih motif klasik seperti Parang (melambangkan kekuatan), Kawung (filosofi kesempurnaan), Truntum (kasih sayang abadi), atau Sido Mukti (kebahagiaan dan kemakmuran). Pilih warna yang tidak terlalu mencolok seperti coklat, navy, hitam, atau maroon. Hindari motif yang terlalu ramai atau warna-warna cerah seperti pink atau kuning.',
      popularity: 4,
      tags: ['formal', 'motif klasik', 'parang', 'kawung', 'acara resmi']
    },
    {
      id: 4,
      category: 'Layanan',
      question: 'Apakah Larasena melayani pengiriman internasional?',
      answer: 'Ya, kami melayani pengiriman ke berbagai negara di Asia Tenggara, Australia, Amerika, dan Eropa. Biaya pengiriman bervariasi mulai dari Rp 150.000 untuk Asia Tenggara hingga Rp 500.000 untuk Eropa/Amerika. Waktu pengiriman 7-21 hari kerja tergantung destinasi. Semua pengiriman internasional menggunakan tracking number dan asuransi.',
      popularity: 4,
      tags: ['internasional', 'ekspor', 'ongkir', 'tracking']
    },
    {
      id: 5,
      category: 'Layanan',
      question: 'Berapa lama waktu pembuatan batik custom?',
      answer: 'Waktu pembuatan bervariasi: Batik tulis custom 3-6 minggu (tergantung detail motif), Batik cap custom 1-3 minggu, Batik printing custom 5-10 hari kerja, Batik kombinasi tulis-cap 2-4 minggu. Untuk order mendadak tersedia layanan rush dengan biaya tambahan 30-50%. Kami akan memberikan update progress secara berkala.',
      popularity: 5,
      tags: ['custom', 'waktu', 'pembuatan', 'rush order']
    },
    {
      id: 6,
      category: 'Kemitraan',
      question: 'Bagaimana cara menjadi mitra atau pemasok Larasena?',
      answer: 'Untuk menjadi mitra, Anda harus memenuhi kriteria: memiliki pengalaman minimal 2 tahun di bidang batik, kapasitas produksi minimal 100 pieces/bulan, kualitas konsisten, dan berkomitmen pada deadlines. Proses aplikasi meliputi pengajuan portofolio, sample testing, audit fasilitas, dan kontrak kemitraan. Benefit mitra termasuk training, bantuan marketing, dan pembayaran tepat waktu.',
      popularity: 3,
      tags: ['mitra', 'supplier', 'kerjasama', 'partnership']
    },
    {
      id: 7,
      category: 'Konveksi',
      question: 'Apa minimum order untuk layanan konveksi?',
      answer: 'Minimum order untuk konveksi: Batik printing 50 pcs per desain, Batik cap 30 pcs per desain, Batik tulis 10 pcs per desain. Untuk order 100+ pcs diskon 10%, 500+ pcs diskon 20%, 1000+ pcs diskon 30%. Tersedia paket komplit termasuk desain, cutting, sewing, finishing, packaging, dan label custom. Free ongkir untuk order 200+ pcs area Jawa.',
      popularity: 5,
      tags: ['minimum order', 'konveksi', 'diskon', 'bulk order']
    },
    {
      id: 8,
      category: 'Konveksi',
      question: 'Bisa menggunakan desain sendiri untuk konveksi?',
      answer: 'Ya, Anda bisa menggunakan desain sendiri. Format file yang diterima: AI, PSD, PDF, atau JPG/PNG resolusi tinggi (300 DPI minimum). Tim desainer kami akan review dan memberikan feedback untuk optimalisasi produksi. Jika diperlukan penyesuaian teknis, kami akan konsultasikan terlebih dahulu. Tersedia juga layanan digitalisasi desain manual dengan biaya tambahan Rp 50.000-200.000 per desain.',
      popularity: 4,
      tags: ['desain custom', 'file format', 'konsultasi desain']
    },
    {
      id: 9,
      category: 'Pembayaran',
      question: 'Metode pembayaran apa saja yang diterima?',
      answer: 'Metode pembayaran yang tersedia: Transfer bank (BCA, Mandiri, BNI, BRI), Kartu kredit/debit (Visa, Mastercard), E-wallet (OVO, GoPay, Dana, ShopeePay, LinkAja), QRIS, Virtual account, dan COD (area tertentu). Untuk order 5+ juta tersedia cicilan 0% hingga 12 bulan. Pembayaran internasional melalui PayPal atau Wise. Down payment minimal 30% untuk custom order.',
      popularity: 4,
      tags: ['pembayaran', 'transfer', 'cicilan', 'international payment']
    },
    {
      id: 10,
      category: 'Pembayaran',
      question: 'Apakah ada garansi untuk produk batik?',
      answer: 'Ya, kami memberikan garansi komprehensif: Garansi kualitas 30 hari (jika ada cacat produksi), Garansi warna luntur 60 hari untuk batik tulis/cap, Garansi ukuran tidak sesuai dapat tukar dalam 14 hari, Return policy jika tidak sesuai ekspektasi dalam 7 hari (produk belum dipakai). Untuk custom order, revision unlimited hingga approved. Semua garansi dengan syarat dan ketentuan yang berlaku.',
      popularity: 3,
      tags: ['garansi', 'return', 'kualitas', 'after sales']
    },
    {
      id: 11,
      category: 'Batik & Motif',
      question: 'Bagaimana cara membedakan batik asli dan palsu?',
      answer: 'Ciri batik asli: motif tembus ke kedua sisi kain, warna tidak mudah luntur, tekstur kain berkualitas, jahitan rapi, memiliki sertifikat atau label resmi. Batik tulis asli memiliki garis-garis yang tidak sempurna karena dibuat tangan. Hindari batik dengan harga terlalu murah, motif hanya di satu sisi, atau warna yang terlalu mencolok tidak natural.',
      popularity: 4,
      tags: ['batik asli', 'identifikasi', 'kualitas', 'sertifikat']
    },
    {
      id: 12,
      category: 'Layanan',
      question: 'Apakah bisa mengunjungi workshop atau galeri Larasena?',
      answer: 'Ya, kami memiliki showroom dan workshop di Yogyakarta yang buka untuk kunjungan. Jam operasional Senin-Sabtu 09:00-17:00, Minggu 10:00-15:00. Tersedia tour workshop gratis dengan guide, demo pembuatan batik, dan shopping area. Untuk rombongan 10+ orang mohon reservasi H-3. Lokasi di Jl. Malioboro No. 123, dekat dengan Tugu Yogyakarta.',
      popularity: 3,
      tags: ['kunjungan', 'workshop', 'showroom', 'yogyakarta']
    }
  ];

  const categories = [
    { name: 'Semua', icon: <BookOpen className="w-4 h-4" />, count: faqData.length },
    { name: 'Batik & Motif', icon: <Award className="w-4 h-4" />, count: faqData.filter(f => f.category === 'Batik & Motif').length },
    { name: 'Layanan', icon: <Users className="w-4 h-4" />, count: faqData.filter(f => f.category === 'Layanan').length },
    { name: 'Konveksi', icon: <Star className="w-4 h-4" />, count: faqData.filter(f => f.category === 'Konveksi').length },
    { name: 'Kemitraan', icon: <CheckCircle className="w-4 h-4" />, count: faqData.filter(f => f.category === 'Kemitraan').length },
    { name: 'Pembayaran', icon: <Clock className="w-4 h-4" />, count: faqData.filter(f => f.category === 'Pembayaran').length }
  ];

  const filteredFaq = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'Semua' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => b.popularity - a.popularity);

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('Semua');
  };

  const popularQuestions = faqData.filter(faq => faq.popularity >= 4).slice(0, 3);

  return (
    <UserLayout title="Bantuan">
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#8B4513] to-[#BA682A] text-white py-16 mb-8 rounded-lg">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Pusat Bantuan Larasena</h1>
            <p className="text-xl text-amber-100 max-w-2xl mx-auto">
              Temukan jawaban lengkap untuk semua pertanyaan seputar layanan batik terbaik Indonesia
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-12">
          
      

          {/* Search and Filter Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cari pertanyaan, kata kunci, atau topik tertentu..."
                    className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#BA682A] focus:border-transparent text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
                <button className="px-6 py-3 bg-[#BA682A] text-white rounded-xl hover:bg-[#9d5a24] transition-colors font-medium">
                  Hubungi Support
                </button>
                <button className="px-6 py-3 border border-[#BA682A] text-[#BA682A] rounded-xl hover:bg-[#BA682A] hover:text-white transition-colors font-medium">
                  Tutorial
                </button>
              </div>
            </div>

            {/* Category Filters */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">Filter berdasarkan kategori:</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category.name
                        ? 'bg-[#BA682A] text-white shadow-lg'
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    }`}
                  >
                    {category.icon}
                    <span>{category.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      selectedCategory === category.name 
                        ? 'bg-white/20 text-white' 
                        : 'bg-amber-200 text-amber-700'
                    }`}>
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Popular Questions */}
          {searchQuery === '' && selectedCategory === 'Semua' && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-[#BA682A]" />
                Pertanyaan Populer
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {popularQuestions.map((faq) => (
                  <div key={faq.id} className="bg-white rounded-xl p-6 shadow-sm border border-amber-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-[#BA682A]/10 text-[#BA682A] text-xs rounded-full">
                        {faq.category}
                      </span>
                      <div className="flex text-yellow-400">
                        {[...Array(faq.popularity)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{faq.question}</h3>
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="text-[#BA682A] text-sm font-medium hover:underline"
                    >
                      Baca Jawaban →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ Section - Full Width */}
          <div className="bg-white rounded-2xl shadow-lg border border-amber-200">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-[#BA682A]" />
                    Semua Pertanyaan & Jawaban
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {filteredFaq.length} dari {faqData.length} pertanyaan
                    {searchQuery && (
                      <span className="ml-2 px-2 py-1 bg-[#BA682A]/10 text-[#BA682A] text-xs rounded-full">
                        "{searchQuery}"
                      </span>
                    )}
                  </p>
                </div>
                {filteredFaq.length > 0 && (
                  <div className="text-sm text-gray-500">
                    Diurutkan berdasarkan popularitas
                  </div>
                )}
              </div>
            </div>
            
            {filteredFaq.length === 0 ? (
              <div className="p-12 text-center">
                <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Tidak Ada Hasil</h3>
                <p className="text-gray-500 mb-4">
                  Maaf, tidak ada FAQ yang sesuai dengan pencarian Anda
                </p>
                <button
                  onClick={clearSearch}
                  className="px-6 py-2 bg-[#BA682A] text-white rounded-lg hover:bg-[#9d5a24] transition-colors"
                >
                  Reset Pencarian
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredFaq.map((faq, index) => (
                  <div key={faq.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex items-start justify-between text-left group"
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-[#BA682A]/10 text-[#BA682A] text-xs rounded-full font-medium">
                            {faq.category}
                          </span>
                          <div className="flex text-yellow-400">
                            {[...Array(faq.popularity)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">#{index + 1}</span>
                        </div>
                        <h3 className="font-semibold text-gray-800 text-lg group-hover:text-[#BA682A] transition-colors">
                          {faq.question}
                        </h3>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {faq.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                          {faq.tags.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              +{faq.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        {openFaq === faq.id ? (
                          <ChevronUp className="w-6 h-6 text-[#BA682A]" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-gray-400 group-hover:text-[#BA682A] transition-colors" />
                        )}
                      </div>
                    </button>
                    
                    {openFaq === faq.id && (
                      <div className="mt-6 pt-6 border-t border-gray-100 animate-fadeIn">
                        <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                          <p className="text-gray-700 leading-relaxed text-base">{faq.answer}</p>
                          <div className="mt-4 pt-4 border-t border-amber-200 flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              Apakah jawaban ini membantu?
                            </div>
                            <div className="flex gap-2">
                              <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors">
                                Ya, membantu
                              </button>
                              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                                Perlu bantuan lain
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact Support Section - Enhanced */}
          <div className="mt-8 bg-gradient-to-r from-[#8B4513] to-[#BA682A] rounded-2xl shadow-xl text-white overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Masih Butuh Bantuan Lebih Lanjut?</h3>
                <p className="text-amber-100">
                  Tim customer service profesional kami siap membantu Anda 24/7 dengan solusi terbaik
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Live Chat</h4>
                  <p className="text-amber-100 text-sm mb-4">Respon instan dalam 2-5 menit</p>
                  <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                    Mulai Chat
                  </button>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Telepon</h4>
                  <p className="text-amber-100 text-sm mb-2">0274-123-4567</p>
                  <p className="text-amber-100/80 text-xs mb-4">Senin-Minggu 08:00-22:00</p>
                  <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                    Hubungi Sekarang
                  </button>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Email</h4>
                  <p className="text-amber-100 text-sm mb-2">help@larasena.com</p>
                  <p className="text-amber-100/80 text-xs mb-4">Respon dalam 1-2 jam</p>
                  <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                    Kirim Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}