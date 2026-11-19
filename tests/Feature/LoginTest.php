<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    private function usuario(string $rol = 'player', bool $activo = true): User
    {
        return User::factory()->create([
            'username' => 'maria',
            'password' => 'clave-de-prueba-123',
            'role' => $rol,
            'is_active' => $activo,
        ]);
    }

    public function test_el_formulario_de_login_se_muestra(): void
    {
        $this->get('/login')->assertOk()->assertSee('Entrar');
    }

    public function test_un_admin_entra_y_va_al_panel(): void
    {
        $this->usuario('admin');

        $this->post('/login', ['username' => 'maria', 'password' => 'clave-de-prueba-123'])
            ->assertRedirect('/admin');

        $this->assertAuthenticated();
        $this->assertNotNull(User::first()->last_login_at);
    }

    public function test_un_jugador_entra_y_va_a_la_portada(): void
    {
        $this->usuario('player');

        $this->post('/login', ['username' => 'maria', 'password' => 'clave-de-prueba-123'])
            ->assertRedirect('/');
    }

    public function test_contrasena_incorrecta_no_entra(): void
    {
        $this->usuario();

        $this->from('/login')
            ->post('/login', ['username' => 'maria', 'password' => 'otra'])
            ->assertRedirect('/login')
            ->assertSessionHasErrors('username');

        $this->assertGuest();
    }

    public function test_un_usuario_desactivado_no_entra(): void
    {
        $this->usuario('admin', activo: false);

        $this->post('/login', ['username' => 'maria', 'password' => 'clave-de-prueba-123']);

        $this->assertGuest();
    }

    public function test_el_panel_exige_estar_dentro(): void
    {
        $this->get('/admin')->assertRedirect('/login');
    }

    public function test_un_jugador_no_puede_ver_el_panel(): void
    {
        $this->actingAs($this->usuario('player'))->get('/admin')->assertForbidden();
    }

    public function test_un_superadmin_ve_el_panel(): void
    {
        $this->actingAs($this->usuario('superadmin'))->get('/admin')->assertOk()->assertSee('Administració');
    }

    public function test_salir_cierra_la_sesion(): void
    {
        $this->actingAs($this->usuario())->post('/logout')->assertRedirect('/');

        $this->assertGuest();
    }

    public function test_el_comando_crea_un_superadmin_con_hash(): void
    {
        $this->artisan('usuario:superadmin', ['username' => 'jefe', 'email' => 'jefe@example.com'])
            ->expectsQuestion('Contrasenya (mínim 12 caràcters)', 'una-clave-muy-larga-1')
            ->expectsQuestion('Repeteix la contrasenya', 'una-clave-muy-larga-1')
            ->assertSuccessful();

        $jefe = User::where('username', 'jefe')->first();
        $this->assertSame('superadmin', $jefe->role);
        $this->assertNotSame('una-clave-muy-larga-1', $jefe->password);
    }

    public function test_el_comando_rechaza_una_contrasena_corta(): void
    {
        $this->artisan('usuario:superadmin', ['username' => 'jefe', 'email' => 'jefe@example.com'])
            ->expectsQuestion('Contrasenya (mínim 12 caràcters)', 'corta')
            ->expectsQuestion('Repeteix la contrasenya', 'corta')
            ->assertFailed();

        $this->assertDatabaseMissing('users', ['username' => 'jefe']);
    }
}
