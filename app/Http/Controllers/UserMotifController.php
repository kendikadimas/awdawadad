<?php

namespace App\Http\Controllers;

use App\Models\Motif;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class UserMotifController extends Controller
{
    /**
     * Get user's personal motifs
     */
    public function index()
    {
        try {
            \Log::info('=== GET USER MOTIFS ===');
            \Log::info('User ID: ' . Auth::id());
            
            $motifs = Motif::where('user_id', Auth::id())
                ->where('is_active', true)
                ->orderBy('created_at', 'desc')
                ->get();
            
            \Log::info('User motifs count: ' . $motifs->count());
            
            $result = $motifs->map(function ($motif) {
                // Ambil langsung dari database
                $imageUrl = $motif->image_url ?? $motif->file_path;
                
                return [
                    'id' => $motif->id,
                    'name' => $motif->name,
                    'description' => $motif->description,
                    'category' => $motif->category,
                    'file_path' => $imageUrl,
                    'preview_image_path' => $imageUrl,
                    'image_url' => $imageUrl,
                    'is_personal' => true,
                ];
            });
            
            return response()->json(['motifs' => $result]);
        } catch (\Exception $e) {
            \Log::error('Error in UserMotifController@index: ' . $e->getMessage());
            
            return response()->json([
                'motifs' => [],
                'message' => 'No personal motifs found'
            ], 200);
        }
    }

    /**
     * Store user's uploaded motif
     */
    public function store(Request $request)
    {
        try {
            \Log::info('=== STORE USER MOTIF ===');
            
            $request->validate([
                'file' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
                'name' => 'required|string|max:255',
            ]);
            
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            $path = $file->storeAs('motifs', $fileName, 'public');
            $publicUrl = Storage::url($path);
            
            \Log::info('File stored: ' . $publicUrl);
            
            $motif = Motif::create([
                'name' => $request->name,
                'description' => 'User uploaded motif',
                'category' => 'Personal',
                'file_path' => $publicUrl,
                'image_url' => $publicUrl,
                'user_id' => Auth::id(),
                'is_active' => true,
            ]);
            
            return response()->json([
                'message' => 'Motif berhasil diunggah',
                'motif' => [
                    'id' => $motif->id,
                    'name' => $motif->name,
                    'description' => $motif->description,
                    'category' => $motif->category,
                    'file_path' => $publicUrl,
                    'preview_image_path' => $publicUrl,
                    'image_url' => $publicUrl,
                    'is_personal' => true,
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error storing motif: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Gagal mengunggah motif',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}