<!doctype html>
<html lang="{{ app()->getLocale() }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <base href="/juegos/metro/">
  <title>Laberinto de metro</title>
  <link rel="stylesheet" href="css/metro.css">
  @if ($cerda)
    {{-- Jugador con sesión: api.js ve window.CERDA y habla con el servidor --}}
    <script>window.CERDA = {{ Illuminate\Support\Js::from($cerda) }};</script>
  @endif
</head>
<body>
{!! $page !!}
</body>
</html>
