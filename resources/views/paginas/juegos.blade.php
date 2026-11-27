@extends('layouts.app')
@section('titulo', 'Jocs')
@section('clave_titulo', 'titulo.juegos')
@section('descripcion', 'Els quatre jocs de la ruta pel centre de Barcelona: Memory, Eixample, línia del temps i metro. Es juguen en ordre.')

@section('contenido')
    <p class="antetitulo" data-i18n="juegos.antetitulo">Ruta pel centre de Barcelona</p>
    <h1 class="titulo-pagina" data-i18n="juegos.titulo">Els quatre jocs</h1>
    <p class="entradilla" data-i18n="juegos.texto">Es juguen en ordre. Els bloquejats es veuen, però no s’obren fins que superes l’anterior.</p>

    {{-- Sin JavaScript solo se puede saber que el primero está disponible; public/js/juegos.js lee el progreso --}}
    <ol class="rejilla-4 lista-limpia seccion">
        @foreach ($juegos as $juego)
            @php
                $disponible = $juego['numero'] === 1;
                $estado = $disponible ? 'disponible' : 'bloqueado';
            @endphp
            <li class="tarjeta juego" data-juego="{{ $juego['numero'] }}" data-estado="{{ $estado }}">
                <p class="juego-orden">{{ $juego['numero'] }} / {{ count($juegos) }}</p>
                <div class="juego-imagen" aria-hidden="true" data-icono="{{ $juego['icono'] }}">{{ $disponible ? $juego['icono'] : '🔒' }}</div>
                <h2 data-i18n="juego.{{ $juego['slug'] }}.nombre">{{ $juego['nombre'] }}</h2>
                <p class="juego-descripcion" data-i18n="juego.{{ $juego['slug'] }}.descripcion">{{ $juego['descripcion'] }}</p>
                <p class="juego-autor">{{ $juego['autor'] }}</p>
                <span class="etiqueta etiqueta-{{ $estado }}" data-i18n="estado.{{ $estado }}">{{ $disponible ? 'Disponible' : 'Bloquejat' }}</span>
                @if ($disponible)
                    <a class="boton boton-principal" data-enlace="{{ asset('juegos/'.$juego['carpeta'].'/index.html') }}" href="{{ asset('juegos/'.$juego['carpeta'].'/index.html') }}">Juga</a>
                @else
                    <a class="boton boton-bloqueado" data-enlace="{{ asset('juegos/'.$juego['carpeta'].'/index.html') }}" aria-disabled="true">Supera el joc anterior</a>
                @endif
            </li>
        @endforeach
    </ol>
@endsection

@push('scripts')
    <script src="{{ asset('js/progresion.js') }}"></script>
    <script src="{{ asset('js/juegos.js') }}"></script>
@endpush
