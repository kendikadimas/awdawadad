<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Design extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        // 'description',
        'image_url',
        'canvas_data',
        'canvas_width',
        'canvas_height',
        'user_id',
        'preview_3d_models_id',
    ];

    protected $casts = [
        'canvas_data' => 'array', // Otomatis konversi JSON ke array
        'canvas_width' => 'integer',
        'canvas_height' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function preview3DModel(): BelongsTo
    {
        return $this->belongsTo(Preview3DModel::class, 'preview_3d_models_id');
    }
}