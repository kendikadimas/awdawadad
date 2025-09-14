import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import UserLayout from '@/layouts/User/Layout';



export default function ConfirmationView({ setCurrentStep, setSelectedMotif, router, onFinish }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Pesanan Berhasil Dibuat!
        </h1>
        <p className="text-gray-600">
          Pesanan Anda telah berhasil disimpan dan akan segera diproses oleh mitra konveksi.
        </p>
      </div>

      <div className="flex gap-4">
        <button
                    // ✨ CHANGE THIS LINE ✨
                    onClick={onFinish} // Use the onFinish prop that was passed down
                    className="px-6 py-3 bg-[#BA682A] text-white rounded-xl hover:bg-[#9d5a24] transition-colors flex items-center gap-2 mx-auto"
                >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
}
