<?php

namespace App\Http\Controllers\Konveksi;

use App\Http\Controllers\Controller;
use App\Models\Production;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Menampilkan dashboard untuk mitra konveksi.
     */
    public function index()
    {
        $convectionId = Auth::id();

        // Ambil data untuk Stat Cards
        $totalPenghasilan = Production::where('convection_user_id', $convectionId)
            ->where('payment_status', 'paid')->sum('total_price');
        $totalPesanan = Production::where('convection_user_id', $convectionId)->count();
        $totalPelanggan = Production::where('convection_user_id', $convectionId)
            ->distinct('user_id')->count();

        // Ambil data untuk Laporan Pemesanan (contoh: 6 bulan terakhir)
       $laporanPemesanan = Production::where('convection_user_id', $convectionId)
    ->where('payment_status', 'paid') // <-- TAMBAHKAN FILTER INI
    ->select(
        DB::raw('SUM(total_price) as total'),
        DB::raw("DATE_FORMAT(created_at, '%b') as month")
    )
    ->where('created_at', '>', now()->subMonths(6))
    ->groupBy('month')
    ->orderBy('created_at')
    ->get();

        // Ambil data untuk daftar Pelanggan Teratas
        $topPelanggan = Production::where('convection_user_id', $convectionId)
            ->with('customer')
            ->select('user_id', DB::raw('count(*) as total_pesanan'))
            ->groupBy('user_id')->orderBy('total_pesanan', 'desc')
            ->limit(5)->get();

        // Render komponen React 'Konveksi/Dashboard' dan kirimkan datanya
        return Inertia::render('Konveksi/Dashboard', [
            'stats' => [
                'penghasilan' => $totalPenghasilan,
                'totalPesanan' => $totalPesanan,
                'totalPelanggan' => $totalPelanggan,
            ],
            'laporanPemesanan' => $laporanPemesanan,
            'topPelanggan' => $topPelanggan,
        ]);
    }

    public function orders(Request $request)
    {
        $convectionId = Auth::id();

        // Ambil semua pesanan untuk konveksi ini, dengan relasi yang dibutuhkan
        $query = Production::where('convection_user_id', $convectionId)
                    ->with(['customer', 'design', 'product']) // Eager load untuk efisiensi
                    ->orderBy('created_at', 'desc');

        // Fitur Pencarian (opsional)
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->whereHas('customer', function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%");
            })->orWhereHas('product', function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%");
            });
        }

        // Ambil data dengan paginasi
        $orders = $query->paginate(10)->withQueryString();

        // Ambil data untuk kartu statistik di atas
        $stats = [
            'masuk' => Production::where('convection_user_id', $convectionId)->count(),
            'selesai' => Production::where('convection_user_id', $convectionId)->where('production_status', 'diterima_selesai')->count(),
            'proses' => Production::where('convection_user_id', $convectionId)->where('production_status', 'diproses')->count(),
            'ditolak' => Production::where('convection_user_id', $convectionId)->where('production_status', 'ditolak')->count(),
            'dikirim' => Production::where('convection_user_id', $convectionId)->where('production_status', 'dikirim')->count(),
        ];

        return Inertia::render('Konveksi/Orders', [
            'orders' => $orders,
            'stats' => $stats,
            'filters' => $request->only(['search']) // Kirim kembali filter ke frontend
        ]);
    }

    public function customers(Request $request)
    {
        $convectionId = Auth::id();

        // Ambil ID semua pelanggan unik yang pernah memesan dari konveksi ini
        $customerIds = Production::where('convection_user_id', $convectionId)
            ->distinct()
            ->pluck('user_id');

        // Ambil data user dari ID yang sudah didapat
        $query = User::whereIn('id', $customerIds);

        // Fitur Pencarian (opsional)
        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        // Ambil data dengan paginasi
        $customers = $query->paginate(10)->withQueryString();

        return Inertia::render('Konveksi/Customers', [
            'customers' => $customers,
            'filters' => $request->only(['search']) // Kirim kembali filter ke frontend
        ]);
    }

    public function income(Request $request)
    {
        $convectionId = Auth::id();

        // Ambil semua data produksi yang sudah dibayar
        $query = Production::where('convection_user_id', $convectionId)
                    ->with(['customer', 'design', 'product'])
                    ->orderBy('created_at', 'desc');

        // Fitur Pencarian (opsional)
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('id', 'like', "%{$searchTerm}%")
                  ->orWhereHas('customer', function ($subq) use ($searchTerm) {
                      $subq->where('name', 'like', "%{$searchTerm}%");
                  });
            });
        }

        // Ambil data dengan paginasi
        $invoices = $query->paginate(10)->withQueryString();

        // Ambil data untuk kartu total pendapatan
        $totalPendapatan = Production::where('convection_user_id', $convectionId)
            ->where('payment_status', 'paid')
            ->sum('total_price');

        return Inertia::render('Konveksi/Income', [
            'invoices' => $invoices,
            'totalPendapatan' => $totalPendapatan,
            'filters' => $request->only(['search'])
        ]);
    }

}