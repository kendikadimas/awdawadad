import Cards from '@/components/Cards'; // Import komponen Kartu
import { Head } from '@inertiajs/react';

export default function Test() {
    return (
        <>
            <Head title="Halaman Tes" />

            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
                    <Cards>
                        <h1 className="text-2xl font-bold text-gray-900">
                            ✅ Konfigurasi Berhasil!
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Jika Anda melihat halaman ini, artinya komponen dan halaman React (JSX) Anda berhasil dirender oleh Laravel Inertia.
                        </p>
                    </Cards>
                </div>
            </div>
        </>
    );
}