<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddUniqueUseridNameToTags extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Add unique index
        Schema::table('tags', function (Blueprint $table) {
            $table->unique(array('user_id', 'name'));
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Remove index
        Schema::table('tags', function (Blueprint $table) {
            $table->dropUnique('tags_user_id_name_unique');
        });
    }
}
