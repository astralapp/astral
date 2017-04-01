<?php

/*
|--------------------------------------------------------------------------
| Model Factories
|--------------------------------------------------------------------------
|
| Here you may define all of your model factories. Model factories give
| you a convenient way to create models for testing and seeding your
| database. Just tell the factory how a default model should look.
|
*/

$factory->define(Astral\Models\User::class, function (Faker\Generator $faker) {
    return [
        'github_id' => $faker->unique()->numberBetween(1, 1000000),
        'name' => $faker->name,
        'username' => $faker->unique()->userName,
        'avatar_url' => $faker->imageUrl(80, 80, 'cats'),
        'remember_token' => str_random(10),
    ];
});

$factory->define(Astral\Models\Star::class, function (Faker\Generator $faker) {
    return [
        'user_id' => function () {
            return factory('Astral\Models\User')->create()->id;
        },
        'repo_id' => $faker->numberBetween(1, 1000000),
        'repo_name' => $faker->userName.'/'.$faker->domainWord,
        'notes' => $faker->paragraphs(2, true),
    ];
});

$factory->define(Astral\Models\Tag::class, function (Faker\Generator $faker) {
    return [
        'user_id' => function () {
            return factory('Astral\Models\User')->create()->id;
        },
        'name' => $faker->domainWord,
        'sort_order' => $faker->unique()->numberBetween(1, 1000),
    ];
});
