import { Head, Link, useForm } from '@inertiajs/react';
import UserLayout from '@/layouts/User/Layout';
import { useState } from 'react';
import {
  Plus,
  Clock,
  Package,
  CheckCircle,
  ArrowRight,
  Eye,
  User,
  Palette,
  AlertCircle,
  Inbox,
  XCircle,
  DollarSign
} from 'lucide-react';

// =================================================================
// KOMPONEN-KOMPONEN HELPER (didefinisikan di luar)
// =================================================================

const formatCurrency = (value) => {
    if (isNaN(value)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const StatCard = ({ icon, title, value, link }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-start justify-between">
      <div>
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">{icon}</div>
        <p className="text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <Link href={link || '#'} className="text-gray-400 hover:text-[#BA682A]"><ArrowRight className="w-5 h-5" /></Link>
    </div>
);

const Pagination = ({ links = [] }) => {
    if (links.length <= 3) return null;
    return (
        <div className="flex items-center justify-end mt-6">
            {links.map((link, index) => {
                if (!link || !link.url) return <div key={index} className="px-4 py-2 mx-1 text-sm rounded-md text-gray-400" dangerouslySetInnerHTML={{ __html: link?.label ?? '' }} />;
                return <Link key={index} href={link.url} className={`px-4 py-2 mx-1 text-sm rounded-md transition-colors ${link.active ? 'bg-[#BA682A] text-white' : 'bg-white hover:bg-gray-100'}`} dangerouslySetInnerHTML={{ __html: link.label }} />;
            })}
        </div>
    );
};

const StatusBadge = ({ status }) => {
    const statusMap = {
        'diterima_selesai': { text: 'Selesai', icon: <CheckCircle className="w-4 h-4" /> },
        'diproses': { text: 'Proses', icon: <Clock className="w-4 h-4" /> },
        'ditolak': { text: 'Ditolak', icon: <XCircle className="w-4 h-4" /> },
        'dikirim': { text: 'Dikirim', icon: <Package className="w-4 h-4" /> },
        'diterima': { text: 'Diterima', icon: <Inbox className="w-4 h-4" /> },
    };
    const { text, icon } = statusMap[status] || statusMap['diterima'];
    return <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">{icon} {text}</span>;
};

// =================================================================
// KOMPONEN-KOMPONEN VIEW (sekarang menjadi komponen independen)
// =================================================================

const DashboardView = ({ productions = { data: [], links: [] }, onCreateNew }) => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Riwayat Produksi Anda</h1>
        <button onClick={onCreateNew} className="px-6 py-3 bg-[#BA682A] text-white rounded-xl hover:bg-[#9d5a24] transition-colors flex items-center gap-2"><Plus className="w-5 h-5" />Buat Pesanan Baru</button>
      </div>
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard icon={<Package className="w-6 h-6 text-gray-600" />} title="Total Pesanan" value={productions.total} />
        <StatCard icon={<DollarSign className="w-6 h-6 text-gray-600" />} title="Total Pengeluaran" value={formatCurrency(totalSpent || 0)} />
        <StatCard icon={<CheckCircle className="w-6 h-6 text-gray-600" />} title="Pesanan Selesai" value={completedOrders || 0} />
      </div> */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Pesanan Aktif</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="p-4">ID Pesanan</th><th className="p-4">Desain</th><th className="p-4">Produk</th>
                <th className="p-4">Jumlah</th><th className="p-4">Total Harga</th><th className="p-4">Status</th><th className="p-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {productions?.data??[].map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-mono text-gray-500">ORD-{order.id}</td>
                  <td className="p-4 font-medium flex items-center gap-3">
                    {order.design?.image_url ? <img src={order.design.image_url} alt={order.design?.title} className="w-10 h-10 object-cover rounded-md" /> : <div className="w-10 h-10 bg-gray-100 rounded-md" />}
                    {order.design?.title || <span className="text-gray-400">Desain tidak tersedia</span>}
                  </td>
                  <td className="p-4">{order.product?.name || <span className="text-gray-400">Produk tidak tersedia</span>}</td>
                  <td className="p-4">{order.quantity || 0} pcs</td>
                  <td className="p-4 font-medium">{formatCurrency(order.total_price || 0)}</td>
                  <td className="p-4"><StatusBadge status={order.production_status || 'diterima'} /></td>
                  <td className="p-4"><button className="p-2 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4 text-gray-500" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination links={productions.links} />
      </div>
    </div>
);

const CreateOrderView = ({ designs, setCurrentStep, setData, setSelectedMotif }) => (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setCurrentStep('dashboard')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ArrowRight className="w-5 h-5 text-gray-600 rotate-180" /></button>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#BA682A' }}>Pilih Desain Batikmu</h1>
          <p className="text-gray-600 mt-1">Pilih desain yang ingin diproduksi untuk pesanan baru</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {designs.map((design) => (
          <div key={design.id} onClick={() => { setData('design_id', design.id); setSelectedMotif(design); setCurrentStep('form'); }} className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
            <div className="relative aspect-square overflow-hidden">
              <img src={design.image_url || design.thumbnail || 'https://via.placeholder.com/300'} alt={design.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-lg mb-1">{design.title}</h3>
                  <p className="text-white/90 text-sm">Mulai dari {formatCurrency(50000)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
);

const OrderFormView = ({ data, setData, errors, processing, handleSubmitOrder, setCurrentStep, selectedMotif, konveksis, calculateEstimatedPrice }) => (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setCurrentStep('create')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ArrowRight className="w-5 h-5 text-gray-600 rotate-180" /></button>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#BA682A' }}>Detail Pesanan</h1>
          <p className="text-gray-600 mt-1">Lengkapi informasi pesanan untuk desain {selectedMotif?.title}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <form onSubmit={handleSubmitOrder} className="space-y-8">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><User className="w-5 h-5 text-[#BA682A]" />Informasi Customer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap *</label>
                    <input type="text" value={data.customer_name} onChange={e => setData('customer_name', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl" required />
                    {errors.customer_name && <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Perusahaan</label>
                    <input type="text" value={data.customer_company} onChange={e => setData('customer_company', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input type="email" value={data.customer_email} onChange={e => setData('customer_email', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl" required />
                    {errors.customer_email && <p className="text-red-500 text-sm mt-1">{errors.customer_email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon *</label>
                    <input type="tel" value={data.customer_phone} onChange={e => setData('customer_phone', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl" required />
                    {errors.customer_phone && <p className="text-red-500 text-sm mt-1">{errors.customer_phone}</p>}
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap *</label>
                  <textarea rows="3" value={data.customer_address} onChange={e => setData('customer_address', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl" required />
                  {errors.customer_address && <p className="text-red-500 text-sm mt-1">{errors.customer_address}</p>}
                </div>
              </div>

              {/* Product Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><Palette className="w-5 h-5 text-[#BA682A]" />Detail Produk</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Batik *</label>
                    <select value={data.batik_type} onChange={e => setData('batik_type', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl">
                      <option value="Batik Printing">Batik Printing</option>
                      <option value="Batik Cap">Batik Cap</option>
                      <option value="Batik Tulis">Batik Tulis</option>
                    </select>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ukuran Kain *</label>
                    <select value={data.fabric_size} onChange={e => setData('fabric_size', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl">
                      <option>210cm x 110cm (Standar)</option>
                      <option>250cm x 115cm (Jumbo)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah (pcs) *</label>
                    <input type="number" value={data.quantity} onChange={e => setData('quantity', parseInt(e.target.value))} className="w-full px-4 py-3 border border-gray-200 rounded-xl" min="12" required />
                    {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Konveksi Partner *</label>
                    <select value={data.convection_id} onChange={e => setData('convection_id', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl">
                      {konveksis.map(konveksi => (<option key={konveksi.id} value={konveksi.id}>{konveksi.name} - {konveksi.location}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deadline *</label>
                    <input type="date" value={data.deadline} onChange={e => setData('deadline', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl" required />
                    {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Khusus</label>
                  <textarea rows="3" value={data.special_notes} onChange={e => setData('special_notes', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
                </div>
              </div>
              {/* Submit Button */}
              <div className="flex gap-4">
                <button type="button" onClick={() => setCurrentStep('create')} className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50">Kembali</button>
                <button type="submit" disabled={processing} className="flex-1 px-6 py-3 bg-[#BA682A] text-white rounded-xl hover:bg-[#9d5a24] flex items-center justify-center gap-2 disabled:opacity-50">{processing ? 'Memproses...' : 'Buat Pesanan'}<ArrowRight className="w-4 h-4" /></button>
              </div>
            </form>
          </div>
        </div>
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Ringkasan Pesanan
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMotif?.image_url || selectedMotif?.thumbnail || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop'}
                  alt={selectedMotif?.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-800">{selectedMotif?.title}</h4>
                  <p className="text-sm text-gray-500">{data.batik_type}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 py-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Jenis Batik</span>
                <span className="font-medium">{data.batik_type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Quantity</span>
                <span className="font-medium">{data.quantity} pcs</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estimasi per Unit</span>
                <span className="font-medium">{formatCurrency(calculateEstimatedPrice() / data.quantity)}</span>
              </div>
            </div>

            <div className="flex justify-between text-lg font-semibold pt-4 border-t border-gray-200">
              <span>Total Estimasi</span>
              <span style={{ color: '#BA682A' }}>{formatCurrency(calculateEstimatedPrice())}</span>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-xs text-blue-800 font-medium">Catatan Harga</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Harga final akan dikonfirmasi oleh konveksi setelah review desain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Confirmation View
  const ConfirmationView = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Pesanan Berhasil Dibuat!
        </h1>
        <p className="text-gray-600">
          Pesanan Anda telah berhasil disimpan dan akan segera diproses oleh mitra konveksi.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => {
            setCurrentStep('dashboard');
            setSelectedMotif(null);
            router.reload();
          }}
          className="flex-1 px-6 py-3 bg-[#BA682A] text-white rounded-xl hover:bg-[#9d5a24] transition-colors"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
);


// =================================================================
// KOMPONEN INDUK UTAMA (HANYA MENGATUR STATE DAN LOGIKA)
// =================================================================
export default function Produksi({ auth, productions = { data: [], links: [] }, designs=[], konveksis=[], products=[], stats={} }) {
  const [currentStep, setCurrentStep] = useState('dashboard');
  const [selectedMotif, setSelectedMotif] = useState(null);
  
  const { data, setData, post, processing, errors,reset } = useForm({
    design_id: '',
    product_id: products[0]?.id || '', // Tambahkan field-field lain yang dibutuhkan form
    convection_id: konveksis[0]?.id || '',
    quantity: 1,
    customer_name: auth.user.name,
    customer_email: auth.user.email,
    customer_phone: '',
    customer_company: '',
    customer_address: '',
    batik_type: 'Batik Printing',
    fabric_size: '210cm x 110cm (Standar)',
    deadline: '',
    special_notes: '',
  });

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    post(route('produksi.store'));
  };

  const calculateEstimatedPrice = () => {
    // Placeholder untuk logika perhitungan harga
    return data.quantity * 50000;
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'create':
        return <CreateOrderView 
                    designs={designs || []} // Beri nilai default
                    setCurrentStep={setCurrentStep} 
                    setData={setData}
                    setSelectedMotif={setSelectedMotif}
                />;
      case 'form':
        return <OrderFormView 
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    handleSubmitOrder={handleSubmitOrder}
                    setCurrentStep={setCurrentStep}
                    selectedMotif={selectedMotif}
                    konveksis={konveksis || []} // Beri nilai default
                    calculateEstimatedPrice={calculateEstimatedPrice}
                />;
      default:
        return <DashboardView 
                    productions={productions}
                    onCreateNew={() => setCurrentStep('create')} 
                />;
    }
  };

  return (
    <UserLayout title="Produksi Batik">
        <Head title="Produksi Saya" />
        {renderCurrentStep()}
    </UserLayout>
  );
}