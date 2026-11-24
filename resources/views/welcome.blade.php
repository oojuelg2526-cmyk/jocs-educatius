<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Ildefons Cerdà ha perdut el plànol</title>
    <link rel="stylesheet" href="{{ asset('css/portada.css') }}">
</head>
<body>
    <header>
        <label for="idioma" data-texto="idioma">Idioma</label>
        <select id="idioma">
            <option value="ca" lang="ca">Català</option>
            <option value="es" lang="es">Castellano</option>
            <option value="en" lang="en">English</option>
        </select>
    </header>
    <main>
        <h1 data-texto="titulo">Ildefons Cerdà ha perdut el plànol</h1>
        <p data-texto="historia">Recupera les quatre peces del plànol de Barcelona. Cada joc superat obre el següent.</p>
        <p data-texto="publico">Una aventura per a joves i adults de Barcelona.</p>
        <ol class="plano">
            @foreach (['memory' => 'Memory de Barcelona', 'Eixample' => 'Reconstruïm l’Eixample', 'lineaDelTiempo' => 'La línia del temps', 'metro' => 'El laberint del metro'] as $carpeta => $nombre)
                <li data-juego="{{ $loop->iteration }}" data-estat="{{ $loop->first ? 'disponible' : 'bloquejat' }}">
                    <a data-ruta="{{ asset('juegos/'.$carpeta.'/index.html') }}" @if ($loop->first) href="{{ asset('juegos/memory/index.html') }}" @endif>{{ $nombre }}</a>
                    <span>{{ $loop->first ? 'Disponible' : 'Bloquejat' }}</span>
                </li>
            @endforeach
        </ol>
    </main>
    <footer>
        @guest
            <a href="{{ route('login') }}" data-texto="acceso">Accés al compte</a>
        @else
            @if (auth()->user()->isAdmin())
                <a href="{{ route('admin') }}" data-texto="administracion">Administració</a>
            @endif
        @endguest
    </footer>
    <script src="{{ asset('js/progresion.js') }}"></script>
    <script src="{{ asset('js/portada.js') }}"></script>
</body>
</html>
