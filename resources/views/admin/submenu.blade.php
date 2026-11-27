{{-- Submenú de la administración y error general (p. ej. «no te puedes desactivar a ti mismo») --}}
<nav class="submenu" aria-label="Seccions de l’administració" data-i18n-aria-label="admin.submenu">
    <a href="{{ route('admin') }}" @if (request()->routeIs('admin')) aria-current="page" @endif data-i18n="admin.titulo">Usuaris i puntuacions</a>
    @if (auth()->user()->isSuperadmin())
        <a href="{{ route('admin.administradores') }}" @if (request()->routeIs('admin.administradores')) aria-current="page" @endif data-i18n="admins.titulo">Administradors</a>
    @endif
</nav>

@if ($errors->has('general'))
    <p class="aviso aviso-error" role="alert">{{ $errors->first('general') }}</p>
@endif
