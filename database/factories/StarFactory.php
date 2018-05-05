<?php

use Faker\Generator as Faker;

$factory->define(Astral\Models\Star::class, function (Faker $faker) {
    return [
        'user_id' => function () {
            return factory('Astral\Models\User')->create()->id;
        },
        'repo_id'  => $faker->randomNumber,
        'notes'    => $faker->paragraph,
    ];
});
