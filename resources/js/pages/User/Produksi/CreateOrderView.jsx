import React from 'react';
import { ArrowRight } from 'lucide-react';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

export default function CreateOrderView({ designs, setCurrentStep, setData, setSelectedMotif }) {
    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setCurrentStep('dashboard')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowRight className="w-5 h-5 text-gray-600 rotate-180" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: '#BA682A' }}>Pilih Desain Batikmu</h1>
                    <p className="text-gray-600 mt-1">Pilih desain yang ingin diproduksi untuk pesanan baru</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {designs.map((design) => (
                    <div
                        key={design.id}
                        onClick={() => {
                            setData('design_id', design.id);
                            setSelectedMotif(design);
                            setCurrentStep('form');
                        }}
                        className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                    >
                        <div className="relative aspect-square overflow-hidden">
                            <img src={design.image_url || 'https://via.placeholder.com/300'} alt={design.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
}