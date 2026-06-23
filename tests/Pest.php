<?php

declare(strict_types=1);

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "uses()" function to bind a different classes or traits.
|
*/

uses(
    TestCase::class,
    LazilyRefreshDatabase::class
)->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

// expect()->extend('toBeOne', function () {
//     return $this->toBe(1);
// });

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

/**
 * Spin up a fresh in-memory `legacy` connection with the classic Astral schema
 * (only the columns the migration reads) and enable the migration check. Call at
 * the start of any test that exercises the legacy import.
 */
function bootLegacyDatabase(): void
{
    config()->set('app.check_for_migration', true);
    config()->set('database.connections.legacy', [
        'driver' => 'sqlite',
        'database' => ':memory:',
        'prefix' => '',
        'foreign_key_constraints' => false,
    ]);

    DB::purge('legacy');

    $schema = Schema::connection('legacy');

    $schema->create('users', function (Blueprint $table) {
        $table->increments('id');
        $table->integer('github_id');
    });

    $schema->create('tags', function (Blueprint $table) {
        $table->increments('id');
        $table->integer('user_id');
        $table->string('name');
        $table->integer('sort_order')->default(0);
    });

    $schema->create('predicates', function (Blueprint $table) {
        $table->increments('id');
        $table->integer('user_id');
        $table->string('name');
        $table->text('body');
        $table->integer('sort_order')->default(0);
    });

    $schema->create('stars', function (Blueprint $table) {
        $table->increments('id');
        $table->integer('user_id');
        $table->integer('repo_id');
        $table->text('notes')->nullable();
    });

    $schema->create('star_tag', function (Blueprint $table) {
        $table->increments('id');
        $table->integer('star_id');
        $table->integer('tag_id');
    });
}

/**
 * Seed a legacy user and return its legacy id.
 */
function seedLegacyUser(int $githubId): int
{
    return DB::connection('legacy')->table('users')->insertGetId(['github_id' => $githubId]);
}
