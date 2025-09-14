<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Motif;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MotifController extends Controller
{
    public function create()
    {
        return Inertia::render('Admin/Motifs/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'motif_file' => 'required|image|mimes:svg,png,jpg|max:2048', // SVG, PNG, atau JPG
        ]);

        // Simpan file ke storage/app/public/motifs
        $filePath = $request->file('motif_file')->store('motifs', 'public');

        Motif::create([
            'name' => $request->name,
            'category' => $request->category,
            'preview_image_path' => $filePath, // Kita samakan preview dan file utama
            'file_path' => $filePath,
        ]);

        return to_route('admin.motifs.create')->with('message', 'Motif berhasil di-upload!');
    }
}