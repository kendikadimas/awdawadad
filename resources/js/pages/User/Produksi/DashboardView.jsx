import React from 'react';
import { Link } from '@inertiajs/react';
// import StatCard from '@/Components/StatCard'; // Asumsi Anda punya komponen ini
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

      {/* Stat Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard icon={<Package className="w-6 h-6 text-gray-600" />} title="Total Pesanan" value={productions.total} />
        <StatCard icon={<DollarSign className="w-6 h-6 text-gray-600" />} title="Total Pengeluaran" value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalSpent || 0)} />
        <StatCard icon={<CheckCircle className="w-6 h-6 text-gray-600" />} title="Pesanan Selesai" value={completedOrders || 0} />
      </div> */}

      {/* Main Content */}
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
              {productions.data.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-mono text-gray-500">ORD-{order.id}</td>
                  <td className="p-4 font-medium flex items-center gap-3">
                    <img src={order.design.image_url || 'https://via.placeholder.com/40'} alt={order.design.title} className="w-10 h-10 object-cover rounded-md" />
                    {order.design.title}
                  </td>
                  <td className="p-4">{order.product.name}</td>
                  <td className="p-4">{order.quantity} pcs</td>
                  <td className="p-4 font-medium">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(order.total_price)}</td>
                  <td className="p-4"><StatusBadge status={order.production_status} /></td>
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
}