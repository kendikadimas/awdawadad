<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Production;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AdminTransactionController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $paymentStatus = $request->input('payment_status');
        
        $transactions = Production::query()
            ->with(['customer:id,name,email', 'convection:id,name', 'product:id,name'])
            ->when($search, function ($query, $search) {
                $query->where('id', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                    });
            })
            ->when($status && $status !== 'all', function ($query, $status) {
                $query->where('production_status', $status);
            })
            ->when($paymentStatus && $paymentStatus !== 'all', function ($query, $paymentStatus) {
                $query->where('payment_status', $paymentStatus);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total_transactions' => Production::count(),
            'total_revenue' => Production::where('payment_status', 'paid')->sum('total_price'),
            'pending_payment' => Production::where('payment_status', 'pending')->count(),
            'completed_orders' => Production::where('production_status', 'diterima_selesai')->count(),
        ];

        // Revenue chart data (6 bulan terakhir)
        $revenueChart = Production::where('payment_status', 'paid')
            ->where('created_at', '>=', now()->subMonths(6))
            ->select(
                DB::raw('SUM(total_price) as total'),
                DB::raw("DATE_FORMAT(created_at, '%b') as month"),
                DB::raw("MONTH(created_at) as month_number")
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

        return Inertia::render('Admin/Transactions/Index', [
            'transactions' => $transactions,
            'stats' => $stats,
            'revenueChart' => $revenueChart,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'payment_status' => $paymentStatus,
            ],
        ]);
    }

    public function show(Production $transaction)
    {
        $transaction->load(['customer', 'convection', 'product', 'design']);

        return Inertia::render('Admin/Transactions/Show', [
            'transaction' => $transaction,
        ]);
    }

    public function updateStatus(Request $request, Production $transaction)
    {
        $validated = $request->validate([
            'production_status' => 'required|in:pending,diproses,dikirim,diterima_selesai,ditolak',
            'payment_status' => 'required|in:pending,paid,failed',
        ]);

        $transaction->update($validated);

        return back()->with('success', 'Status transaksi berhasil diperbarui.');
    }

    public function destroy(Production $transaction)
    {
        $transaction->delete();

        return back()->with('success', 'Transaksi berhasil dihapus.');
    }
}