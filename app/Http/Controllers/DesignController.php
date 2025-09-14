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
            ->get();

        return Inertia::render('User/Dashboard', [
            'designs' => $designs
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'canvas_data' => 'required|array',
            'thumbnail' => 'nullable|string' // Base64 image data
        ]);

        $thumbnailPath = null;

        // Simpan thumbnail jika ada
        if ($request->thumbnail) {
            // Hapus prefix data:image/jpeg;base64,
            $thumbnailData = substr($request->thumbnail, strpos($request->thumbnail, ',') + 1);
            $thumbnailData = base64_decode($thumbnailData);
            $filename = 'designs/thumbnails/' . Auth::id() . '_' . time() . '.jpg';
            
            Storage::disk('public')->put($filename, $thumbnailData);
            $thumbnailPath = Storage::url($filename);
        }

        $design = Design::create([
            'title' => $request->title,
            'description' => $request->description,
            'canvas_data' => $request->canvas_data,
            'image_url' => $thumbnailPath,
            'user_id' => Auth::id()
        ]);

        return redirect()->route('dashboard');
    }

    public function show($id)
    {
        $design = Design::where('user_id', Auth::id())
            ->findOrFail($id);

        return Inertia::render('Editor/DesignEditor', [
            'initialDesign' => $design
        ]);
    }

    public function update(Request $request, $id)
    {
        $design = Design::where('user_id', Auth::id())
            ->findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'canvas_data' => 'required|array',
            'thumbnail' => 'nullable|string'
        ]);

        $thumbnailPath = $design->image_url;

        // Update thumbnail jika ada
        if ($request->has('thumbnail') && $request->thumbnail) {
            // Hapus thumbnail lama jika ada
            if ($design->image_url) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $design->image_url));
            }

            $thumbnailData = substr($request->thumbnail, strpos($request->thumbnail, ',') + 1);
            $thumbnailData = base64_decode($thumbnailData);
            $filename = 'designs/thumbnails/' . Auth::id() . '_' . time() . '.jpg';
            
            Storage::disk('public')->put($filename, $thumbnailData);
            $thumbnailPath = Storage::url($filename);
        }

        $design->update([
            'title' => $request->title,
            'description' => $request->description,
            'canvas_data' => $request->canvas_data,
            'image_url' => $thumbnailPath
        ]);

        return redirect()->route('dashboard');
    }

    public function destroy($id)
    {
        $design = Design::where('user_id', Auth::id())
            ->findOrFail($id);

        // Hapus thumbnail jika ada
        if ($design->image_url) {
            $path = str_replace('/storage/', '', $design->image_url);
            Storage::disk('public')->delete($path);
        }

        $design->delete();

        return response()->json([
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

        // Simpan gambar AI sebagai file (bisa untuk thumbnail & sumber gambar di canvas)
        $imageData = substr($request->image_data, strpos($request->image_data, ',') + 1);
        $imageData = base64_decode($imageData);
        $filename = 'designs/generated/' . Auth::id() . '_' . time() . '.jpg';
        Storage::disk('public')->put($filename, $imageData);
        $imageUrl = asset(Storage::url($filename));

        // Buat struktur data canvas dengan gambar AI di tengah
        $canvasData = [
            [
                'id' => 'obj' . time(),
                'x' => 100, // Posisi default X
                'y' => 100, // Posisi default Y
                'width' => 600, // Ukuran default
                'height' => 600,
                'rotation' => 0,
                'src' => $imageUrl,
            ]
        ];

        $design = Design::create([
            'title' => $request->title,
            'canvas_data' => $canvasData,
            'image_url' => $imageUrl, // Gunakan gambar AI juga sebagai thumbnail
            'user_id' => Auth::id(),
        ]);

        // Lempar pengguna ke halaman editor dengan desain baru ini
        return redirect()->route('dashboard', ['design' => $design->id]);
    }
}