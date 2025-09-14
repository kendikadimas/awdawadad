import React from 'react';
import { ArrowRight, User, Palette, AlertCircle } from 'lucide-react';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

export default function OrderFormView({ data, setData, errors, processing, handleSubmitOrder, setCurrentStep, selectedMotif, konveksis, calculateEstimatedPrice, products, selectedConvection }) {
    return (
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pilih Tipe Produk *
                                    </label>
                                    <select 
                                        value={data.product_id}
                                        onChange={e => setData('product_id', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                                    >
                                        {products.map(product => (
                                            <option key={product.id} value={product.id}>
                                                {product.name}
                                            </option>
                                        ))}
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
                    <input type="number" value={data.quantity} onChange={e => setData('quantity', parseInt(e.target.value))} className="w-full px-4 py-3 border border-gray-200 rounded-xl" min="1" required />
                    {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Konveksi Partner *</label>
                    {selectedConvection ? (
                        <div className="w-full p-3 border border-gray-300 rounded-xl bg-gray-100">
                            <p className="font-semibold">{selectedConvection.name}</p>
                            <p className="text-sm text-gray-500">{selectedConvection.location}</p>
                        </div>
                    ) : (
                        <select 
                            value={data.convection_id}
                            onChange={e => setData('convection_id', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                        >
                            {konveksis.map(konveksi => (<option key={konveksi.id} value={konveksi.id}>{konveksi.name} - {konveksi.location}</option>))}
                        </select>
                    )}
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
              <div className="flex gap-4">
                <button type="button" onClick={() => setCurrentStep('create')} className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50">Kembali</button>
                <button type="submit" disabled={processing} className="flex-1 px-6 py-3 bg-[#BA682A] text-white rounded-xl hover:bg-[#9d5a24] flex items-center justify-center gap-2 disabled:opacity-50">{processing ? 'Memproses...' : 'Buat Pesanan'}<ArrowRight className="w-4 h-4" /></button>
              </div>
            </form>
          </div>
                </div>
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
}