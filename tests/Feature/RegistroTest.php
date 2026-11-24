<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistroTest extends TestCase
{
    use RefreshDatabase;

    private function datos(array $cambios = []): array
    {
        return array_merge([
            'username' => 'laia_91',
            'email' => 'Laia@Correu.cat',
            'password' => 'clave-segura',
        ], $cambios);
    }

    public function test_un_registro_valido_crea_un_jugador_y_entra(): void
    {
        $this->post('/registro', $this->datos())->assertRedirect('/jocs');

        $usuario = User::where('username', 'laia_91')->first();
        $this->assertNotNull($usuario);
        $this->assertSame('player', $usuario->role);
        $this->assertSame('laia@correu.cat', $usuario->email);
        $this->assertNotSame('clave-segura', $usuario->password);
        $this->assertAuthenticatedAs($usuario);
    }

    public function test_no_se_puede_elegir_el_rol(): void
    {
        $this->post('/registro', $this->datos(['role' => 'superadmin']));

        $this->assertSame('player', User::first()->role);
    }

    public function test_un_correo_repetido_no_se_acepta(): void
    {
        User::factory()->create(['email' => 'laia@correu.cat']);

        $this->from('/registro')->post('/registro', $this->datos())
            ->assertRedirect('/registro')
            ->assertSessionHasErrors('email');

        $this->assertGuest();
        $this->assertSame(1, User::count());
    }

    public function test_una_contrasena_corta_no_se_acepta(): void
    {
        $this->from('/registro')->post('/registro', $this->datos(['password' => '1234567']))
            ->assertSessionHasErrors('password');

        $this->assertDatabaseMissing('users', ['username' => 'laia_91']);
    }

    public function test_un_usuario_con_espacios_no_se_acepta(): void
    {
        $this->from('/registro')->post('/registro', $this->datos(['username' => 'laia 91']))
            ->assertSessionHasErrors('username');
    }

    public function test_con_sesion_iniciada_no_se_ve_el_registro(): void
    {
        $this->actingAs(User::factory()->create())->get('/registro')->assertRedirect();
    }

    public function test_el_registro_tiene_limite_de_intentos(): void
    {
        for ($intento = 1; $intento <= 5; $intento++) {
            $this->post('/registro', $this->datos(['password' => 'corta']));
        }

        $this->post('/registro', $this->datos(['password' => 'corta']))->assertStatus(429);
    }
}
