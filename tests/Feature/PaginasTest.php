<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaginasTest extends TestCase
{
    use RefreshDatabase;

    public function test_las_paginas_publicas_se_ven_con_su_titulo(): void
    {
        $paginas = [
            '/' => 'Inici · Cerdà ha perdut el plànol',
            '/jocs' => 'Jocs · Cerdà ha perdut el plànol',
            '/records' => 'Rècords · Cerdà ha perdut el plànol',
            '/equipo' => 'Equip · Cerdà ha perdut el plànol',
            '/login' => 'Entrar · Cerdà ha perdut el plànol',
            '/registro' => 'Crea un compte · Cerdà ha perdut el plànol',
        ];

        foreach ($paginas as $url => $titulo) {
            $this->get($url)
                ->assertOk()
                ->assertSee('<html lang="ca"', false)
                ->assertSee('<title data-i18n="', false)
                ->assertSee($titulo, false)
                ->assertSee('<meta name="description"', false)
                ->assertSee('Projecte Jocs educatius · DAW2 26/27 · Politècnics Barcelona');
        }
    }

    public function test_la_portada_tiene_el_plano_y_las_cifras(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSee('Ildefons Cerdà ha perdut el plànol')
            ->assertSee('data-pieza="4"', false)
            ->assertSee('Comença a jugar')
            ->assertSeeInOrder(['4', 'jocs, un per persona', '12', 'nivells en total']);
    }

    public function test_los_juegos_enlazan_a_sus_carpetas_y_salen_sus_autores(): void
    {
        $respuesta = $this->get('/jocs')->assertOk();

        foreach (['memory', 'Eixample', 'lineaDelTiempo', 'metro'] as $carpeta) {
            $respuesta->assertSee(asset("juegos/$carpeta/index.html"), false);
        }
        $respuesta->assertSeeInOrder(['Óscar Ojuel', 'Roger Durán', 'Raúl Hernández', 'Alex Campano']);
        // Sin progreso, solo el primero se puede abrir
        $respuesta->assertSee('Supera el joc anterior');
    }

    public function test_el_equipo_muestra_a_las_cuatro_personas(): void
    {
        $this->get('/equipo')
            ->assertOk()
            ->assertSeeInOrder(['Óscar Ojuel', 'Memory de Barcelona', 'Alex Campano', 'Laberint del metro']);
    }

    public function test_el_menu_marca_la_pagina_actual(): void
    {
        $html = $this->get('/records')->getContent();

        $this->assertMatchesRegularExpression('/href="'.preg_quote(route('records'), '/').'"\s+aria-current="page"/', $html);
        $this->assertDoesNotMatchRegularExpression('/href="'.preg_quote(route('juegos'), '/').'"\s+aria-current="page"/', $html);
    }

    public function test_el_menu_cambia_con_la_sesion(): void
    {
        $this->get('/')->assertSee(route('login'), false)->assertDontSee(route('admin'), false);

        $jugador = User::factory()->create();
        $this->actingAs($jugador)->get('/')
            ->assertDontSee('data-i18n="menu.admin"', false)
            ->assertSee('data-i18n="menu.salir"', false);

        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)->get('/')->assertSee('data-i18n="menu.admin"', false);
    }

    public function test_una_pagina_que_no_existe_da_404_con_el_diseno_de_la_web(): void
    {
        $this->get('/no-existe')->assertNotFound()->assertSee('Aquesta pàgina no existeix');
    }

    public function test_los_mensajes_del_servidor_siguen_la_cookie_de_idioma(): void
    {
        $this->from('/registro')->post('/registro', ['username' => 'pau', 'email' => 'pau@correu.cat', 'password' => 'corta'])
            ->assertSessionHasErrors(['password' => 'El camp contrasenya ha de tenir com a mínim 8 caràcters.']);

        $this->withUnencryptedCookie('cerda_lang', 'es')
            ->from('/registro')->post('/registro', ['username' => 'pau', 'email' => 'pau@correu.cat', 'password' => 'corta'])
            ->assertSessionHasErrors(['password' => 'El campo contraseña debe tener como mínimo 8 caracteres.']);
    }

    public function test_el_nombre_del_jugador_se_guarda_para_los_juegos(): void
    {
        $jugador = User::factory()->create(['username' => 'maria_b', 'role' => 'player']);

        $this->actingAs($jugador)->get('/')->assertSee('setItem("cerda_username", "maria_b")', false);
        auth()->logout();
        $this->get('/')->assertSee('removeItem("cerda_username")', false);
    }
}
