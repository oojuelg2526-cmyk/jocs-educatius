@extends('layouts.app')
@section('titulo', 'Entrar')
@section('contenido')
    <h1>Entrar</h1>
    <form method="POST" action="{{ route('login') }}">
        @csrf
        <label>Nom d'usuari
            <input type="text" name="username" value="{{ old('username') }}" required autofocus autocomplete="username">
        </label>
        <label>Contrasenya
            <input type="password" name="password" required autocomplete="current-password">
        </label>
        <label><span><input type="checkbox" name="recordar" value="1"> Recorda'm</span></label>
        @error('username') <p class="error">{{ $message }}</p> @enderror
        <button type="submit">Entrar</button>
    </form>
@endsection
