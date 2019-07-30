<?php

/* @var $factory \Illuminate\Database\Eloquent\Factory */

use Astral\Models\Predicate;
use Faker\Generator as Faker;

$factory->define(Predicate::class, function (Faker $faker) {
    return [
        'name'    => $faker->word(),
        'body'    => '{"key": "value"}',
        'user_id' => function () {
            return factory('Astral\Models\User')->create()->id;
        },
    ];
});
