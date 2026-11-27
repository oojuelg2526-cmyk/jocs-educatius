{{-- Página de error común: cada error (403, 404, 419, 429) solo cambia el código y el texto --}}
@extends('layouts.app')
@section('titulo', 'Error '.$codigo)
@section('clave_titulo', 'titulo.error')
@section('descripcion', $texto)

@section('contenido')
    <p class="antetitulo">Error {{ $codigo }}</p>
    <h1 class="titulo-pagina" data-i18n="error.titulo">Alguna cosa no ha anat bé</h1>
    <p class="entradilla" data-i18n="error.{{ $codigo }}">{{ $texto }}</p>
    <div class="botonera">
        <a class="boton boton-principal" href="{{ route('inicio') }}" data-i18n="error.volver">Torna a l’inici</a>
    </div>
@endsection
