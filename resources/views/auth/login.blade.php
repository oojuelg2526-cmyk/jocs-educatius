@extends('layouts.simple')
@section('title', __('auth.login_title'))
@section('content')
  <h1>{{ __('auth.login_title') }}</h1>
  <form method="POST" action="/login">
    @csrf
    <label>{{ __('auth.username') }}
      <input name="username" value="{{ old('username') }}" required autofocus autocomplete="username">
    </label>
    @error('username') <p class="error" role="alert">{{ $message }}</p> @enderror
    <label>{{ __('auth.password') }}
      <input name="password" type="password" required autocomplete="current-password">
    </label>
    <button type="submit">{{ __('auth.login_button') }}</button>
  </form>
  <p><a href="/register">{{ __('auth.go_register') }}</a></p>
@endsection
