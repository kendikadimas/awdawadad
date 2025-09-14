<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('designs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('image_url')->nullable(); // Thumbnail
            $table->json('canvas_data');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('preview_3d_models_id')->nullable()->constrained('preview_3d_models')->onDelete('set null');
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('designs');
    }
};