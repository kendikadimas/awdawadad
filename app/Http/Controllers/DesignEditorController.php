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
        $canvasWidth = max(200, (int) $request->query('width', 800));
        $canvasHeight = max(200, (int) $request->query('height', 600));

        return Inertia::render('Editor/DesignEditor', [
            'initialDesign' => null,
            'canvasSize' => [
                'width' => $canvasWidth,
                'height' => $canvasHeight,
            ],
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
        if (is_string($design->canvas_data)) {
            $design->canvas_data = json_decode($design->canvas_data, true);
        }

        return Inertia::render('Editor/DesignEditor', [
            'initialDesign' => $design
        ]);
    }
}