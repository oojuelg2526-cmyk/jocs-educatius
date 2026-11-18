<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

class CrearSuperadmin extends Command
{
    protected $signature = 'usuario:superadmin {username?} {email?}';

    protected $description = 'Crea un superadministrador. La contraseña se pide por teclado, nunca va en el código';

    public function handle(): int
    {
        $username = $this->argument('username') ?? $this->ask('Nom d\'usuari');
        $email = $this->argument('email') ?? $this->ask('Correu electrònic');
        $password = $this->secret('Contrasenya (mínim 12 caràcters)');
        $repetida = $this->secret('Repeteix la contrasenya');

        $validador = Validator::make(
            compact('username', 'email', 'password') + ['password_confirmation' => $repetida],
            [
                'username' => ['required', 'string', 'max:50', 'unique:users,username'],
                'email' => ['required', 'email', 'unique:users,email'],
                'password' => ['required', 'string', 'min:12', 'confirmed'],
            ],
        );

        if ($validador->fails()) {
            foreach ($validador->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        User::create([
            'username' => $username,
            'email' => $email,
            'password' => $password, // el modelo la guarda con hash
            'role' => 'superadmin',
        ]);

        $this->info("Superadministrador «{$username}» creat.");

        return self::SUCCESS;
    }
}
