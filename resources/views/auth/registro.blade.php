@extends('layouts.app')
@section('titulo', 'Crea un compte')
@section('clave_titulo', 'titulo.registro')
@section('descripcion', 'Crea el teu compte de jugador i comença a recuperar el plànol de Cerdà.')

@section('contenido')
    <p class="antetitulo" data-i18n="cuenta.antetitulo">El teu compte</p>
    <h1 class="titulo-pagina" data-i18n="registro.titulo">Crea un compte</h1>

    <form class="tarjeta formulario" method="POST" action="{{ route('registro') }}" novalidate>
        @csrf
        @include('partials.campo', [
            'id' => 'username', 'nombre' => 'username', 'etiqueta' => 'Usuari', 'clave' => 'campo.usuario',
            'valor' => old('username'), 'autocomplete' => 'username', 'maximo' => 40,
            'placeholder' => 'el teu usuari', 'clavePlaceholder' => 'ph.usuario',
            'ayuda' => 'Lletres, números, guions i guions baixos.', 'claveAyuda' => 'ayuda.usuario',
        ])
        @include('partials.campo', [
            'id' => 'email', 'nombre' => 'email', 'tipo' => 'email', 'etiqueta' => 'Correu', 'clave' => 'campo.correo',
            'valor' => old('email'), 'autocomplete' => 'email',
            'placeholder' => 'nom@correu.cat', 'clavePlaceholder' => 'ph.correo',
        ])
        @include('partials.campo', [
            'id' => 'password', 'nombre' => 'password', 'tipo' => 'password', 'minimo' => 8,
            'etiqueta' => 'Contrasenya', 'clave' => 'campo.contrasena', 'autocomplete' => 'new-password',
            'placeholder' => 'Mínim 8 caràcters', 'clavePlaceholder' => 'ph.contrasena8',
        ])
        <button type="submit" class="boton boton-principal" data-i18n="registro.boton">Crea el compte i juga</button>
        <p class="nota sin-margen">
            <span data-i18n="registro.ya">Ja tens compte?</span>
            <a href="{{ route('login') }}" data-i18n="registro.entra">Entra</a>
        </p>
    </form>
@endsection
