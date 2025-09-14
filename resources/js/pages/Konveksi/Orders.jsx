import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import KonveksiLayout from '@/layouts/Konveksi/Layout';
import { Inbox, CheckCircle, RefreshCw, XCircle, Truck, Search } from 'lucide-react';

// Komponen untuk kartu statistik
const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5">
        <div className={`p-4 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

// Komponen untuk badge status
const StatusBadge = ({ status }) => {
    const statusMap = {
        'diterima_selesai': { text: 'Selesai', color: 'bg-green-100 text-green-700' },
        'diproses': { text: 'Proses', color: 'bg-yellow-100 text-yellow-700' },
        'ditolak': { text: 'Ditolak', color: 'bg-red-100 text-red-700' },
        'dikirim': { text: 'Dikirim', color: 'bg-blue-100 text-blue-700' },
        'diterima': { text: 'Masuk', color: 'bg-gray-100 text-gray-700' },
    };
    const { text, color } = statusMap[status] || statusMap['diterima'];
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${color}`}>{text}</span>;
};

const Pagination = ({ links }) => {
    return (
        <div className="flex items-center justify-center mt-6">
            {links.map((link, index) => {
                // Jika link tidak punya URL (contoh: "..."), render sebagai span
                if (!link.url) {
                    return (
                        <div
                            key={index}
                            className="px-4 py-2 mx-1 text-sm rounded-md text-gray-400"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                }
                // Jika link aktif, render sebagai Link
                return (
                    <Link
                        key={index}
                        href={link.url}
                        className={`px-4 py-2 mx-1 text-sm rounded-md transition-colors ${
                            link.active ? 'bg-[#BA682A] text-white' : 'bg-white hover:bg-gray-100'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </div>
    );
};



export default function Orders({ auth, orders=[], stats={}, filters={} }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('konveksi.orders'), { search }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <KonveksiLayout title="Pesanan Konveksi">
            <Head title="Pesanan" />
            <div className="p-6 space-y-6">
                <h1 className="text-2xl font-bold" style={{ color: '#BA682A' }}>Manajemen Pesanan</h1>

                {/* Kartu Statistik */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <StatCard title="Pesanan Masuk" value={stats.masuk} icon={<Inbox className="text-gray-500"/>} color="bg-gray-100" />
                    <StatCard title="Selesai" value={stats.selesai} icon={<CheckCircle className="text-green-500"/>} color="bg-green-100" />
                    <StatCard title="Proses" value={stats.proses} icon={<RefreshCw className="text-yellow-500"/>} color="bg-yellow-100" />
                    <StatCard title="Ditolak" value={stats.ditolak} icon={<XCircle className="text-red-500"/>} color="bg-red-100" />
                    <StatCard title="Dikirim" value={stats.dikirim} icon={<Truck className="text-blue-500"/>} color="bg-blue-100" />
                </div>

                {/* Tabel Pesanan */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Pesanan Terbaru</h3>
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Cari pelanggan atau produk..."
                                className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </form>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="p-4">Nama Produk</th>
                                    <th className="p-4">Pelanggan</th>
                                    <th className="p-4">Alamat</th>
                                    <th className="p-4">Jumlah</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.data.map(order => (
                                    <tr key={order.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4 font-medium flex items-center gap-3">
                                            <img src={order.design.image_url || 'https://via.placeholder.com/40'} alt={order.product.name} className="w-10 h-10 object-cover rounded-md bg-gray-100" />
                                            {order.product.name}
                                        </td>
                                        <td className="p-4">{order.customer.name}</td>
                                        <td className="p-4 text-gray-600">{order.design.description || 'Tidak ada deskripsi'}</td>
                                        <td className="p-4 font-medium">{order.quantity}</td>
                                        <td className="p-4">
                                            <StatusBadge status={order.production_status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <Pagination links={orders.links} />
                </div>
            </div>
        </KonveksiLayout>
    );
}