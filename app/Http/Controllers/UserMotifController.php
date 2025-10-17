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
            \Log::info('=== FETCHING USER MOTIFS ===');
            \Log::info('User ID: ' . Auth::id());

            $motifs = Motif::where('user_id', Auth::id())
                ->where('is_active', true)
                ->get();

            \Log::info('User motifs count:', ['count' => $motifs->count()]);

            $motifsData = $motifs->map(function ($motif) {
                $imagePath = $motif->file_path;
                
                // Untuk user motifs, gunakan Storage::url
                if (str_starts_with($imagePath, 'http')) {
                    $imageUrl = $imagePath;
                } else {
                    $imageUrl = Storage::url($imagePath);
                }

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

            \Log::info('User motifs processed successfully');

            return response()->json([
                'success' => true,
                'motifs' => $motifsData,
                'count' => $motifsData->count()
            ]);

        } catch (\Exception $e) {
            \Log::error('=== ERROR FETCHING USER MOTIFS ===');
            \Log::error('Message: ' . $e->getMessage());
            \Log::error('File: ' . $e->getFile());
            \Log::error('Line: ' . $e->getLine());

            return response()->json([
                'success' => false,
                'motifs' => [],
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created motif
     */
    public function store(Request $request)
    {
        try {
            \Log::info('=== STORE USER MOTIF ===');
            \Log::info('Request all:', $request->all());
            \Log::info('Has file:', ['has_file' => $request->hasFile('file')]); // ✅ FIX: Ubah jadi array
            
            $validated = $request->validate([
                'file' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
                'name' => 'required|string|max:255',
            ]);
            
            \Log::info('Validation passed');
            
            if (!$request->hasFile('file')) {
                return response()->json([
                    'success' => false,
                    'message' => 'File tidak ditemukan'
                ], 422);
            }
            
            $file = $request->file('file');
            
            \Log::info('File details:', [
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime' => $file->getMimeType(),
            ]);
            
            // Generate filename dengan timestamp
            $fileName = Auth::id() . '_' . time() . '_' . $file->getClientOriginalName();
            
            // Simpan ke storage/app/public/motifs/user
            $path = $file->storeAs('motifs/user', $fileName, 'public');
            
            // URL untuk akses file
            $publicUrl = Storage::url($path);
            
            \Log::info('File stored at:', [
                'path' => $path,
                'url' => $publicUrl,
            ]);
            
            // Create motif record
            $motif = Motif::create([
                'name' => $validated['name'],
                'description' => $request->description ?? 'Motif diunggah oleh pengguna',
                'category' => $request->category ?? 'Personal',
                'file_path' => $path,
                'image_url' => $publicUrl,
                'preview_image_path' => $publicUrl,
                'user_id' => Auth::id(),
                'is_active' => true,
            ]);
            
            \Log::info('Motif created:', ['id' => $motif->id]);
            
            // Return response yang konsisten
            return response()->json([
                'success' => true,
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
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error:', $e->errors());
            
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            \Log::error('Error storing motif:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengunggah motif: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }
}