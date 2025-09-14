<?php

use App\Http\Controllers\BatikGeneratorController;
use App\Http\Controllers\DesignEditorController;
use App\Http\Controllers\DesignController;
use App\Http\Controllers\KonveksiController;
use App\Http\Controllers\MotifController;
use App\Http\Controllers\ProductionController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

// Route halaman utama (welcome) - hanya untuk guest
Route::get('/', function () {
    return Inertia::render('Auth/Login');
});

// Routes yang memerlukan autentikasi
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard utama - menampilkan desain user
    Route::get('/dashboard', [DesignController::class, 'index'])->name('dashboard');

    // Design routes
    Route::post('/designs', [DesignController::class, 'store'])->name('designs.store');
    Route::get('/designs/{id}', [DesignController::class, 'show'])->name('designs.show');
    Route::put('/designs/{id}', [DesignController::class, 'update'])->name('designs.update');
    Route::delete('/designs/{id}', [DesignController::class, 'destroy'])->name('designs.destroy');

    // Motif routes
    Route::get('/motif', [MotifController::class, 'index'])->name('motif');
    Route::get('/api/motifs/editor', [MotifController::class, 'getForEditor'])->name('motifs.editor');
    Route::post('/motifs/ai', [MotifController::class, 'storeFromAi'])->name('motifs.store.ai');
    Route::post('/designs/ai', [DesignController::class, 'storeFromAi'])->name('designs.store.ai');

    // Menu utama
    Route::get('/konveksi', function () {
        return Inertia::render('User/Konveksi');
    })->name('konveksi');
    Route::get('/bantuan', function () {
        return Inertia::render('User/Bantuan');
    })->name('bantuan');

    // Editor routes
    Route::get('/editor', [DesignEditorController::class, 'create'])->name('editor.create');

    // Batik Generator
    Route::get('/batik-generator', function () {
        return Inertia::render('BatikGeneratorPage');
    })->name('batik.generator');

    Route::get('/produksi', [ProductionController::class, 'index'])->name('production.index');
    Route::post('/produksi', [ProductionController::class, 'store'])->name('production.store');
    Route::get('/produksi/pesan', [ProductionController::class, 'create'])->name('production.create');
    Route::get('/konveksi', [KonveksiController::class, 'index'])->name('konveksi.index');
    Route::get('/konveksi/{konveksi}', [KonveksiController::class, 'show'])->name('konveksi.show');    
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Konveksi routes (untuk detail dan show)
Route::get('/konveksi', [KonveksiController::class, 'index'])->name('konveksi.index');
Route::get('/konveksi/{konveksi}', [KonveksiController::class, 'show'])->name('konveksi.show');

// Konveksi dashboard khusus (role:Convection,Admin)
Route::middleware(['auth', 'role:Convection,Admin'])->prefix('konveksi.')->name('konveksi.')->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\Konveksi\DashboardController::class, 'index'])->name('dashboard');
    Route::get('/pesanan', [App\Http\Controllers\Konveksi\DashboardController::class, 'orders'])->name('orders');
    Route::get('/pelanggan', [App\Http\Controllers\Konveksi\DashboardController::class, 'customers'])->name('customers');
    Route::get('/penghasilan', [App\Http\Controllers\Konveksi\DashboardController::class, 'income'])->name('income');
});

// Admin routes
Route::middleware(['auth', 'role:Admin'])->group(function () {
    Route::get('/motifs/create', [\App\Http\Controllers\Admin\MotifController::class, 'create'])->name('motifs.create');
    Route::post('/motifs', [\App\Http\Controllers\Admin\MotifController::class, 'store'])->name('motifs.store');
});

// API routes
Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});
Route::post('/api/batik-generator', [BatikGeneratorController::class, 'generate']);
Route::prefix('api')->group(function () {
    Route::get('/konveksi', [KonveksiController::class, 'apiIndex']);
});

// Memuat semua rute autentikasi (login, register, logout, dll.)
require __DIR__.'/auth.php';