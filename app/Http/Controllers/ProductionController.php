<?php

namespace App\Http\Controllers;

use App\Models\Production;
use App\Models\Design;
use App\Models\Konveksi;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProductionController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $productions = $user->productionOrders()
            ->with(['design', 'product', 'convection.user'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        
        $productions->getCollection()->transform(function ($production) {
            if ($production->design) {
                $imageUrl = $production->design->image_url;
                
                if ($imageUrl) {
                    if (strpos($imageUrl, 'http://') === 0 || strpos($imageUrl, 'https://') === 0) {
                        $parsed = parse_url($imageUrl);
                        $imageUrl = $parsed['path'] ?? $imageUrl;
                        $imageUrl = str_replace('/storage/', '', $imageUrl);
                    }
                    
                    $production->design->image_url = Storage::url($imageUrl);
                }
            }
            return $production;
        });

        $totalSpent = $user->productionOrders()->sum('total_price');
        $completedOrders = $user->productionOrders()->where('production_status', 'diterima_selesai')->count();

        $designs = $user->designs()
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($design) {
                $imageUrl = $design->image_url;
                
                if ($imageUrl) {
                    if (strpos($imageUrl, 'http://') === 0 || strpos($imageUrl, 'https://') === 0) {
                        $parsed = parse_url($imageUrl);
                        $imageUrl = $parsed['path'] ?? $imageUrl;
                        $imageUrl = str_replace('/storage/', '', $imageUrl);
                    }
                    
                    $imageUrl = Storage::url($imageUrl);
                }
                
                return [
                    'id' => $design->id,
                    'title' => $design->title,
                    'image_url' => $imageUrl,
                    'canvas_data' => $design->canvas_data,
                    'canvas_width' => $design->canvas_width,
                    'canvas_height' => $design->canvas_height,
                    'created_at' => $design->created_at,
                    'updated_at' => $design->updated_at,
                ];
            });

        $konveksis = Konveksi::all();
        
        // ✅ FIX: Hapus is_active
        $products = Product::select('id', 'name', 'category', 'description', 'base_price')
            ->get();

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
        $designs = Auth::user()->designs()
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($design) {
                $imageUrl = $design->image_url;
                
                if ($imageUrl) {
                    if (strpos($imageUrl, 'http://') === 0 || strpos($imageUrl, 'https://') === 0) {
                        $parsed = parse_url($imageUrl);
                        $imageUrl = $parsed['path'] ?? $imageUrl;
                        $imageUrl = str_replace('/storage/', '', $imageUrl);
                    }
                    
                    $imageUrl = Storage::url($imageUrl);
                }
                
                return [
                    'id' => $design->id,
                    'title' => $design->title,
                    'image_url' => $imageUrl,
                    'created_at' => $design->created_at,
                    'updated_at' => $design->updated_at,
                ];
            });

        // ✅ FIX: Hapus is_active
        $products = Product::select('id', 'name', 'category', 'description', 'base_price')
            ->get();
        
        $selectedConvection = null;
        $convections = [];

        if ($request->has('konveksi_id')) {
            $selectedConvection = Konveksi::findOrFail($request->query('konveksi_id'));
        } else {
            $convections = Konveksi::all();
        }
        
        return Inertia::render('User/CreateProduction', [
            'designs' => $designs,
            'products' => $products,
            'convections' => $convections,
            'selectedConvection' => $selectedConvection,
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
            'fabric_size' => ['required', function ($attribute, $value, $fail) use ($request) {
                $product = Product::find($request->product_id);
                if ($product && $product->category === 'fabric') {
                    if (!is_numeric($value) || $value < 5) {
                        $fail('Panjang kain minimal 5 meter.');
                    }
                } else {
                    if (!in_array($value, ['S', 'M', 'L', 'XL', 'XXL'])) {
                        $fail('Ukuran pakaian tidak valid.');
                    }
                }
            }],
            // ✅ Hapus deadline validation
            'special_notes' => 'nullable|string'
        ]);

        $design = Design::where('id', $validatedData['design_id'])
            ->where('user_id', Auth::id())
            ->firstOrFail();
        $product = Product::findOrFail($validatedData['product_id']);
        $konveksi = Konveksi::findOrFail($validatedData['convection_id']);
        $convectionUser = $konveksi->user;

        if (!$convectionUser || $convectionUser->role !== 'Convection') {
            return back()->withErrors(['convection_id' => 'Mitra konveksi tidak valid.']);
        }
        
        $customerData = [
            'name' => $request->input('customer_name'),
            'company' => $request->input('customer_company'),
            'email' => $request->input('customer_email'),
            'phone' => $request->input('customer_phone'),
            'address' => $request->input('customer_address'),
            'batik_type' => $request->input('batik_type'),
            'fabric_size' => $request->input('fabric_size'),
            // ✅ Hapus deadline dari customer_data
            'special_notes' => $request->input('special_notes'),
        ];

        $batikTypeMultiplier = [
            'Batik Tulis' => 3.0,
            'Batik Cap' => 2.0,
            'Batik Printing' => 1.0,
        ];
        $typeMultiplier = $batikTypeMultiplier[$validatedData['batik_type']] ?? 1.0;
        
        $sizeMultiplier = [
            'S' => 1.0,
            'M' => 1.05,
            'L' => 1.10,
            'XL' => 1.15,
            'XXL' => 1.20,
        ];
        
        if ($product->category === 'fabric') {
            $meterLength = floatval($validatedData['fabric_size']);
            $pricePerUnit = $product->base_price * $meterLength * $typeMultiplier;
        } else {
            $sizeMult = $sizeMultiplier[$validatedData['fabric_size']] ?? 1.0;
            $pricePerUnit = $product->base_price * $typeMultiplier * $sizeMult;
        }
        
        $totalPrice = $validatedData['quantity'] * $pricePerUnit;

        Production::create([
            'user_id' => Auth::id(),
            'convection_user_id' => $convectionUser->id,
            'design_id' => $design->id,
            'product_id' => $product->id,
            'quantity' => $validatedData['quantity'],
            'price_per_unit' => $pricePerUnit,
            'total_price' => $totalPrice,
            'production_status' => 'diterima',
            'payment_status' => 'unpaid',
            'customer_data' => $customerData,
        ]);

        return redirect()->route('production.index')
            ->with('success', 'Pesanan berhasil dibuat!');
    }

    public function show(Production $production)
    {
        $production->load(['design', 'konveksi', 'product']);
        
        return Inertia::render('User/ProductionDetail', [
            'production' => $production
        ]);
    }
}