<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Production extends Model
{
    use HasFactory;

    protected $fillable = [
        'production_status',
        'quantity',
        'price_per_unit',
        'total_price',
        'payment_proof_url',
        'payment_status',
        'convection_user_id',
        'user_id',
        'design_id',
        'product_id',
        'customer_data'
    ];

    protected $casts = [
        'customer_data' => 'array',
        'price_per_unit' => 'decimal:2',
        'total_price' => 'decimal:2',
    ];

    // Relationships
    public function design()
    {
        return $this->belongsTo(Design::class);
    }

    public function convection()
    {
        return $this->belongsTo(Konveksi::class, 'convection_user_id', 'id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function convectionUser()
    {
        return $this->belongsTo(User::class, 'convection_user_id');
    }

    // Accessors
    public function getStatusColorAttribute()
    {
        return match($this->production_status) {
            'diterima' => '#EF4444',
            'diproses' => '#F59E0B',
            'dikirim' => '#3B82F6',
            'diterima_selesai' => '#10B981',
            'ditolak' => '#6B7280',
            default => '#6B7280'
        };
    }

    public function getStatusLabelAttribute()
    {
        return match($this->production_status) {
            'diterima' => 'Menunggu Konfirmasi',
            'diproses' => 'Dalam Produksi',
            'dikirim' => 'Dikirim',
            'diterima_selesai' => 'Selesai',
            'ditolak' => 'Ditolak',
            default => 'Unknown'
        };
    }

    public function getProgressPercentageAttribute()
    {
        return match($this->production_status) {
            'diterima' => 10,
            'diproses' => 60,
            'dikirim' => 85,
            'diterima_selesai' => 100,
            'ditolak' => 0,
            default => 0
        };
    }
}