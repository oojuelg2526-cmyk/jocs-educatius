{{-- Enlaces «anterior / siguiente» de una tabla paginada (parámetro: $paginas) --}}
@if ($paginas->hasPages())
    <nav class="paginacion" aria-label="Paginació" data-i18n-aria-label="paginacion.etiqueta">
        <ul>
            @unless ($paginas->onFirstPage())
                <li><a href="{{ $paginas->previousPageUrl() }}" rel="prev" data-i18n="paginacion.anterior">Anterior</a></li>
            @endunless
            <li><span><span data-i18n="paginacion.pagina">Pàgina</span> {{ $paginas->currentPage() }} / {{ $paginas->lastPage() }}</span></li>
            @if ($paginas->hasMorePages())
                <li><a href="{{ $paginas->nextPageUrl() }}" rel="next" data-i18n="paginacion.siguiente">Següent</a></li>
            @endif
        </ul>
    </nav>
@endif
