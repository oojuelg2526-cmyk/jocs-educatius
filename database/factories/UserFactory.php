<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'username' => fake()->unique()->userName(),
            'email' => fake()->unique()->safeEmail(),
            'password' => 'password-de-prueba', // solo para pruebas; el modelo la cifra
            'role' => 'player',
            'language' => 'ca',
            'is_active' => true,
        ];
    }
}
