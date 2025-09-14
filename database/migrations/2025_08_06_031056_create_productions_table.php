<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('productions', function (Blueprint $table) {
            $table->id();
            $table->enum('production_status', ['diterima', 'ditolak', 'diproses', 'dikirim', 'diterima_selesai'])->default('diterima');
            $table->integer('quantity');
            $table->decimal('price_per_unit', 15, 2);
            $table->decimal('total_price', 15, 2);
            $table->string('payment_proof_url')->nullable();
            $table->enum('payment_status', ['paid', 'unpaid', 'cancelled'])->default('unpaid');
            
            // Foreign Keys
            $table->foreignId('convection_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Customer
            $table->foreignId('design_id')->constrained('designs')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('product')->onDelete('cascade');
            
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('productions');
    }
};