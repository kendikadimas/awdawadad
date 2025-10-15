<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Motif extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category',
        'location',
        'file_path',
        'image_url',
        'user_id',
        'is_active',
        'is_featured',
        'colors',
    ];

    protected $casts = [
        'colors' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    // Relationship
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getTimeAgoAttribute()
    {
        return $this->created_at->diffForHumans();
    }
}