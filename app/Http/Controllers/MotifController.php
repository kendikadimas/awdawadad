<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Motif;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MotifController extends Controller
{
    public function index(Request $request)
    {
        $query = Motif::active()->with('user');

        if ($request->category && $request->category !== 'Semua') {
            $query->where('category', $request->category);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhere('location', 'like', '%' . $request->search . '%');
            });
        }

        $motifs = $query->orderBy('created_at', 'desc')->get();

        $motifData = $motifs->map(function ($motif) {
            return [
                'id' => $motif->id,
                'title' => $motif->name,
                'description' => $motif->description,
                'category' => $motif->category,
                'timeAgo' => $motif->time_ago,
                'location' => $motif->location,
                'image' => $motif->image_url,
                'colors' => $motif->colors ?? ['#8B4513', '#D2691E', '#F4A460'],
            ];
        });

        return Inertia::render('User/Motif', [
            'motifs' => $motifData,
            'filters' => [
                'category' => $request->category,
                'search' => $request->search,
            ]
        ]);
    }

    public function getForEditor(): JsonResponse
    {
        Log::info('=== GET MOTIFS FOR EDITOR ===');
        
        try {
            $motifs = Motif::where('is_active', true)
                ->orderBy('name')
                ->get()
                ->map(function (Motif $motif) {
                    // Ambil langsung dari database tanpa modifikasi
                    // Karena path sudah lengkap: /images/motifs/xx.svg
                    $imageUrl = $motif->image_url ?? $motif->file_path;
                    
                    Log::info("Motif {$motif->id}: {$motif->name} | URL: {$imageUrl}");

                    return [
                        'id' => $motif->id,
                        'name' => $motif->name,
                        'description' => $motif->description ?? '',
                        'category' => $motif->category ?? 'Uncategorized',
                        'preview_image_path' => $imageUrl, // Langsung pakai dari DB
                        'file_path' => $imageUrl,
                        'image_url' => $imageUrl,
                    ];
                });

            Log::info('Total motifs: ' . $motifs->count());

            return response()->json([
                'motifs' => $motifs,
                'total' => $motifs->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error in getForEditor: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            return response()->json([
                'motifs' => [],
                'total' => 0,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function storeFromAi(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|string',
                'name' => 'required|string|max:255',
                'prompt' => 'nullable|string',
            ]);

            $imageData = $request->image;
            if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $type)) {
                $imageData = substr($imageData, strpos($imageData, ',') + 1);
                $type = strtolower($type[1]);

                $imageData = base64_decode($imageData);
                $fileName = 'ai_' . time() . '.' . $type;
                
                $path = 'motifs/' . $fileName;
                Storage::disk('public')->put($path, $imageData);
                $publicUrl = Storage::url($path);

                $motif = Motif::create([
                    'name' => $request->name,
                    'description' => $request->prompt ?? 'AI Generated Motif',
                    'category' => 'AI Generated',
                    'file_path' => $publicUrl,
                    'image_url' => $publicUrl,
                    'user_id' => Auth::id(),
                    'is_active' => true,
                ]);

                return response()->json([
                    'message' => 'Motif AI berhasil disimpan',
                    'motif' => [
                        'id' => $motif->id,
                        'name' => $motif->name,
                        'preview_image_path' => $publicUrl,
                        'image_url' => $publicUrl,
                    ]
                ]);
            }

            throw new \Exception('Invalid image format');
        } catch (\Exception $e) {
            Log::error('Error in storeFromAi: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal menyimpan motif',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}