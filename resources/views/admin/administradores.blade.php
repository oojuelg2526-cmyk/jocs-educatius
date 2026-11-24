@extends('layouts.app')
@section('titulo', 'Administradors')
@section('clave_titulo', 'titulo.administradores')
@section('descripcion', 'Gestió dels administradors del lloc.')

@section('contenido')
    <p class="antetitulo" data-i18n="admin.antetitulo">Administració</p>
    <h1 class="titulo-pagina" data-i18n="admins.titulo">Administradors</h1>
    <p class="entradilla" data-i18n="admins.ayuda">Només el superadministrador pot crear, modificar o desactivar administradors.</p>

    @include('admin.submenu')

    {{-- Crear: el formulario se queda abierto si ha habido errores --}}
    <details class="desplegable seccion" @if ($errors->getBag('crear')->any()) open @endif>
        <summary class="boton boton-principal" data-i18n="admins.crear">Crea un administrador</summary>
        <form class="tarjeta formulario" method="POST" action="{{ route('admin.administradores.crear') }}" novalidate>
            @csrf
            @include('partials.campo', [
                'id' => 'nuevo-username', 'nombre' => 'username', 'etiqueta' => 'Usuari', 'clave' => 'campo.usuario',
                'valor' => $errors->getBag('crear')->any() ? old('username') : '', 'maximo' => 40,
                'autocomplete' => 'off', 'bolsaErrores' => 'crear',
                'ayuda' => 'Lletres, números, guions i guions baixos.', 'claveAyuda' => 'ayuda.usuario',
            ])
            @include('partials.campo', [
                'id' => 'nuevo-email', 'nombre' => 'email', 'tipo' => 'email', 'etiqueta' => 'Correu', 'clave' => 'campo.correo',
                'valor' => $errors->getBag('crear')->any() ? old('email') : '', 'autocomplete' => 'off', 'bolsaErrores' => 'crear',
            ])
            @include('partials.campo', [
                'id' => 'nuevo-password', 'nombre' => 'password', 'tipo' => 'password', 'minimo' => 12,
                'etiqueta' => 'Contrasenya', 'clave' => 'campo.contrasena', 'autocomplete' => 'new-password', 'bolsaErrores' => 'crear',
                'ayuda' => 'Mínim 12 caràcters.', 'claveAyuda' => 'ayuda.contrasena12',
            ])
            <button type="submit" class="boton boton-principal" data-i18n="admins.crear">Crea un administrador</button>
        </form>
    </details>

    <section class="seccion">
        <div class="caja-tabla">
            <table class="tabla">
                <caption data-i18n="admins.caption">Administradors del lloc</caption>
                <thead>
                    <tr>
                        <th scope="col" data-i18n="col.usuario">Usuari</th>
                        <th scope="col" data-i18n="col.correo">Correu</th>
                        <th scope="col" data-i18n="col.estado">Estat</th>
                        <th scope="col" data-i18n="col.acciones">Accions</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($administradores as $admin)
                        @php
                            $bolsa = 'admin_'.$admin->id;
                            $conErrores = $errors->getBag($bolsa)->any();
                        @endphp
                        <tr>
                            <th scope="row">{{ $admin->username }}</th>
                            <td>{{ $admin->email }}</td>
                            <td>
                                @if ($admin->is_active)
                                    <span class="etiqueta etiqueta-activo" data-i18n="estado.activo">Actiu</span>
                                @else
                                    <span class="etiqueta etiqueta-inactivo" data-i18n="estado.inactivo">Desactivat</span>
                                @endif
                            </td>
                            <td>
                                <div class="acciones">
                                    <details class="desplegable" @if ($conErrores) open @endif>
                                        <summary class="boton boton-pequeno" data-i18n="boton.modificar">Modifica</summary>
                                        <form class="desplegable-contenido" method="POST" action="{{ route('admin.administradores.actualizar', $admin) }}" novalidate>
                                            @csrf
                                            @method('PUT')
                                            @include('partials.campo', [
                                                'id' => 'admin-'.$admin->id.'-username', 'nombre' => 'username',
                                                'etiqueta' => 'Usuari', 'clave' => 'campo.usuario', 'maximo' => 40,
                                                'valor' => $conErrores ? old('username') : $admin->username, 'bolsaErrores' => $bolsa,
                                            ])
                                            @include('partials.campo', [
                                                'id' => 'admin-'.$admin->id.'-email', 'nombre' => 'email', 'tipo' => 'email',
                                                'etiqueta' => 'Correu', 'clave' => 'campo.correo',
                                                'valor' => $conErrores ? old('email') : $admin->email, 'bolsaErrores' => $bolsa,
                                            ])
                                            @include('partials.campo', [
                                                'id' => 'admin-'.$admin->id.'-password', 'nombre' => 'password', 'tipo' => 'password',
                                                'etiqueta' => 'Contrasenya nova (opcional)', 'clave' => 'campo.contrasena_nueva',
                                                'obligatorio' => false, 'minimo' => 12, 'autocomplete' => 'new-password', 'bolsaErrores' => $bolsa,
                                                'ayuda' => 'Mínim 12 caràcters.', 'claveAyuda' => 'ayuda.contrasena12',
                                            ])
                                            <button type="submit" class="boton boton-principal boton-pequeno" data-i18n="boton.guardar">Desa</button>
                                        </form>
                                    </details>
                                    <form method="POST" action="{{ route('admin.administradores.estado', $admin) }}">
                                        @csrf
                                        @method('PATCH')
                                        @if ($admin->is_active)
                                            <button type="submit" class="boton boton-pequeno" data-i18n="boton.desactivar">Desactiva</button>
                                        @else
                                            <button type="submit" class="boton boton-pequeno" data-i18n="boton.activar">Activa</button>
                                        @endif
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
            @if ($administradores->isEmpty())
                <p class="tabla-estado" data-i18n="admins.sin">Encara no hi ha cap administrador.</p>
            @endif
        </div>
    </section>

    <p class="nota seccion" data-i18n="admin.auditoria">Cada canvi queda apuntat al registre d’auditoria.</p>
@endsection
