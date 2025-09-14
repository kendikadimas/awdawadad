<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preview_3d_models', function (Blueprint $table) {
            $table->id();
            $table->enum('model_type', ['kemeja', 'kaos', 'daster']);
            $table->string('model_url');
            $table->string('previewImageUrl')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preview_3d_models');
    }
};