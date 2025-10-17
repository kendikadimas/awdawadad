<?php

namespace App\Http\Controllers;

use App\Models\Motif;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class MotifController extends Controller
{
    /**
     * Get motifs for editor (global motifs only)
     */
    public function editor()
    {
        try {
            \Log::info('=== FETCHING EDITOR MOTIFS ===');

            $motifs = Motif::where('is_active', true)
                ->whereNull('user_id')
                ->get();

            $motifsData = $motifs->map(function ($motif) {
                $imagePath = $motif->file_path;
                
                // File ada di public/images/motifs/
                // Path di database: /images/motifs/1.svg
                // Langsung pakai path dari database, jangan tambah /storage
                
                if (str_starts_with($imagePath, 'http')) {
                    $imageUrl = $imagePath;
                } else {
                    // Langsung gunakan path dari database
                    $imageUrl = $imagePath;
                }

                \Log::info('Processing motif', [
                    'id' => $motif->id,
                    'original_path' => $motif->file_path,
                    'processed_url' => $imageUrl
                ]);

                return [
                    'id' => $motif->id,
                    'name' => $motif->name,
                    'description' => $motif->description,
                    'category' => $motif->category,
                    'file_path' => $imageUrl,
                    'preview_image_path' => $imageUrl,
                    'image_url' => $imageUrl,
                    'is_personal' => false,
                ];
            });

            \Log::info('Editor motifs processed successfully', [
                'count' => $motifsData->count(),
                'sample' => $motifsData->take(3)->toArray()
            ]);

            return response()->json([
                'motifs' => $motifsData,
                'count' => $motifsData->count()
            ]);

        } catch (\Exception $e) {
            \Log::error('=== ERROR FETCHING EDITOR MOTIFS ===');
            \Log::error('Message: ' . $e->getMessage());
            \Log::error('Trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'motifs' => [],
                'error' => $e->getMessage(),
                'message' => 'Failed to fetch motifs'
            ], 500);
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $motifs = Motif::where('is_active', true)
            ->whereNull('user_id')
            ->paginate(20);

        return Inertia::render('Admin/Motifs/Index', [
            'motifs' => $motifs
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            \Log::info('=== UPLOAD MOTIF REQUEST ===');
            \Log::info('Request data:', $request->all());
            \Log::info('Has file:', ['has_file' => $request->hasFile('file')]);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'category' => 'required|string|max:100',
                'file' => 'required|file|mimes:svg|max:2048',
            ]);

            if ($validator->fails()) {
                \Log::error('Validation failed:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            if (!$request->hasFile('file')) {
                return response()->json([
                    'success' => false,
                    'message' => 'No file uploaded'
                ], 400);
            }

            $file = $request->file('file');
            
            \Log::info('File info:', [
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize()
            ]);

            // Generate unique filename
            $filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.svg';
            
            // Simpan file ke public/images/motifs
            $path = $file->move(public_path('images/motifs'), $filename);
            
            // Path untuk disimpan di database
            $filePath = '/images/motifs/' . $filename;

            \Log::info('File saved:', [
                'physical_path' => $path,
                'db_path' => $filePath
            ]);

            // Simpan ke database
            $motif = Motif::create([
                'name' => $request->name,
                'description' => $request->description,
                'category' => $request->category,
                'file_path' => $filePath,
                'image_url' => $filePath,
                'preview_image_path' => $filePath,
                'user_id' => Auth::id(),
                'is_active' => true,
            ]);

            \Log::info('Motif created:', $motif->toArray());

            return response()->json([
                'success' => true,
                'message' => 'Motif berhasil diunggah',
                'motif' => [
                    'id' => $motif->id,
                    'name' => $motif->name,
                    'description' => $motif->description,
                    'category' => $motif->category,
                    'file_path' => $filePath,
                    'image_url' => $filePath,
                    'preview_image_path' => $filePath,
                    'is_personal' => true,
                ]
            ], 201);

        } catch (\Exception $e) {
            \Log::error('=== ERROR UPLOADING MOTIF ===');
            \Log::error('Message: ' . $e->getMessage());
            \Log::error('Trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengunggah motif',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}