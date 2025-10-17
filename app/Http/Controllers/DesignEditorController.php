<?php
namespace App\Http\Controllers;

use App\Models\Design;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DesignEditorController extends Controller
{
    /**
     * Show the editor for creating new design
     */
    public function create(Request $request)
    {
        return Inertia::render('Editor/DesignEditor', [
            'initialDesign' => null,
        ]);
    }

    /**
     * Show the editor for editing existing design
     */
    public function show(Design $design)
    {
        // Pastikan user hanya bisa membuka design miliknya sendiri
        if ($design->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        // Decode canvas_data jika berupa string JSON
        $canvasData = $design->canvas_data;
        if (is_string($canvasData)) {
            $canvasData = json_decode($canvasData, true);
        }

        // ✅ PERBAIKAN: Pastikan canvas_width dan canvas_height adalah integer
        $canvasWidth = (int) ($design->canvas_width ?? 800);
        $canvasHeight = (int) ($design->canvas_height ?? 600);

        \Log::info('Loading design for edit', [
            'design_id' => $design->id,
            'canvas_width' => $canvasWidth,
            'canvas_height' => $canvasHeight,
            'raw_width' => $design->canvas_width,
            'raw_height' => $design->canvas_height,
        ]);

        $initialDesign = [
            'id' => $design->id,
            'title' => $design->title,
            'description' => $design->description,
            'canvas_data' => $canvasData ?? [],
            'canvas_width' => $canvasWidth,
            'canvas_height' => $canvasHeight,
            'image_url' => $design->image_url,
            'created_at' => $design->created_at->toISOString(),
            'updated_at' => $design->updated_at->toISOString(),
        ];

        return Inertia::render('Editor/DesignEditor', [
            'initialDesign' => $initialDesign,
        ]);
    }
}