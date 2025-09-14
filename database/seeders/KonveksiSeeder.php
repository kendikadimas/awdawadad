<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Konveksi;
use Illuminate\Support\Facades\Hash;

class KonveksiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Data Contoh untuk 10 Konveksi
        $convectionData = [
            [
                'name' => 'Batik Jaya Abadi',
                'location' => 'Pekalongan',
                'description' => 'Berpengalaman lebih dari 20 tahun dalam produksi batik tulis dan cap dengan kualitas ekspor.',
                'rating' => 4.8,
                'is_verified' => true,
            ],
            [
                'name' => 'Solo Cantik Garmen',
                'location' => 'Solo',
                'description' => 'Spesialis produksi kemeja dan gaun batik modern untuk pasar domestik. Kualitas jahitan butik.',
                'rating' => 4.5,
                'is_verified' => true,
            ],
            [
                'name' => 'Griya Batik Cirebon',
                'location' => 'Cirebon',
                'description' => 'Menerima pesanan makloon untuk motif Mega Mendung dan motif khas Cirebon lainnya.',
                'rating' => 4.2,
                'is_verified' => false,
            ],
            [
                'name' => 'Jogja Klasik Konveksi',
                'location' => 'Yogyakarta',
                'description' => 'Fokus pada pembuatan seragam kantor dan komunitas dengan sentuhan motif batik klasik.',
                'rating' => 4.7,
                'is_verified' => true,
            ],
            [
                'name' => 'Madura Warna Cemerlang',
                'location' => 'Madura',
                'description' => 'Produsen batik Madura dengan ciri khas warna-warna cerah dan motif yang berani.',
                'rating' => 4.4,
                'is_verified' => false,
            ],
            [
                'name' => 'Sentra Batik Lasem',
                'location' => 'Lasem',
                'description' => 'Menjaga tradisi Batik Lasem yang kaya akan akulturasi budaya Tionghoa-Jawa.',
                'rating' => 4.9,
                'is_verified' => true,
            ],
            [
                'name' => 'Busana Parahyangan',
                'location' => 'Bandung',
                'description' => 'Konveksi modern yang menggabungkan desain fashion terkini dengan motif batik kontemporer.',
                'rating' => 4.6,
                'is_verified' => true,
            ],
            [
                'name' => 'Pesisir Indah Garmen',
                'location' => 'Pekalongan',
                'description' => 'Menerima pesanan partai besar untuk produk daster dan pakaian santai bermotif batik.',
                'rating' => 4.0,
                'is_verified' => false,
            ],
            [
                'name' => 'Mahkota Batik Solo',
                'location' => 'Solo',
                'description' => 'Menyediakan jasa jahit dan produksi batik premium untuk acara formal dan pernikahan.',
                'rating' => 4.8,
                'is_verified' => true,
            ],
            [
                'name' => 'Karya Anak Bangsa Konveksi',
                'location' => 'Jakarta',
                'description' => 'Startup konveksi yang melayani kebutuhan seragam event dan perusahaan di area Jabodetabek.',
                'rating' => 4.3,
                'is_verified' => false,
            ],
        ];

        foreach ($convectionData as $index => $data) {
            // Membuat email unik berdasarkan nama konveksi
            $email = strtolower(str_replace(' ', '', $data['name'])) . '@example.com';

            // 1. Buat atau cari akun pengguna (User) terlebih dahulu
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('password'), // Password default untuk semua
                    'role' => 'Convection', // Pastikan peran di-set sebagai 'Convection'
                ]
            );

            // 2. Buat atau perbarui data detail di tabel 'konveksis'
            Konveksi::updateOrCreate(
                ['user_id' => $user->id], // Cari berdasarkan user_id untuk menghindari duplikasi
                [
                    'name' => $data['name'],
                    'location' => $data['location'],
                    'no_telp' => '081234567' . sprintf('%03d', $index + 1), // Nomor telepon unik
                    'description' => $data['description'],
                    'rating' => $data['rating'],
                    'is_verified' => $data['is_verified'],
                    'icon' => '/storage/konveksi/icons/default.png', // Path ikon default
                    'documentation' => json_encode([ // Contoh galeri
                        '/storage/konveksi/gallery/sample1.jpg',
                        '/storage/konveksi/gallery/sample2.jpg',
                    ]),
                ]
            );
        }
    }
}