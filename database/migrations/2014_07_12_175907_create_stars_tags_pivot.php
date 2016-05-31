<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateStarsTagsPivot extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('star_tag', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('star_id')->unsigned()->index();
            $table->integer('tag_id')->unsigned()->index();
            $table->timestamps();
            $table->foreign('star_id')->references('id')->on('stars')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('tag_id')->references('id')->on('tags')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::drop('star_tag');
    }
}
