<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Membuat Akun Admin
        User::firstOrCreate(
            ['email' => 'admin@larasena.com'], // Kunci unik untuk dicari
            [
                'name' => 'Admin Larasena',
                'password' => Hash::make('password'), // Ganti dengan password yang aman
                'role' => 'Admin',
            ]
        );

        // Membuat Akun Konveksi
        User::firstOrCreate(
            ['email' => 'konveksi.partner1@larasena.com'], // Kunci unik untuk dicari
            [
                'name' => 'Mitra Konveksi 1',
                'password' => Hash::make('password'), // Ganti dengan password yang aman
                'role' => 'Convection',
            ]
        );
        
        // Anda bisa menambahkan user 'General' juga jika perlu
        User::firstOrCreate(
            ['email' => 'user@larasena.com'],
            [
                'name' => 'User General',
                'password' => Hash::make('password'),
                'role' => 'General',
            ]
        );
    }
}