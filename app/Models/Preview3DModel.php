<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Preview3dModel extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */

    protected $table = 'preview_3d_models';
    protected $fillable = [
        'model_type',
        'model_url',
        'previewImageUrl',
    ];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'preview_3d_model_id');
    }
}