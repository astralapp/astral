<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddSlugFieldToTags extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('tags', function (Blueprint $table) {
            $table->string('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('tags', function (Blueprint $table) {
            //
        });
    }
}
