<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class SetRememberTokenNullableToUsers extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Set remember_token nullable
        Schema::table('users', function (Blueprint $table) {
            $table->text('remember_token')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Remove remember_token nullable
        Schema::table('users', function (Blueprint $table) {
            $table->text('remember_token')->change();
        });
    }
}
