@extends('layouts.simple')
@section('title', __('auth.register_title'))
@section('content')
  <h1>{{ __('auth.register_title') }}</h1>
  <form method="POST" action="/register">
    @csrf
    <label>{{ __('auth.username') }}
      <input name="username" value="{{ old('username') }}" required autofocus autocomplete="username">
    </label>
    @error('username') <p class="error" role="alert">{{ $message }}</p> @enderror
    <label>{{ __('auth.email') }}
      <input name="email" type="email" value="{{ old('email') }}" required autocomplete="email">
    </label>
    @error('email') <p class="error" role="alert">{{ $message }}</p> @enderror
    <label>{{ __('auth.password') }}
      <input name="password" type="password" required minlength="8" autocomplete="new-password">
    </label>
    @error('password') <p class="error" role="alert">{{ $message }}</p> @enderror
    <label>{{ __('auth.password_confirm') }}
      <input name="password_confirmation" type="password" required minlength="8" autocomplete="new-password">
    </label>
    <label>{{ __('auth.language') }}
      <select name="language">
        @foreach (['ca' => 'Català', 'es' => 'Castellano', 'en' => 'English'] as $code => $name)
          <option value="{{ $code }}" @selected(old('language', app()->getLocale()) === $code)>{{ $name }}</option>
        @endforeach
      </select>
    </label>
    <button type="submit">{{ __('auth.register_button') }}</button>
  </form>
  <p><a href="/login">{{ __('auth.go_login') }}</a></p>
@endsection
