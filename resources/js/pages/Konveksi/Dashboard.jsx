import React from 'react';
import KonveksiLayout from '@/layouts/Konveksi/Layout';
import { Head } from '@inertiajs/react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // Impor Filler untuk background gradien
} from 'chart.js';
import { DollarSign, ShoppingBag, Users } from 'lucide-react';

// Daftarkan semua komponen ChartJS yang akan digunakan
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Komponen kecil untuk menampilkan kartu statistik di bagian atas
const StatCard = ({ title, value, icon, formatAsCurrency = false }) => {
    const formattedValue = formatAsCurrency 
        ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
        : new Intl.NumberFormat('id-ID').format(value);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-5 border border-gray-100">
            <div className="bg-gray-100 p-4 rounded-full">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{formattedValue}</p>
            </div>
        </div>
    );
};

// Komponen utama untuk halaman Dashboard Konveksi
export default function Dashboard({ auth, stats={}, laporanPemesanan = [], topPelanggan = [] }) {

    // Konfigurasi data untuk grafik Laporan Pemesanan
    const chartData = {
        labels: laporanPemesanan.map(item => item.month),
        datasets: [
            {
                label: 'Total Pendapatan',
                data: laporanPemesanan.map(item => item.total),
                borderColor: '#BA682A',
                backgroundColor: 'rgba(186, 104, 42, 0.2)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#BA682A',
                pointBorderColor: '#fff',
                pointHoverRadius: 7,
                pointHoverBackgroundColor: '#BA682A',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleFont: {
                    size: 14,
                },
                bodyFont: {
                    size: 12,
                },
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    return (
        <KonveksiLayout title="Dashboard Konveksi">
            <Head title="Dashboard Konveksi" />
            <div className="p-6 space-y-6">
                <h1 className="text-2xl font-bold" style={{ color: '#BA682A' }}>Dashboard Konveksi</h1>
                
                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Penghasilan (Paid)" value={stats.penghasilan} icon={<DollarSign className="text-green-500" />} formatAsCurrency={true} />
                    <StatCard title="Total Pesanan" value={stats.totalPesanan} icon={<ShoppingBag className="text-blue-500" />} />
                    <StatCard title="Total Pelanggan" value={stats.totalPelanggan} icon={<Users className="text-orange-500" />} />
                </div>

                {/* Main Content (Grafik dan Daftar Pelanggan) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Kolom Grafik */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg mb-4 text-gray-800">Laporan Pendapatan (6 Bulan Terakhir)</h3>
                        <div className="h-80">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Kolom Pelanggan Teratas */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-lg mb-4 text-gray-800">Pelanggan Teratas</h3>
                        <ul className="space-y-4">
                            {topPelanggan.map(pelanggan => (
                                <li key={pelanggan.user_id} className="flex items-center justify-between pb-2 border-b border-gray-100 last:border-b-0">
                                    <div>
                                        <p className="font-semibold text-gray-800">{pelanggan.customer.name}</p>
                                        <p className="text-xs text-gray-500">{pelanggan.customer.email}</p>
                                    </div>
                                    <span className="bg-gray-100 text-gray-700 text-sm font-bold px-2 py-1 rounded-md">{pelanggan.total_pesanan} pesanan</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </KonveksiLayout>
    );
}