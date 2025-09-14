<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BatikGeneratorController extends Controller
{
    public function generate(Request $request)
    {
        $request->validate(['prompt' => 'required|string|max:1000']);
        $userPrompt = $request->input('prompt');

        try {
            // =================================================================
            // LANGSUNG PANGGIL HUGGING FACE API DENGAN PROMPT PENGGUNA
            // =================================================================
            $hfApiKey = env('HF_API_KEY');
            if (empty($hfApiKey)) {
                throw new \Exception("HF_API_KEY tidak ditemukan di file .env.");
            }
            
            // Kita tetap perkaya promptnya sedikit agar hasilnya lebih bagus
            $finalPrompt = "masterpiece, best quality, a traditional Indonesian batik motif showing ${userPrompt}, vector art, clean lines";

            Log::info('Sending to Hugging Face: ' . $finalPrompt);

            // Model Teks-ke-Gambar yang populer di Hugging Face
            $modelUrl = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";

            $response = Http::withToken($hfApiKey)
                ->timeout(120) // Waktu tunggu 2 menit
                ->post($modelUrl, [
                    'inputs' => $finalPrompt,
                ]);

            if ($response->failed()) {
                Log::error('Hugging Face API Error: ' . $response->body());
                throw new \Exception('Model AI gambar sedang sibuk atau gagal merespons.');
            }

            // API ini mengembalikan data gambar mentah (blob), kita ubah ke Base64
            $imageData = base64_encode($response->body());

            return response()->json([
                'image_data' => 'data:image/jpeg;base64,' . $imageData,
                'prompt_used' => $finalPrompt
            ]);

        } catch (\Exception $e) {
            Log::error('AI Generation Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Gagal berkomunikasi dengan layanan AI.',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}