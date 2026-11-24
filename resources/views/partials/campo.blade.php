{{--
    Un campo de formulario con su etiqueta, su ayuda y su error de validación.
    Parámetros: id, nombre, etiqueta, clave (data-i18n), y opcionales tipo, valor, autocomplete,
    placeholder, clavePlaceholder, ayuda, claveAyuda, obligatorio, minimo, maximo, bolsaErrores.
--}}
@php
    $tipo = $tipo ?? 'text';
    $obligatorio = $obligatorio ?? true;
    $bolsa = $errors->getBag($bolsaErrores ?? 'default');
    $tieneError = $bolsa->has($nombre);
    $idAyuda = $id.'-ayuda';
    $idError = $id.'-error';
    $describe = [];
    if (! empty($ayuda)) {
        $describe[] = $idAyuda;
    }
    if ($tieneError) {
        $describe[] = $idError;
    }
@endphp
<div class="campo">
    <label for="{{ $id }}" data-i18n="{{ $clave }}">{{ $etiqueta }}</label>
    <input
        id="{{ $id }}"
        name="{{ $nombre }}"
        type="{{ $tipo }}"
        @if (isset($valor)) value="{{ $valor }}" @endif
        @if (! empty($autocomplete)) autocomplete="{{ $autocomplete }}" @endif
        @if (! empty($placeholder)) placeholder="{{ $placeholder }}" @endif
        @if (! empty($clavePlaceholder)) data-i18n-placeholder="{{ $clavePlaceholder }}" @endif
        @if (isset($minimo)) {{ $tipo === 'number' ? 'min' : 'minlength' }}="{{ $minimo }}" @endif
        @if (isset($maximo)) {{ $tipo === 'number' ? 'max' : 'maxlength' }}="{{ $maximo }}" @endif
        @if ($obligatorio) required @endif
        @if ($tieneError) aria-invalid="true" @endif
        @if (count($describe) > 0) aria-describedby="{{ implode(' ', $describe) }}" @endif
    >
    @if (! empty($ayuda))
        <p class="nota" id="{{ $idAyuda }}" data-i18n="{{ $claveAyuda }}">{{ $ayuda }}</p>
    @endif
    @if ($tieneError)
        <p class="error-campo" id="{{ $idError }}">{{ $bolsa->first($nombre) }}</p>
    @endif
</div>
