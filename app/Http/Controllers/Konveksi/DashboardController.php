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

        // ✅ Ambil data untuk Stat Cards
        $totalPenghasilan = Production::where('convection_user_id', $convectionId)
            ->where('payment_status', 'paid')
            ->sum('total_price');
            
        $totalPesanan = Production::where('convection_user_id', $convectionId)->count();
        
        // ✅ Perbaikan: Gunakan distinct dengan select
        $totalPelanggan = Production::where('convection_user_id', $convectionId)
            ->distinct('user_id')
            ->count('user_id');

        // ✅ Perbaikan: Laporan Pemesanan 6 bulan terakhir (dengan groupBy yang benar)
        $laporanPemesanan = Production::where('convection_user_id', $convectionId)
            ->where('payment_status', 'paid')
            ->where('created_at', '>=', now()->subMonths(6))
            ->select(
                DB::raw('SUM(total_price) as total'),
                DB::raw("DATE_FORMAT(created_at, '%b') as month"),
                DB::raw("MONTH(created_at) as month_number") // ✅ Untuk ordering yang benar
            )
            ->groupBy('month', 'month_number')
            ->orderBy('month_number', 'asc')
            ->get()
            ->map(function($item) {
                return [
                    'month' => $item->month,
                    'total' => (float) $item->total,
                ];
            });

        // ✅ Perbaikan: Top Pelanggan dengan data lebih lengkap
        $topPelanggan = Production::where('convection_user_id', $convectionId)
            ->with('customer:id,name,email')
            ->select('user_id', DB::raw('count(*) as total_pesanan'), DB::raw('SUM(total_price) as total_belanja'))
            ->groupBy('user_id')
            ->orderBy('total_pesanan', 'desc')
            ->limit(5)
            ->get()
            ->map(function($item) {
                return [
                    'customer' => $item->customer,
                    'total_pesanan' => $item->total_pesanan,
                    'total_belanja' => (float) $item->total_belanja,
                ];
            });

        return Inertia::render('Konveksi/Dashboard', [
            'stats' => [
                'penghasilan' => (float) $totalPenghasilan,
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

        // ✅ Perbaikan: Tambahkan filter status
        $query = Production::where('convection_user_id', $convectionId)
                    ->with(['customer:id,name,email', 'design:id,title', 'product:id,name'])
                    ->orderBy('created_at', 'desc');

        // ✅ Filter berdasarkan status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('production_status', $request->status);
        }

        // ✅ Perbaikan: Pencarian yang lebih baik
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('id', 'like', "%{$searchTerm}%")
                  ->orWhereHas('customer', function ($subq) use ($searchTerm) {
                      $subq->where('name', 'like', "%{$searchTerm}%")
                           ->orWhere('email', 'like', "%{$searchTerm}%");
                  })
                  ->orWhereHas('product', function ($subq) use ($searchTerm) {
                      $subq->where('name', 'like', "%{$searchTerm}%");
                  });
            });
        }

        $orders = $query->paginate(10)->withQueryString();

        // ✅ Statistik pesanan
        $stats = [
            'masuk' => Production::where('convection_user_id', $convectionId)->count(),
            'selesai' => Production::where('convection_user_id', $convectionId)
                ->where('production_status', 'diterima_selesai')
                ->count(),
            'proses' => Production::where('convection_user_id', $convectionId)
                ->where('production_status', 'diproses')
                ->count(),
            'ditolak' => Production::where('convection_user_id', $convectionId)
                ->where('production_status', 'ditolak')
                ->count(),
            'dikirim' => Production::where('convection_user_id', $convectionId)
                ->where('production_status', 'dikirim')
                ->count(),
        ];

        return Inertia::render('Konveksi/Orders', [
            'orders' => $orders,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function customers(Request $request)
    {
        $convectionId = Auth::id();

        // ✅ Ambil ID customer yang pernah memesan
        $customerIds = Production::where('convection_user_id', $convectionId)
            ->distinct()
            ->pluck('user_id');

        // ✅ Query user berdasarkan ID tersebut
        $query = User::whereIn('id', $customerIds)
            ->withCount(['productions as total_orders' => function($q) use ($convectionId) {
                $q->where('convection_user_id', $convectionId);
            }])
            ->withSum(['productions as total_spent' => function($q) use ($convectionId) {
                $q->where('convection_user_id', $convectionId)
                  ->where('payment_status', 'paid');
            }], 'total_price')
            ->orderBy('total_orders', 'desc');

        // ✅ Pencarian
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $customers = $query->paginate(10)->withQueryString();

        // ✅ Total customer
        $totalCustomers = $customerIds->count();

        return Inertia::render('Konveksi/Customers', [
            'customers' => $customers,
            'totalCustomers' => $totalCustomers,
            'filters' => $request->only(['search'])
        ]);
    }

    public function income(Request $request)
    {
        $convectionId = Auth::id();

        // ✅ Perbaikan: Filter berdasarkan payment_status dan date range
        $query = Production::where('convection_user_id', $convectionId)
                    ->with(['customer:id,name,email', 'design:id,title', 'product:id,name'])
                    ->orderBy('created_at', 'desc');

        // ✅ Filter berdasarkan payment status
        if ($request->has('payment_status') && $request->payment_status !== 'all') {
            $query->where('payment_status', $request->payment_status);
        }

        // ✅ Filter berdasarkan tanggal
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        
        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // ✅ Pencarian
        if ($request->has('search') && $request->search) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('id', 'like', "%{$searchTerm}%")
                  ->orWhereHas('customer', function ($subq) use ($searchTerm) {
                      $subq->where('name', 'like', "%{$searchTerm}%")
                           ->orWhere('email', 'like', "%{$searchTerm}%");
                  });
            });
        }

        $invoices = $query->paginate(10)->withQueryString();

        // ✅ Statistik pendapatan
        $totalPendapatan = Production::where('convection_user_id', $convectionId)
            ->where('payment_status', 'paid')
            ->sum('total_price');

        $pendapatanBulanIni = Production::where('convection_user_id', $convectionId)
            ->where('payment_status', 'paid')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total_price');

        $pesananBelumBayar = Production::where('convection_user_id', $convectionId)
            ->where('payment_status', 'pending')
            ->count();

        return Inertia::render('Konveksi/Income', [
            'invoices' => $invoices,
            'stats' => [
                'totalPendapatan' => (float) $totalPendapatan,
                'pendapatanBulanIni' => (float) $pendapatanBulanIni,
                'pesananBelumBayar' => $pesananBelumBayar,
            ],
            'filters' => $request->only(['search', 'payment_status', 'date_from', 'date_to'])
        ]);
    }
}