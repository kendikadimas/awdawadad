<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Motif extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category',
        'location',
        'image_url',
        'file_path',
        'colors',
        'is_active',
        'is_featured',
        'user_id',
    ];

    protected $casts = [
        'colors' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scope untuk motif aktif
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope untuk motif featured
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    // Accessor untuk time ago
    public function getTimeAgoAttribute()
    {
        return $this->created_at->diffForHumans();
    }
}