<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('github_id')->unique();
            $table->string('name')->nullable();
            $table->string('username');
            $table->string('avatar_url');
            $table->text('remember_token');
            $table->boolean('autotag')->default(0);
            $table->boolean('crowdtag')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::drop('users');
    }
}
