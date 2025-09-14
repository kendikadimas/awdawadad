<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Product;
use App\Models\Design;
use App\Models\Production;
use App\Models\Preview3dModel; // 1. Impor model Preview3dModel
use Illuminate\Support\Facades\Hash;

class KonveksiDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Cari user Admin dan Konveksi yang sudah ada dari UserSeeder
        $convectionUser = User::where('role', 'Convection')->first();
        if (!$convectionUser) {
            $this->command->error('User dengan peran "Convection" tidak ditemukan. Jalankan UserSeeder terlebih dahulu.');
            return;
        }

        // 2. BUAT DATA INDUK TERLEBIH DAHULU
        // Buat satu model 3D dummy jika belum ada
        $previewModel = Preview3dModel::firstOrCreate(
            ['model_type' => 'kaos'],
            [
                'model_url' => '/models/tshirt.glb',
                'previewImageUrl' => '/images/mockups/tshirt_preview.jpg'
            ]
        );

        // Buat beberapa pengguna customer baru
        $customer1 = User::firstOrCreate(['email' => 'nadzare@example.com'], ['name' => 'Nadzare', 'password' => Hash::make('password'), 'role' => 'General']);
        $customer2 = User::firstOrCreate(['email' => 'kafah@example.com'], ['name' => 'Kafah', 'password' => Hash::make('password'), 'role' => 'General']);
        $customer3 = User::firstOrCreate(['email' => 'edwi@example.com'], ['name' => 'Edwi', 'password' => Hash::make('password'), 'role' => 'General']);
        $customers = collect([$customer1, $customer2, $customer3]);

        // 3. SEKARANG BUAT PRODUK DENGAN ID YANG VALID
        // Buat beberapa produk dummy yang menggunakan ID dari model 3D di atas
        $productKaos = Product::firstOrCreate(
            ['name' => 'Kaos Polos Putih'],
            [
                'description' => 'Kaos katun combed 30s',
                'base_price' => 50000,
                'preview_3d_model_id' => $previewModel->id // Gunakan ID yang valid
            ]
        );
        $productKemeja = Product::firstOrCreate(
            ['name' => 'Kemeja Flanel'],
            [
                'description' => 'Kemeja',
                'base_price' => 120000,
                'preview_3d_model_id' => $previewModel->id // Gunakan ID yang valid
            ]
        );

        // Buat beberapa desain dan pesanan produksi dummy
        $customers->each(function ($customer) use ($productKaos, $productKemeja, $convectionUser) {
            $design = Design::create([
                'title' => 'Desain Keren ' . $customer->name,
                'canvas_data' => '[]',
                'image_url' => '/storage/designs/thumbnails/default.jpg',
                'user_id' => $customer->id,
            ]);

            Production::create([
                'production_status' => 'diterima_selesai',
                'quantity' => rand(10, 50),
                'price_per_unit' => $productKaos->base_price,
                'total_price' => rand(10, 50) * $productKaos->base_price,
                'payment_status' => 'paid',
                'convection_user_id' => $convectionUser->id,
                'user_id' => $customer->id,
                'design_id' => $design->id,
                'product_id' => $productKaos->id,
            ]);

            Production::create([
                'production_status' => 'diproses',
                'quantity' => rand(10, 30),
                'price_per_unit' => $productKemeja->base_price,
                'total_price' => rand(10, 30) * $productKemeja->base_price,
                'payment_status' => 'unpaid',
                'convection_user_id' => $convectionUser->id,
                'user_id' => $customer->id,
                'design_id' => $design->id, // Bisa gunakan desain yang sama atau buat baru
                'product_id' => $productKemeja->id,
            ]);
        });
    }
}