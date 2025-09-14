<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Preview3dModel;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pertama, pastikan ada setidaknya satu model 3D sebagai referensi
        $previewModel = Preview3dModel::firstOrCreate(
            ['model_type' => 'kaos'],
            [
                'model_url' => '/models/tshirt.glb',
                'previewImageUrl' => '/images/mockups/tshirt_preview.jpg'
            ]
        );

        // Data produk yang akan dibuat
        $products = [
            [
                'name' => 'Kaos Katun Combed 30s',
                'description' => 'Kaos lengan pendek standar berbahan katun combed 30s berkualitas.',
                'base_price' => 75000,
                'preview_3d_model_id' => $previewModel->id,
            ],
            [
                'name' => 'Kemeja Lengan Panjang',
                'description' => 'Kemeja formal atau kasual dengan bahan katun premium.',
                'base_price' => 125000,
                'preview_3d_model_id' => $previewModel->id,
            ],
            [
                'name' => 'Polo Shirt Lacoste',
                'description' => 'Kaos polo dengan bahan lacoste pique yang nyaman dan elegan.',
                'base_price' => 95000,
                'preview_3d_model_id' => $previewModel->id,
            ],
        ];

        foreach ($products as $productData) {
            // Gunakan firstOrCreate untuk menghindari duplikasi produk dengan nama yang sama
            Product::firstOrCreate(['name' => $productData['name']], $productData);
        }
    }
}