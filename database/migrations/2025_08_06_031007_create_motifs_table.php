<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('motifs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category'); // Tradisional, Modern, Kontemporer, Nusantara
            $table->string('location')->nullable(); // Asal daerah motif
            $table->string('image_url'); // URL gambar preview
            $table->string('file_path'); // Path file SVG/motif untuk editor
            $table->json('colors')->nullable(); // Array warna dominan
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); // Creator
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('motifs');
    }
};