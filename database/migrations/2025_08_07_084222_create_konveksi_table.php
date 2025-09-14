<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('konveksis', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('location');
            $table->boolean('is_verified')->default(false);
            $table->decimal('rating', 2, 1)->default(0.0);
            $table->string('no_telp');
            $table->text('description')->nullable();
            $table->string('documentation')->nullable(); // path to image
            $table->string('icon')->nullable(); // path to icon
            $table->timestamps();

            $table->index(['is_verified', 'rating']);
            $table->index('location');
        });
    }

    public function down()
    {
        Schema::dropIfExists('konveksis');
    }
};