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

// Route halaman utama (welcome)
Route::get('/', function () {
    if (!Auth::check()) {
        return Inertia::render('Auth/Login');
    }

    // ✅ Redirect berdasarkan role
    return match (Auth::user()->role) {
        'Admin' => redirect()->route('admin.dashboard'),
        'Convection' => redirect()->route('konveksi.dashboard'),
        default => redirect()->route('user.dashboard'),
    };
});

// ✅ Routes untuk General User (role: General)
Route::middleware(['auth', 'verified', 'role:General'])->group(function () {
    Route::get('/dashboard', [DesignController::class, 'index'])->name('user.dashboard');

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

// ✅ Routes untuk Konveksi (role: Convection)
Route::middleware(['auth', 'verified', 'role:Convection'])->prefix('konveksi')->name('konveksi.')->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\Konveksi\DashboardController::class, 'index'])->name('dashboard');
    Route::get('/pesanan', [App\Http\Controllers\Konveksi\DashboardController::class, 'orders'])->name('orders');
    Route::get('/pelanggan', [App\Http\Controllers\Konveksi\DashboardController::class, 'customers'])->name('customers');
    Route::get('/penghasilan', [App\Http\Controllers\Konveksi\DashboardController::class, 'income'])->name('income');
});

// ✅ Routes untuk Admin (role: Admin)
Route::middleware(['auth', 'verified', 'role:Admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    
    // User Management
    Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
    Route::put('/users/{user}/role', [AdminUserController::class, 'updateRole'])->name('users.updateRole');
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');
    
    // Motif Management
    Route::get('/motifs', [AdminMotifController::class, 'index'])->name('motifs.index');
    Route::post('/motifs', [AdminMotifController::class, 'store'])->name('motifs.store');
    Route::put('/motifs/{motif}', [AdminMotifController::class, 'update'])->name('motifs.update');
    Route::delete('/motifs/{motif}', [AdminMotifController::class, 'destroy'])->name('motifs.destroy');
    Route::put('/motifs/{motif}/toggle-status', [AdminMotifController::class, 'toggleStatus'])->name('motifs.toggleStatus');
    
    // Transaction Management
    Route::get('/transactions', [AdminTransactionController::class, 'index'])->name('transactions.index');
    Route::put('/transactions/{transaction}/status', [AdminTransactionController::class, 'updateStatus'])->name('transactions.updateStatus');
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