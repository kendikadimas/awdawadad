<?php

namespace App\Http\Controllers;

use App\Models\UserMotif;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class UserMotifController extends Controller
{
    public function index()
    {
        return response()->json([
            'motifs' => UserMotif::where('user_id', Auth::id())
                ->latest()
                ->get()
                ->map(fn ($motif) => [
                    'id' => "user-{$motif->id}",
                    'name' => $motif->name,
                    'file_path' => $motif->file_path,
                    'preview_image_path' => $motif->file_path,
                    'is_personal' => true,
                ]),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|image|max:3072',
            'name' => 'nullable|string|max:120',
        ]);

        $path = $request->file('file')->store('user-motifs/'.Auth::id(), 'public');

        $motif = UserMotif::create([
            'user_id' => Auth::id(),
            'name' => $request->input('name', $request->file('file')->getClientOriginalName()),
            'file_path' => Storage::url($path),
        ]);

        return response()->json([
            'motif' => [
                'id' => "user-{$motif->id}",
                'name' => $motif->name,
                'file_path' => $motif->file_path,
                'preview_image_path' => $motif->file_path,
                'is_personal' => true,
            ],
        ], 201);
    }
}