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

// Route halaman utama (welcome) - hanya untuk guest
Route::get('/', function () {
    if (!Auth::check()) {
        return Inertia::render('Auth/Login');
    }

    return match (Auth::user()->role) {
        'Convection' => redirect()->route('konveksi.dashboard'),
        default      => redirect()->route('dashboard'),
    };
});

// Routes yang memerlukan autentikasi
Route::middleware(['auth', 'verified', 'role:General,Admin'])->group(function () {
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
    Route::get('/api/user-motifs', [UserMotifController::class, 'index'])->name('motifs.user.index');
    Route::post('/api/user-motifs', [UserMotifController::class, 'store'])->name('motifs.user.store');
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
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified', 'role:Convection,Admin'])->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\Konveksi\DashboardController::class, 'index'])
        ->name('konveksi.dashboard');

    Route::get('/pesanan', [App\Http\Controllers\Konveksi\DashboardController::class, 'orders'])
        ->name('konveksi.orders');

    Route::get('/pelanggan', [App\Http\Controllers\Konveksi\DashboardController::class, 'customers'])
        ->name('konveksi.customers');

    Route::get('/penghasilan', [App\Http\Controllers\Konveksi\DashboardController::class, 'income'])
        ->name('konveksi.income');
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