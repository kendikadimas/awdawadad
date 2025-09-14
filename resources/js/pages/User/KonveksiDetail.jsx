import React from 'react';
import { Head, Link } from '@inertiajs/react';
import UserLayout from '@/layouts/User/Layout';
import { Phone, MapPin, Star } from 'lucide-react';

export default function KonveksiDetail({ konveksi }) {
    // Ambil galeri gambar, berikan array kosong jika tidak ada
    const gallery = JSON.parse(konveksi.documentation || '[]');

    return (
        <UserLayout title={konveksi.name}>
            <Head title={konveksi.name} />

            <div className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Header Detail Konveksi */}
                <div className="flex flex-col md:flex-row items-start gap-8">
                    <img 
                        src={konveksi.icon_url || `https://ui-avatars.com/api/?name=${konveksi.name}&size=128&background=BA682A&color=fff`} 
                        alt={konveksi.name}
                        className="w-32 h-32 rounded-full shadow-lg border-4 border-white object-cover bg-gray-100"
                    />
                    <div className="pt-4">
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl font-bold text-gray-800">{konveksi.name}</h1>
                            {konveksi.is_verified && (
                                <span className="text-xs font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full">Terverifikasi</span>
                            )}
                        </div>
                        <p className="text-lg text-gray-500 mt-1">Mitra Konveksi Larasena</p>
                        <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-gray-600">
                            {konveksi.location && (
                                <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400"/> {konveksi.location}</span>
                            )}
                            {konveksi.no_telp && (
                                <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400"/> {konveksi.no_telp}</span>
                            )}
                            <span className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400"/> {konveksi.rating} / 5.0</span>
                        </div>
                    </div>
                </div>

                {/* Deskripsi dan Galeri */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Deskripsi */}
                        <div className="lg:col-span-1">
                            <h2 className="text-xl font-bold text-[#BA682A] mb-4">Tentang Kami</h2>
                            <p className="text-gray-600 leading-relaxed">
                                {konveksi.description || 'Informasi detail tentang konveksi ini belum tersedia.'}
                            </p>
                             <Link 
                                href={route('production.create', { konveksi_id: konveksi.id })}
                                className="inline-block mt-6 px-6 py-3 bg-[#BA682A] text-white font-bold rounded-lg hover:bg-[#A0522D] transition-colors shadow-md"
                            >
                                Pesan Produksi dari Konveksi Ini
                            </Link>
                        </div>

                        {/* Galeri Foto */}
                        <div className="lg:col-span-2">
                             <h2 className="text-xl font-bold text-[#BA682A] mb-4">Galeri</h2>
                             {gallery.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {gallery.map((image, index) => (
                                        <div key={index} className="aspect-square rounded-lg overflow-hidden shadow-md">
                                            <img 
                                                src={image.startsWith('http') ? image : `/storage/${image}`}
                                                alt={`Galeri ${konveksi.name} ${index + 1}`} 
                                                className="w-full h-full object-cover transition-transform hover:scale-105"
                                            />
                                        </div>
                                    ))}
                                </div>
                             ) : (
                                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                    <p>Tidak ada gambar galeri.</p>
                                </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}