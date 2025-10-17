<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up()
{
    Schema::table('designs', function (Blueprint $table) {
        $table->integer('canvas_width')->default(800)->after('canvas_data');
        $table->integer('canvas_height')->default(600)->after('canvas_width');
    });
}

public function down()
{
    Schema::table('designs', function (Blueprint $table) {
        $table->dropColumn(['canvas_width', 'canvas_height']);
    });
}
};
