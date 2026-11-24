@extends('layouts.app')
@section('titulo', 'Usuaris i puntuacions')
@section('clave_titulo', 'titulo.admin')
@section('descripcion', 'Administració de jugadors i puntuacions.')

@section('contenido')
    <p class="antetitulo" data-i18n="admin.antetitulo">Administració</p>
    <h1 class="titulo-pagina" data-i18n="admin.titulo">Usuaris i puntuacions</h1>

    @include('admin.submenu')

    <form class="buscador" method="GET" action="{{ route('admin') }}" role="search">
        <div class="campo">
            <label for="buscar" data-i18n="admin.buscar">Cerca un usuari</label>
            <input id="buscar" name="buscar" type="search" value="{{ $buscar }}" maxlength="100">
        </div>
        <button type="submit" class="boton" data-i18n="admin.boton_buscar">Cerca</button>
        @if ($buscar !== '')
            <a href="{{ route('admin') }}" data-i18n="admin.limpiar">Treu la cerca</a>
        @endif
    </form>

    {{-- Jugadores --}}
    <section class="seccion" aria-labelledby="titulo-usuarios">
        <h2 id="titulo-usuarios" data-i18n="admin.usuarios">Usuaris</h2>
        <div class="caja-tabla">
            <table class="tabla">
                <caption data-i18n="admin.caption_usuarios">Jugadors registrats</caption>
                <thead>
                    <tr>
                        <th scope="col" data-i18n="col.usuario">Usuari</th>
                        <th scope="col" data-i18n="col.correo">Correu</th>
                        <th scope="col" data-i18n="col.estado">Estat</th>
                        <th scope="col" data-i18n="col.acciones">Accions</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($usuarios as $usuario)
                        @php
                            $bolsa = 'usuario_'.$usuario->id;
                            $conErrores = $errors->getBag($bolsa)->any();
                        @endphp
                        <tr>
                            <th scope="row">{{ $usuario->username }}</th>
                            <td>{{ $usuario->email }}</td>
                            <td>
                                @if ($usuario->is_active)
                                    <span class="etiqueta etiqueta-activo" data-i18n="estado.activo">Actiu</span>
                                @else
                                    <span class="etiqueta etiqueta-inactivo" data-i18n="estado.inactivo">Desactivat</span>
                                @endif
                            </td>
                            <td>
                                <div class="acciones">
                                    <details class="desplegable" @if ($conErrores) open @endif>
                                        <summary class="boton boton-pequeno" data-i18n="boton.modificar">Modifica</summary>
                                        <form class="desplegable-contenido" method="POST" action="{{ route('admin.usuarios.actualizar', $usuario) }}" novalidate>
                                            @csrf
                                            @method('PUT')
                                            @include('partials.campo', [
                                                'id' => 'usuario-'.$usuario->id.'-username', 'nombre' => 'username',
                                                'etiqueta' => 'Usuari', 'clave' => 'campo.usuario', 'maximo' => 40,
                                                'valor' => $conErrores ? old('username') : $usuario->username,
                                                'bolsaErrores' => $bolsa,
                                            ])
                                            @include('partials.campo', [
                                                'id' => 'usuario-'.$usuario->id.'-email', 'nombre' => 'email', 'tipo' => 'email',
                                                'etiqueta' => 'Correu', 'clave' => 'campo.correo',
                                                'valor' => $conErrores ? old('email') : $usuario->email,
                                                'bolsaErrores' => $bolsa,
                                            ])
                                            <button type="submit" class="boton boton-principal boton-pequeno" data-i18n="boton.guardar">Desa</button>
                                        </form>
                                    </details>
                                    <form method="POST" action="{{ route('admin.usuarios.estado', $usuario) }}">
                                        @csrf
                                        @method('PATCH')
                                        @if ($usuario->is_active)
                                            <button type="submit" class="boton boton-pequeno" data-i18n="boton.desactivar">Desactiva</button>
                                        @else
                                            <button type="submit" class="boton boton-pequeno" data-i18n="boton.activar">Activa</button>
                                        @endif
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
            @if ($usuarios->isEmpty())
                @if ($buscar !== '')
                    <p class="tabla-estado" data-i18n="admin.sin_usuarios">No hi ha cap jugador amb aquesta cerca.</p>
                @else
                    <p class="tabla-estado" data-i18n="admin.sin_jugadores">Encara no hi ha cap jugador registrat.</p>
                @endif
            @endif
        </div>
        @include('partials.paginacion', ['paginas' => $usuarios])
    </section>

    {{-- Puntuaciones (una por partida) --}}
    <section class="seccion" aria-labelledby="titulo-puntuaciones">
        <h2 id="titulo-puntuaciones" data-i18n="admin.puntuaciones">Puntuacions</h2>
        <div class="caja-tabla">
            <table class="tabla">
                <caption data-i18n="admin.caption_puntuaciones">Puntuació de cada partida, de més alta a més baixa</caption>
                <thead>
                    <tr>
                        <th scope="col" data-i18n="col.jugador">Jugador</th>
                        <th scope="col" data-i18n="col.juego">Joc</th>
                        <th scope="col" data-i18n="col.fecha">Data</th>
                        <th scope="col" data-i18n="col.nivel">Nivell</th>
                        <th scope="col" class="numero" data-i18n="col.puntos">Punts</th>
                        <th scope="col" data-i18n="col.acciones">Accions</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($partidas as $partida)
                        @php
                            $bolsa = 'partida_'.$partida->session_id;
                            $conErrores = $errors->getBag($bolsa)->any();
                            $slug = $partida->game->slug;
                        @endphp
                        <tr>
                            <th scope="row">{{ $partida->user->username }}</th>
                            <td data-i18n="juego.{{ $slug }}.nombre">{{ $nombresJuegos[$slug] ?? $slug }}</td>
                            <td><time datetime="{{ $partida->date_time->toIso8601String() }}">{{ $partida->date_time->format('d/m/Y H:i') }}</time></td>
                            <td>{{ $partida->level_reached }}</td>
                            <td class="numero">{{ number_format($partida->final_score, 0, ',', '.') }}</td>
                            <td>
                                <div class="acciones">
                                    <details class="desplegable" @if ($conErrores) open @endif>
                                        <summary class="boton boton-pequeno" data-i18n="boton.modificar">Modifica</summary>
                                        <form class="desplegable-contenido" method="POST" action="{{ route('admin.puntuaciones.actualizar', $partida) }}" novalidate>
                                            @csrf
                                            @method('PUT')
                                            @include('partials.campo', [
                                                'id' => 'partida-'.$partida->session_id.'-puntos', 'nombre' => 'final_score', 'tipo' => 'number',
                                                'etiqueta' => 'Punts', 'clave' => 'campo.puntos', 'minimo' => 0, 'maximo' => 1000000,
                                                'valor' => $conErrores ? old('final_score') : $partida->final_score,
                                                'bolsaErrores' => $bolsa,
                                            ])
                                            <button type="submit" class="boton boton-principal boton-pequeno" data-i18n="boton.guardar">Desa</button>
                                        </form>
                                    </details>
                                    <details class="desplegable">
                                        <summary class="boton boton-pequeno" data-i18n="boton.borrar">Esborra</summary>
                                        <form class="desplegable-contenido" method="POST" action="{{ route('admin.puntuaciones.borrar', $partida) }}">
                                            @csrf
                                            @method('DELETE')
                                            <p class="sin-margen" data-i18n="admin.confirmar_borrar">Segur? Aquesta acció no es pot desfer.</p>
                                            <button type="submit" class="boton boton-principal boton-pequeno" data-i18n="boton.si_borrar">Sí, esborra-la</button>
                                        </form>
                                    </details>
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
            @if ($partidas->isEmpty())
                @if ($buscar !== '')
                    <p class="tabla-estado" data-i18n="admin.sin_puntuaciones">No hi ha cap puntuació amb aquesta cerca.</p>
                @else
                    <p class="tabla-estado" data-i18n="admin.sin_partidas">Encara no hi ha cap puntuació.</p>
                @endif
            @endif
        </div>
        @include('partials.paginacion', ['paginas' => $partidas])
    </section>

    <p class="nota seccion" data-i18n="admin.auditoria">Cada canvi queda apuntat al registre d’auditoria.</p>
@endsection
