<?php

use App\Http\Controllers\BatikGeneratorController;
use App\Http\Controllers\DesignEditorController;
use App\Http\Controllers\DesignController;
use App\Http\Controllers\KonveksiController;
use App\Http\Controllers\MotifController;
use App\Http\Controllers\ProductionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserMotifController;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminMotifController;
use App\Http\Controllers\Admin\AdminTransactionController;
use App\Http\Controllers\Konveksi\DashboardController as KonveksiDashboardController; // ✅ Import Controller Konveksi

// Route halaman utama (welcome)
Route::get('/', function () {
    if (!Auth::check()) {
        return Inertia::render('Auth/Login');
    }

    // ✅ Redirect berdasarkan role
    return match (Auth::user()->role) {
        'Admin' => redirect()->route('admin.dashboard'),
        'Convection' => redirect()->route('konveksi.dashboard'),
        default => redirect()->route('dashboard'),
    };
});

// ✅ Routes untuk General User (role: General)
Route::middleware(['auth', 'verified', 'role:General'])->group(function () {
    Route::get('/dashboard', [DesignController::class, 'index'])->name('dashboard');

    // Design routes
    Route::post('/designs', [DesignController::class, 'store'])->name('designs.store');
    Route::get('/designs/{id}', [DesignController::class, 'show'])->name('designs.show');
    Route::put('/designs/{id}', [DesignController::class, 'update'])->name('designs.update');
    Route::delete('/designs/{id}', [DesignController::class, 'destroy'])->name('designs.destroy');

    // Motif routes
    Route::get('/motif', [MotifController::class, 'index'])->name('motif');
    Route::post('/motifs/ai', [MotifController::class, 'storeFromAi'])->name('motifs.store.ai');
    Route::post('/designs/ai', [DesignController::class, 'storeFromAi'])->name('designs.store.ai');

    // Menu utama
    Route::get('/konveksi', [KonveksiController::class, 'index'])->name('konveksi.index');
    Route::get('/konveksi/{konveksi}', [KonveksiController::class, 'show'])->name('konveksi.show');
    Route::get('/bantuan', fn () => Inertia::render('User/Bantuan'))->name('bantuan');
    Route::get('/editor', [DesignEditorController::class, 'create'])->name('editor.create');
    Route::get('/batik-generator', fn () => Inertia::render('BatikGeneratorPage'))->name('batik.generator');
    Route::get('/produksi', [ProductionController::class, 'index'])->name('production.index');
    Route::post('/produksi', [ProductionController::class, 'store'])->name('production.store');
    Route::get('/produksi/pesan', [ProductionController::class, 'create'])->name('production.create');
    
    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// ✅ Routes untuk Konveksi (role: Convection) - TANPA PREFIX
Route::middleware(['auth', 'verified', 'role:Convection'])->group(function () {
    Route::get('/konveksi-dashboard', [KonveksiDashboardController::class, 'index'])->name('konveksi.dashboard');
    Route::get('/konveksi-pesanan', [KonveksiDashboardController::class, 'orders'])->name('konveksi.orders');
    Route::get('/konveksi-pelanggan', [KonveksiDashboardController::class, 'customers'])->name('konveksi.customers');
    Route::get('/konveksi-penghasilan', [KonveksiDashboardController::class, 'income'])->name('konveksi.income');
    
    // Profile untuk konveksi
    Route::get('/konveksi-profile', [ProfileController::class, 'edit'])->name('konveksi.profile.edit');
    Route::patch('/konveksi-profile', [ProfileController::class, 'update'])->name('konveksi.profile.update');
});

// ✅ Routes untuk Admin (role: Admin) - TANPA PREFIX
Route::middleware(['auth', 'verified', 'role:Admin'])->group(function () {
    Route::get('/admin-dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
    
    // User Management
    Route::get('/admin-users', [AdminUserController::class, 'index'])->name('admin.users.index');
    Route::put('/admin-users/{user}/role', [AdminUserController::class, 'updateRole'])->name('admin.users.updateRole');
    Route::delete('/admin-users/{user}', [AdminUserController::class, 'destroy'])->name('admin.users.destroy');
    
    // Motif Management
    Route::get('/admin-motifs', [AdminMotifController::class, 'index'])->name('admin.motifs.index');
    Route::post('/admin-motifs', [AdminMotifController::class, 'store'])->name('admin.motifs.store');
    Route::put('/admin-motifs/{motif}', [AdminMotifController::class, 'update'])->name('admin.motifs.update');
    Route::delete('/admin-motifs/{motif}', [AdminMotifController::class, 'destroy'])->name('admin.motifs.destroy');
    Route::put('/admin-motifs/{motif}/toggle-status', [AdminMotifController::class, 'toggleStatus'])->name('admin.motifs.toggleStatus');
    
    // Transaction Management
    Route::get('/admin-transactions', [AdminTransactionController::class, 'index'])->name('admin.transactions.index');
    Route::put('/admin-transactions/{transaction}/status', [AdminTransactionController::class, 'updateStatus'])->name('admin.transactions.updateStatus');
});

// ✅ Shared routes untuk semua authenticated users
Route::middleware('auth')->group(function () {
    // API Motif routes
    Route::get('/api/motifs/editor', [MotifController::class, 'editor'])->name('motifs.editor');
    Route::get('/api/user-motifs', [UserMotifController::class, 'index'])->name('motifs.user.index');
    Route::post('/api/user-motifs', [UserMotifController::class, 'store'])->name('motifs.user.store');
    
    // API Batik Generator
    Route::post('/api/batik-generator', [BatikGeneratorController::class, 'generate']);
});

// API routes
Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::prefix('api')->group(function () {
    Route::get('/konveksi', [KonveksiController::class, 'apiIndex']);
});

// Auth routes
require __DIR__.'/auth.php';