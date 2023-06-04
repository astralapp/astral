<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = User::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'name' => $this->faker->name,
            'github_id' => $this->faker->unique()->randomNumber(),
            'username' => $this->faker->userName(),
            'avatar' => $this->faker->imageUrl(100, 100),
            'access_token' => $this->faker->sha256(),
            'remember_token' => Str::random(10),
        ];
    }
}
