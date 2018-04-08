<?php

use Faker\Generator as Faker;

$factory->define(Astral\Models\Star::class, function (Faker $faker) {
    $repoId = $faker->randomNumber;

    return [
        'user_id' => function () {
            return factory('Astral\Models\User')->create()->id;
        },
        'repo_id'  => $repoId,
        'relay_id' => base64_encode($repoId),
        'notes'    => $faker->paragraph,
    ];
});
