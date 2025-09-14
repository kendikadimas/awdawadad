<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Relasi ke Design
     */
    public function designs()
    {
        return $this->hasMany(Design::class);
    }

    // Pengguna bisa mengunggah banyak motif
    public function motifs(): HasMany
    {
        return $this->hasMany(Motif::class);
    }
    
    // Pesanan produksi yang dibuat oleh pengguna (sebagai customer)
    public function productionOrders(): HasMany
    {
        return $this->hasMany(Production::class, 'user_id');
    }

    // Pekerjaan produksi yang dikerjakan oleh pengguna (sebagai konveksi)
    public function convectionJobs(): HasMany
    {
        return $this->hasMany(Production::class, 'convection_user_id');
    }
}
