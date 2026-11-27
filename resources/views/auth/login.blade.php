@extends('layouts.app')
@section('titulo', 'Entrar')
@section('clave_titulo', 'titulo.entrar')
@section('descripcion', 'Entra amb el teu usuari per jugar a «Cerdà ha perdut el plànol».')

@section('contenido')
    <p class="antetitulo" data-i18n="cuenta.antetitulo">El teu compte</p>
    <h1 class="titulo-pagina" data-i18n="entrar.titulo">Entrar</h1>

    <form class="tarjeta formulario" method="POST" action="{{ route('login') }}" novalidate>
        @csrf
        @include('partials.campo', [
            'id' => 'username', 'nombre' => 'username', 'etiqueta' => 'Usuari', 'clave' => 'campo.usuario',
            'valor' => old('username'), 'autocomplete' => 'username',
            'placeholder' => 'el teu usuari', 'clavePlaceholder' => 'ph.usuario',
        ])
        @include('partials.campo', [
            'id' => 'password', 'nombre' => 'password', 'tipo' => 'password',
            'etiqueta' => 'Contrasenya', 'clave' => 'campo.contrasena', 'autocomplete' => 'current-password',
        ])
        <div class="casilla">
            <input type="checkbox" id="recordar" name="recordar" value="1" @checked(old('recordar'))>
            <label for="recordar" data-i18n="entrar.recordar">Recorda’m en aquest dispositiu</label>
        </div>
        <button type="submit" class="boton boton-principal" data-i18n="entrar.boton">Inicia la sessió</button>
        <p class="nota sin-margen">
            <span data-i18n="entrar.sin_cuenta">Encara no tens compte?</span>
            <a href="{{ route('registro') }}" data-i18n="entrar.registrate">Registra’t</a>
        </p>
    </form>
@endsection
