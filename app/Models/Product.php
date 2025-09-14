<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'product';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'base_price',
        'preview_3d_model_id',
    ];

    public function preview3dModel(): BelongsTo
    {
        return $this->belongsTo(Preview3dModel::class, 'preview_3d_model_id');
    }

    public function productions(): HasMany
    {
        return $this->hasMany(Production::class);
    }
}