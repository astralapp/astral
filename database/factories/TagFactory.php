<?php

use Faker\Generator as Faker;

$factory->define(Astral\Models\Tag::class, function (Faker $faker) {
    return [
        'user_id' => function () {
            return factory('Astral\Models\User')->create()->id;
        },
        'name' => $faker->unique()->word,
    ];
});
