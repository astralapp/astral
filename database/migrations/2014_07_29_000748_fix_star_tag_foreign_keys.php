<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class FixStarTagForeignKeys extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('star_tag', function(Blueprint $table)
		{
			$table->foreign('star_id')->references('id')->on('stars')->onDelete('cascade')->onUpdate('cascade');
      $table->foreign('tag_id')->references('id')->on('tags')->onDelete('cascade')->onUpdate('cascade');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('star_tag', function(Blueprint $table)
		{
			//
		});
	}

}
