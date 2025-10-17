<?php

namespace App\Http\Controllers;

use App\Models\Design;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DesignController extends Controller
{
    public function index()
    {
        $designs = Auth::user()->designs()
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($design) {
                if (is_string($design->canvas_data)) {
                    $design->canvas_data = json_decode($design->canvas_data, true);
                }
                $design->image_url = $design->image_url
                    ? Storage::url($design->image_url)
                    : null;

                return $design;
            });

        return Inertia::render('User/Dashboard', [
            'designs' => $designs
        ]);
    }

    public function store(Request $request)
    {
        \Log::info('=== STORING DESIGN ===');
        \Log::info('Request data:', $request->all());

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            // 'description' => 'nullable|string',
            'canvas_data' => 'required|array',
            'canvas_width' => 'required|integer|min:200',
            'canvas_height' => 'required|integer|min:200',
            'thumbnail' => 'nullable|string'
        ]);

        \Log::info('Validated data:', $validated);

        $thumbnailPath = null;

        if ($request->thumbnail) {
            $thumbnailData = substr($request->thumbnail, strpos($request->thumbnail, ',') + 1);
            $thumbnailData = base64_decode($thumbnailData);
            $filename = 'designs/thumbnails/' . Auth::id() . '_' . time() . '.jpg';

            Storage::disk('public')->put($filename, $thumbnailData);
            $thumbnailPath = $filename;
        }

        $design = Design::create([
            'title' => $validated['title'],
            // 'description' => $validated['description'],
            'canvas_data' => json_encode($validated['canvas_data']),
            'canvas_width' => (int) $validated['canvas_width'],
            'canvas_height' => (int) $validated['canvas_height'],
            'image_url' => $thumbnailPath,
            'user_id' => Auth::id()
        ]);

        \Log::info('Design created:', [
            'id' => $design->id,
            'canvas_width' => $design->canvas_width,
            'canvas_height' => $design->canvas_height,
        ]);

        return redirect()->route('user.dashboard');
    }

    public function show($id)
    {
        $design = Design::where('user_id', Auth::id())
            ->findOrFail($id);

        // Decode canvas_data jika string
        if (is_string($design->canvas_data)) {
            $design->canvas_data = json_decode($design->canvas_data, true);
        }

        // Pastikan canvas_width dan canvas_height ada
        if (!$design->canvas_width) {
            $design->canvas_width = 800;
        }
        if (!$design->canvas_height) {
            $design->canvas_height = 600;
        }

        return Inertia::render('Editor/DesignEditor', [
            'initialDesign' => [
                'id' => $design->id,
                'title' => $design->title,
                // 'description' => $design->description,
                'canvas_data' => $design->canvas_data,
                'canvas_width' => (int) $design->canvas_width,
                'canvas_height' => (int) $design->canvas_height,
                'image_url' => $design->image_url ? Storage::url($design->image_url) : null,
                'created_at' => $design->created_at,
                'updated_at' => $design->updated_at,
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        $design = Design::where('user_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            // 'description' => 'nullable|string',
            'canvas_data' => 'required|array',
            'canvas_width' => 'required|integer|min:200',
            'canvas_height' => 'required|integer|min:200',
            'thumbnail' => 'nullable|string'
        ]);

        \Log::info('Updating design', [
            'design_id' => $id,
            'canvas_width' => $validated['canvas_width'],
            'canvas_height' => $validated['canvas_height'],
        ]);

        $thumbnailPath = $design->image_url;

        if ($request->has('thumbnail') && $request->thumbnail) {
            if ($design->image_url) {
                Storage::disk('public')->delete($design->image_url);
            }

            $thumbnailData = substr($request->thumbnail, strpos($request->thumbnail, ',') + 1);
            $thumbnailData = base64_decode($thumbnailData);
            $filename = 'designs/thumbnails/' . Auth::id() . '_' . time() . '.jpg';
            
            Storage::disk('public')->put($filename, $thumbnailData);
            $thumbnailPath = $filename;
        }

        $design->update([
            'title' => $validated['title'],
            // 'description' => $validated['description'],
            'canvas_data' => json_encode($validated['canvas_data']),
            'canvas_width' => (int) $validated['canvas_width'],
            'canvas_height' => (int) $validated['canvas_height'],
            'image_url' => $thumbnailPath
        ]);

        return redirect()->route('user.dashboard')->with('success', 'Design berhasil diupdate!');
    }

    public function destroy($id)
    {
        $design = Design::where('user_id', Auth::id())
            ->findOrFail($id);

        // Hapus file thumbnail jika ada
        if ($design->image_url) {
            Storage::disk('public')->delete($design->image_url);
        }

        $design->delete();

        return Inertia::render('User/Dashboard', [
            'success' => true,
            'message' => 'Desain berhasil dihapus'
        ]);
    }

    public function storeFromAi(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'image_data' => 'required|string', // Base64
        ]);

        // Simpan gambar AI sebagai file
        $imageData = substr($request->image_data, strpos($request->image_data, ',') + 1);
        $imageData = base64_decode($imageData);
        $filename = 'designs/generated/' . Auth::id() . '_' . time() . '.jpg';
        Storage::disk('public')->put($filename, $imageData);

        // Buat struktur data canvas dengan gambar AI
        $canvasData = [
            [
                'id' => 'obj' . time(),
                'x' => 100,
                'y' => 100,
                'width' => 600,
                'height' => 600,
                'rotation' => 0,
                'src' => Storage::url($filename), // ✅ Gunakan full URL untuk canvas
            ]
        ];

        $design = Design::create([
            'title' => $request->title,
            'canvas_data' => json_encode($canvasData),
            'canvas_width' => 800,
            'canvas_height' => 600,
            'image_url' => $filename, // ✅ Simpan path relatif untuk thumbnail
            'user_id' => Auth::id(),
        ]);
 
        return redirect()->route('dashboard')->with('success', 'Desain berhasil disimpan!');
    }
}