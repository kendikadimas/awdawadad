<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Motif;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MotifController extends Controller
{
    public function index(Request $request)
    {
        $query = Motif::active()->with('user');

        // Filter berdasarkan kategori
        if ($request->category && $request->category !== 'Semua') {
            $query->where('category', $request->category);
        }

        // Search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhere('location', 'like', '%' . $request->search . '%');
            });
        }

        $motifs = $query->orderBy('created_at', 'desc')->get();

        // Transform data untuk frontend
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

    // API endpoint untuk mendapatkan motif untuk editor
    public function getForEditor(): JsonResponse
    {
        $motifs = Motif::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function (Motif $motif) {
                // Cari path preview dari berbagai kolom
                $preview = $motif->preview_image_path 
                    ?? $motif->image_url 
                    ?? $motif->file_path;

                // Convert relative path ke URL publik
                if ($preview && !Str::startsWith($preview, ['http://', 'https://'])) {
                    // Jika dimulai dengan '/', anggap sudah path publik
                    if (!Str::startsWith($preview, '/')) {
                        $preview = Storage::url($preview);
                    }
                }

                return [
                    'id' => $motif->id,
                    'name' => $motif->name,
                    'description' => $motif->description ?? '',
                    'category' => $motif->category ?? 'Uncategorized',
                    'preview_image_path' => $preview,
                    'file_path' => $preview, // Untuk kompatibilitas
                ];
            });

        \Log::info('Fetched motifs for editor', ['count' => $motifs->count()]);

        return response()->json([
            'motifs' => $motifs,
            'total' => $motifs->count(),
        ]);
    }
}