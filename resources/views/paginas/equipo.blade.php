@extends('layouts.app')
@section('titulo', 'Equip')
@section('clave_titulo', 'titulo.equipo')
@section('descripcion', 'Quatre estudiants de DAW2 de Politècnics Barcelona. Cadascú ha fet un dels jocs de la ruta.')

@section('contenido')
    <p class="antetitulo" data-i18n="equipo.antetitulo">Qui ho fa</p>
    <h1 class="titulo-pagina" data-i18n="equipo.titulo">L’equip</h1>
    <p class="entradilla" data-i18n="equipo.texto">Quatre estudiants de DAW2 a Politècnics Barcelona. Cadascú fa un joc i es reparteixen les tasques comunes.</p>

    <ul class="rejilla-4 lista-limpia seccion">
        @foreach ($juegos as $juego)
            <li class="tarjeta persona">
                {{-- La inicial del nombre, dentro del círculo --}}
                <span class="inicial" aria-hidden="true">{{ mb_substr($juego['autor'], 0, 1) }}</span>
                <h2>{{ $juego['autor'] }}</h2>
                <p><span data-i18n="equipo.juego">Joc</span> {{ $juego['numero'] }}: <span data-i18n="juego.{{ $juego['slug'] }}.nombre">{{ $juego['nombre'] }}</span></p>
            </li>
        @endforeach
    </ul>
@endsection
