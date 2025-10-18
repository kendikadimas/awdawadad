import React from 'react';
import { Link } from '@inertiajs/react';
import { Package, DollarSign, CheckCircle, Eye, Plus, Inbox, Clock, XCircle } from 'lucide-react';

// Komponen Paginasi
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

// Komponen Badge Status
const StatusBadge = ({ status }) => {
    const statusMap = {
        'diterima_selesai': { text: 'Selesai', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-100 text-green-700' },
        'diproses': { text: 'Proses', icon: <Clock className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-700' },
        'ditolak': { text: 'Ditolak', icon: <XCircle className="w-4 h-4" />, color: 'bg-red-100 text-red-700' },
        'dikirim': { text: 'Dikirim', icon: <Package className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700' },
        'diterima': { text: 'Diterima', icon: <Inbox className="w-4 h-4" />, color: 'bg-gray-100 text-gray-700' },
    };
    const { text, icon, color } = statusMap[status] || statusMap['diterima'];
    return <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full ${color}`}>{icon} {text}</span>;
};

// ✅ Helper untuk normalize image URL
const normalizeImageUrl = (url) => {
    if (!url) return null;
    
    // Jika sudah full URL (http/https), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    
    // Jika sudah dimulai dengan /storage/, return as is
    if (url.startsWith('/storage/')) {
        return url;
    }
    
    // Jika path relatif, tambahkan /storage/
    return '/storage/' + url;
};

export default function DashboardView({ productions, totalSpent, completedOrders, onCreateNew }) {
  return (
    <div className="px-6 py-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#BA682A]">Riwayat Produksi Anda</h1>
        <button
          onClick={onCreateNew}
          className="px-6 py-3 bg-[#BA682A] text-white rounded-xl hover:bg-[#9d5a24] transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Buat Pesanan Baru
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Pesanan Aktif</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-sm text-gray-600">
              <tr>
                <th className="p-4">ID Pesanan</th>
                <th className="p-4">Desain</th>
                <th className="p-4">Produk</th>
                <th className="p-4">Jumlah</th>
                <th className="p-4">Total Harga</th>
                <th className="p-4">Status</th>
                <th className="p-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {productions.data.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-mono text-gray-500">ORD-{order.id}</td>
                  <td className="p-4 font-medium">
                    <div className="flex items-center gap-3">
                      <img
                        src={normalizeImageUrl(order.design?.image_url)}
                        alt={order.design?.title || 'Design'}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          // ✅ FIX: Prevent infinite loop
                          if (e.target.src !== 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="12px" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E') {
                            console.error('Failed to load production image:', order.design?.image_url);
                            // Use inline SVG as fallback to prevent 404
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="12px" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }
                        }}
                      />
                      <span>{order.design?.title || 'Untitled Design'}</span>
                    </div>
                  </td>
                  <td className="p-4">{order.product?.name || '-'}</td>
                  <td className="p-4">{order.quantity} pcs</td>
                  <td className="p-4 font-medium">
                    {new Intl.NumberFormat('id-ID', { 
                      style: 'currency', 
                      currency: 'IDR' 
                    }).format(order.total_price)}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={order.production_status} />
                  </td>
                  <td className="p-4">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {productions.data.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Belum ada pesanan</p>
              <p className="text-gray-400 text-sm mt-2">Buat pesanan pertama Anda sekarang!</p>
            </div>
          )}
        </div>
        <Pagination links={productions.links} />
      </div>
    </div>
  );
}