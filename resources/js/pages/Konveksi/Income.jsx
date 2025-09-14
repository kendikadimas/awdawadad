import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import KonveksiLayout from '@/layouts/Konveksi/Layout';
import { DollarSign, Search } from 'lucide-react';

// Komponen untuk badge status pembayaran
const PaymentStatusBadge = ({ status }) => {
    const statusMap = {
        'paid': { text: 'Paid', color: 'bg-green-100 text-green-700' },
        'unpaid': { text: 'Unpaid', color: 'bg-red-100 text-red-700' },
        'cancelled': { text: 'Inactive', color: 'bg-gray-100 text-gray-700' },
    };
    const { text, color } = statusMap[status] || statusMap['cancelled'];
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${color}`}>{text}</span>;
};

// Komponen untuk Paginasi
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

export default function Income({ auth, invoices, totalPendapatan, filters }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('konveksi.income'), { search }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <KonveksiLayout title="Penghasilan">
            <Head title="Penghasilan" />
            <div className="p-6 space-y-6">
                <h1 className="text-2xl font-bold" style={{ color: '#BA682A' }}>Penghasilan</h1>

                {/* Kartu Total Pendapatan */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5 w-full md:w-1/3">
                    <div className="bg-green-100 p-4 rounded-full">
                        <DollarSign className="w-6 h-6 text-green-500"/>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Pendapatan</p>
                        <p className="text-3xl font-bold text-gray-800">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalPendapatan)}
                        </p>
                    </div>
                </div>

                {/* Tabel Invoice */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Semua Invoice</h3>
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Cari ID transaksi atau pelanggan..."
                                className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </form>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="p-4">ID Transaksi</th>
                                    <th className="p-4">Produk</th>
                                    <th className="p-4">Pelanggan</th>
                                    <th className="p-4">Harga</th>
                                    <th className="p-4">Jumlah Pesanan</th>
                                    <th className="p-4">Tanggal</th>
                                    <th className="p-4">Status Pembayaran</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.data.map(invoice => (
                                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4 font-medium">ID-{invoice.id}</td>
                                        <td className="p-4 font-medium flex items-center gap-3">
                                            <img src={invoice.design.image_url || 'https://via.placeholder.com/40'} alt={invoice.product.name} className="w-10 h-10 object-cover rounded-md bg-gray-100" />
                                            {invoice.product.name}
                                        </td>
                                        <td className="p-4">{invoice.customer.name}</td>
                                        <td className="p-4 text-gray-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(invoice.price_per_unit)}</td>
                                        <td className="p-4 font-medium">{invoice.quantity}</td>
                                        <td className="p-4 text-gray-600">{new Date(invoice.created_at).toLocaleDateString('id-ID')}</td>
                                        <td className="p-4">
                                            <PaymentStatusBadge status={invoice.payment_status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <Pagination links={invoices.links} />
                </div>
            </div>
        </KonveksiLayout>
    );
}