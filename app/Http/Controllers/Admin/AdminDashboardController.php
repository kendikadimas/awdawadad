<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Motif;
use App\Models\Design;
use App\Models\Transaction;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_users' => User::where('role', 'user')->count(),
            'total_motifs' => Motif::count(),
            'total_designs' => Design::count(),
            'total_transactions' => Transaction::count(),
            'total_revenue' => Transaction::where('status', 'completed')->sum('amount'),
            'pending_transactions' => Transaction::where('status', 'pending')->count(),
        ];

        $recent_users = User::where('role', 'user')
            ->latest()
            ->take(5)
            ->get(['id', 'name', 'email', 'created_at']);

        $recent_transactions = Transaction::with('user:id,name,email')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recent_users' => $recent_users,
            'recent_transactions' => $recent_transactions,
        ]);
    }
}