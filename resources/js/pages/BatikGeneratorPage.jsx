import { Head, router } from '@inertiajs/react';
import UserLayout from '@/layouts/User/Layout';
import { useState } from 'react';
import axios from 'axios';
import { Sparkles, Image as ImageIcon, Book, Save, Download } from 'lucide-react';

export default function BatikGeneratorPage({ auth }) {
    const [prompt, setPrompt] = useState('');
    const [resultImage, setResultImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setResultImage(null);
        setError('');

        if (!prompt) {
            setError('Deskripsi batik tidak boleh kosong.');
            setIsLoading(false);
            return;
        }

        try {
            // Memanggil backend Laravel Anda. URL ini harus cocok dengan yang ada di routes/api.php
            const response = await axios.post('/api/batik-generator', { prompt });
            
            // Laravel akan mengembalikan data gambar dalam format Base64
            if (response.data.image_data) {
                setResultImage(response.data.image_data);
            } else {
                throw new Error('Respons dari server tidak berisi data gambar.');
            }

        } catch (err) {
            console.error("Submit Error:", err.response);
            // Menampilkan pesan error yang lebih informatif dari backend jika ada
            setError(err.response?.data?.error || 'Terjadi kesalahan di server. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveAsDesign = () => {
        const designTitle = prompt.substring(0, 30); // Ambil judul dari prompt
        if (!resultImage) return;

        // Inertia akan menangani redirect secara otomatis
        router.post('/designs/ai', { title: designTitle, image_data: resultImage });
    };

    const handleDownload = () => {
        if (!resultImage) return;
        const link = document.createElement('a');
        link.href = resultImage;
        link.download = `${prompt.substring(0, 20) || 'batik-ai'}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <UserLayout title="AI Batik Generator">
            {/* Menggunakan grid untuk layout 2 kolom */}
            <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                {/* Kolom Kiri: Form Input */}
                <div className="p-8 flex flex-col justify-center bg-white">
                    <div className="max-w-md mx-auto w-full">
                        <div className="text-left mb-8">
                            <h2 className="text-3xl font-bold text-gray-800" style={{ color: '#BA682A' }}>
                                AI Batik Generator
                            </h2>
                            <p className="text-gray-500 mt-2">
                                Jelaskan motif batik yang Anda inginkan, dan biarkan AI kami yang mewujudkannya.
                            </p>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Motif</label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Contoh: seekor burung merak dengan ekor bunga teratai, gaya tradisional, warna biru dan emas"
                                    className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#D2691E] focus:border-transparent transition-shadow"
                                    disabled={isLoading}
                                ></textarea>
                            </div>
                            
                            <div className="text-left">
                                <button 
                                    type="submit" 
                                    disabled={isLoading} 
                                    className="inline-flex items-center justify-center w-full px-8 py-3 bg-[#BA682A] text-white font-bold rounded-lg hover:bg-[#A0522D] disabled:bg-gray-400 transition-all shadow-md hover:shadow-lg disabled:cursor-wait"
                                >
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    {isLoading ? 'Sedang Menggambar...' : 'Buat Batik'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Kolom Kanan: Hasil Gambar */}
                <div className="p-8 bg-white flex items-center justify-center">
                    <div className="w-full h-full max-w-lg aspect-square bg-gray-200 rounded-2xl flex items-center justify-center border-2 border-dashed">
                        {isLoading && (
                            <div className="text-center text-gray-600">
                                <p className="font-semibold">AI sedang bekerja, mohon tunggu...</p>
                                <p className="text-sm text-gray-500">Proses ini bisa memakan waktu hingga 1 menit.</p>
                            </div>
                        )}
                        
                        {error && <p className="text-red-500 text-center font-semibold p-4">{error}</p>}
                        
                        {!isLoading && !error && resultImage && (
                            <div className='shadow-none'>
                            <img 
                                src={resultImage} 
                                alt="Hasil AI Batik Generator" 
                                className="w-full h-full object-contain rounded-2xl" 
                            />
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                    <button onClick={handleDownload} className="inline-flex items-center justify-center px-4 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#388E3C] transition-colors">
                                        <Download className="w-4 h-4 mr-2" />
                                        Unduh
                                    </button>
                                    <button onClick={handleSaveAsDesign} className="inline-flex items-center px-4 py-2 bg-[#BA682A] text-white rounded-lg hover:bg-[#A0522D]">
                                        <Save className="w-4 h-4 mr-2" />
                                        Simpan & Edit
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {!isLoading && !error && !resultImage && (
                             <div className="text-center text-gray-400">
                                <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                                <p>Hasil gambar akan muncul di sini</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}