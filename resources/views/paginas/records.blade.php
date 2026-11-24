@extends('layouts.app')
@section('titulo', 'Rècords')
@section('clave_titulo', 'titulo.records')
@section('descripcion', 'Les millors puntuacions d’avui i d’aquesta setmana a cada joc de «Cerdà ha perdut el plànol».')

@section('contenido')
    <p class="antetitulo" data-i18n="records.antetitulo">Comunitat</p>
    <h1 class="titulo-pagina" data-i18n="records.titulo">Rècords</h1>

    {{-- public/js/records.js pide los datos a /api/records y rellena la tabla --}}
    <div class="filtros" id="records" data-url="{{ url('/api/records') }}">
        <div class="pestanas" role="group" aria-label="Període" data-i18n-aria-label="records.periodo">
            <button type="button" data-periodo="hoy" aria-pressed="true" data-i18n="records.hoy">Avui</button>
            <button type="button" data-periodo="semana" aria-pressed="false" data-i18n="records.semana">Aquesta setmana</button>
        </div>
        <div class="campo-en-linea">
            <label for="records-juego" data-i18n="records.juego">Joc</label>
            <select id="records-juego" class="selector">
                @foreach ($juegos as $juego)
                    <option value="{{ $juego['slug'] }}">{{ $juego['numero'] }} · {{ $juego['nombre'] }}</option>
                @endforeach
            </select>
        </div>
    </div>

    <div class="caja-tabla">
        <table class="tabla">
            <caption data-i18n="records.caption">Les 10 millors puntuacions</caption>
            <thead>
                <tr>
                    <th scope="col"><span aria-hidden="true">#</span><span class="oculto-visual" data-i18n="col.posicion">Posició</span></th>
                    <th scope="col" data-i18n="col.jugador">Jugador</th>
                    <th scope="col" data-i18n="col.nivel">Nivell</th>
                    <th scope="col" class="numero" data-i18n="col.puntos">Punts</th>
                </tr>
            </thead>
            <tbody id="records-filas"></tbody>
        </table>
        <p class="tabla-estado" id="records-estado" role="status" aria-live="polite">Carregant els rècords…</p>
    </div>
@endsection

@push('scripts')
    <script src="{{ asset('js/records.js') }}"></script>
@endpush
