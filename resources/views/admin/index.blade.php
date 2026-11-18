@extends('layouts.app')
@section('titulo', 'Administració')
@section('contenido')
    <h1>Administració</h1>
    <p>Hola, {{ auth()->user()->username }} ({{ auth()->user()->role }}).</p>
    <p>Usuaris: <strong>{{ $usuarios }}</strong> · Partides: <strong>{{ $partidas }}</strong></p>
    <table>
        <tr><th>Joc (clau)</th><th>Codi</th></tr>
        @foreach ($juegos as $juego)
            <tr><td>{{ $juego->name_key }}</td><td>{{ $juego->slug }}</td></tr>
        @endforeach
    </table>
    <form method="POST" action="{{ route('logout') }}" style="margin-top:1.5rem">
        @csrf
        <button type="submit">Sortir</button>
    </form>
@endsection
