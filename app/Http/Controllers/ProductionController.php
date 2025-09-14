<?php

namespace App\Http\Controllers;

use App\Models\Production;
use App\Models\Design;
use App\Models\Konveksi;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ProductionController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Ambil data paginasi untuk riwayat produksi
        $productions = $user->productionOrders()
            ->with(['design', 'product', 'convection.user'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        // Ambil data untuk kartu statistik
        $totalSpent = $user->productionOrders()->sum('total_price');
        $completedOrders = $user->productionOrders()->where('production_status', 'diterima_selesai')->count();

        // Ambil data yang dibutuhkan untuk form "Create Order"
        $designs = $user->designs()->orderBy('updated_at', 'desc')->get();
        $konveksis = Konveksi::all(); // Ambil semua konveksi
        $products = Product::all(); // Ambil semua produk

        return Inertia::render('User/Produksi', [
            'productions' => $productions,
            'totalSpent' => $totalSpent,
            'completedOrders' => $completedOrders,
            'designs' => $designs,
            'konveksis' => $konveksis,
            'products' => $products,
        ]);
    }

    public function create(Request $request)
    {
        $designs = Auth::user()->designs()->orderBy('updated_at', 'desc')->get();
        $products = Product::all();
        
        // ✨ AWAL PERBAIKAN LOGIKA ✨
        $selectedConvection = null;
        $convections = [];

        // Jika ada ID konveksi dari URL, cari data konveksi tersebut
        if ($request->has('konveksi_id')) {
            $selectedConvection = Konveksi::findOrFail($request->query('konveksi_id'));
        } else {
            // Jika tidak, ambil semua data konveksi untuk dropdown
            $convections = Konveksi::all();
        }
        
        return Inertia::render('User/CreateProduction', [
            'designs' => $designs,
            'products' => $products,
            'convections' => $convections,
            'selectedConvection' => $selectedConvection, // Kirim data konveksi yang dipilih
        ]);
    }

    public function store(Request $request)
    {


        $validatedData = $request->validate([
        'design_id' => 'required|exists:designs,id',
        'product_id' => 'required|exists:product,id',
        'convection_id' => 'required|exists:konveksis,id',
        'quantity' => 'required|integer|min:1',
        'customer_name' => 'required|string',
        'customer_email' => 'required|email',
        'customer_phone' => 'required|string',
        'customer_address' => 'required|string',
        'batik_type' => 'required|string',
        'fabric_size' => 'required|string',
        'deadline' => 'required|date',
        'special_notes' => 'nullable|string'
    ]);

    // 2. Pastikan relasi valid
    $design = Design::where('id', $validatedData['design_id'])->where('user_id', Auth::id())->firstOrFail();
    $product = Product::findOrFail($validatedData['product_id']);
    $konveksi = Konveksi::findOrFail($validatedData['convection_id']);
    $convectionUser = $konveksi->user;

    if (!$convectionUser || $convectionUser->role !== 'Convection') {
        return back()->withErrors(['convection_id' => 'Mitra konveksi tidak valid.']);
    }
    
    // 3. Kumpulkan sisa data dari request untuk disimpan ke kolom JSON
    $customerData = [
        'name' => $request->input('customer_name'),
            'company' => $request->input('customer_company'), // Opsional
            'email' => $request->input('customer_email'),
            'phone' => $request->input('customer_phone'),
            'address' => $request->input('customer_address'),
            'batik_type' => $request->input('batik_type'),
            'fabric_size' => $request->input('fabric_size'),
            'deadline' => $request->input('deadline'),
            'special_notes' => $request->input('special_notes'),
    ];

    // 4. Buat record baru
    Production::create([
        'user_id' => Auth::id(),
        'convection_user_id' => $convectionUser->id,
        'design_id' => $design->id,
        'product_id' => $product->id,
        'quantity' => $validatedData['quantity'],
        'price_per_unit' => $product->base_price,
        'total_price' => $validatedData['quantity'] * $product->base_price,
        'production_status' => 'diterima',
        'payment_status' => 'unpaid',
        'customer_data' => $customerData, // Simpan data JSON
    ]);

    // 5. Arahkan kembali ke halaman riwayat produksi
    return redirect()->route('production.index')->with('success', 'Pesanan berhasil dibuat!');
    }

    private function calculatePrice($product, $batikType, $quantity)
    {
        $basePrice = 50000; // Harga dasar per unit

        // Multiplier berdasarkan jenis batik
        $typeMultiplier = [
            'Batik Tulis' => 3.0,
            'Batik Cap' => 2.0,
            'Batik Printing' => 1.0,
        ];

        // Discount berdasarkan quantity
        $quantityDiscount = 1.0;
        if ($quantity >= 100) {
            $quantityDiscount = 0.85; // 15% discount
        } elseif ($quantity >= 50) {
            $quantityDiscount = 0.90; // 10% discount
        } elseif ($quantity >= 25) {
            $quantityDiscount = 0.95; // 5% discount
        }

        return $basePrice * ($typeMultiplier[$batikType] ?? 1.0) * $quantityDiscount;
    }

    public function show(Production $production)
    {
        $production->load(['design', 'konveksi', 'product']);
        
        return Inertia::render('User/ProductionDetail', [
            'production' => $production
        ]);
    }
}