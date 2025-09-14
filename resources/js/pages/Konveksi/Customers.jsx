import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import KonveksiLayout from '@/layouts/Konveksi/Layout'; // Menggunakan layout konveksi
import { Users, Search } from 'lucide-react';

const Pagination = ({ links }) => (
    <div className="flex items-center justify-center mt-6">
        {links.map((link, index) => {
            if (!link.url) {
                return (
                    <div
                        key={index}
                        className="px-4 py-2 mx-1 text-sm rounded-md text-gray-400"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            }
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


export default function Customers({ auth, customers={}, filters={} }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('konveksi.customers'), { search }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <KonveksiLayout title="Pelanggan">
            <Head title="Pelanggan" />
            <div className="p-6 space-y-6">
                <h1 className="text-2xl font-bold" style={{ color: '#BA682A' }}>Manajemen Pelanggan</h1>
                
                {/* Kartu Jumlah Pelanggan */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5 w-full md:w-1/3">
                    <div className="bg-green-100 p-4 rounded-full">
                        <Users className="w-6 h-6 text-green-500"/>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Jumlah Pelanggan</p>
                        <p className="text-3xl font-bold text-gray-800">{customers.total}</p>
                    </div>
                </div>

                {/* Tabel Pelanggan */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Semua Pelanggan</h3>
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Cari pelanggan..."
                                className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </form>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="p-4">Nama Pelanggan</th>
                                    <th className="p-4">Alamat</th>
                                    <th className="p-4">Nomor Telp</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Pemesanan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.data.map(customer => (
                                    <tr key={customer.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4 font-medium flex items-center gap-3">
                                            <img src={`https://ui-avatars.com/api/?name=${customer.name}&background=random`} alt={customer.name} className="w-8 h-8 rounded-full" />
                                            {customer.name}
                                        </td>
                                        <td className="p-4 text-gray-600">{customer.address || 'Belum diatur'}</td>
                                        <td className="p-4 text-gray-600">{customer.phone_number || 'Belum diatur'}</td>
                                        <td className="p-4 text-gray-600">{customer.email}</td>
                                        <td className="p-4 font-medium">{customer.production_orders_count || 0}x</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <Pagination links={customers.links} />
                </div>
            </div>
        </KonveksiLayout>
    );
}