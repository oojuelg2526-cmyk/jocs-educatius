<?php $__env->startSection('titulo', 'Inici'); ?>
<?php $__env->startSection('clave_titulo', 'titulo.inicio'); ?>
<?php $__env->startSection('descripcion', 'Ildefons Cerdà ha perdut el plànol de Barcelona. Recupera’l amb quatre jocs sobre monuments, l’Eixample, la història i el metro de la ciutat.'); ?>

<?php $__env->startSection('contenido'); ?>
    <section class="portada">
        <div>
            <p class="antetitulo" data-i18n="inicio.antetitulo">Història i geografia de Barcelona</p>
            <h1 data-i18n="inicio.titulo">Ildefons Cerdà ha perdut el plànol</h1>
            <p class="entradilla" data-i18n="inicio.texto">La ciutat s’ha desordenat. Recupera les quatre peces del plànol jugant pel centre de Barcelona, fins a arribar a Urquinaona.</p>
            <div class="botonera">
                <a class="boton boton-principal" href="<?php echo e(route('juegos')); ?>" data-i18n="inicio.empezar">Comença a jugar</a>
                <a class="boton" href="#como-funciona" data-i18n="inicio.como">Mira com funciona</a>
            </div>
        </div>

        
        <figure class="tarjeta plano" aria-labelledby="plano-estado">
            <div class="plano-piezas" aria-hidden="true">
                <div class="pieza" data-pieza="1">
                    <span class="pieza-numero">1</span>
                    
                    <svg viewBox="0 0 200 100" preserveAspectRatio="none">
                        <path d="M10 25H190M10 50H190M10 75H190M45 8V92M100 8V92M155 8V92" stroke="#2b2a28" stroke-width="2.5" fill="none"/>
                    </svg>
                </div>
                <div class="pieza" data-pieza="2">
                    <span class="pieza-numero">2</span>
                    
                    <svg viewBox="0 0 200 100" preserveAspectRatio="none">
                        <g fill="#a63d2a" stroke="#2b2a28" stroke-width="2">
                            <path d="M20 14h44l6 6v22l-6 6H20l-6-6V20z"/>
                            <path d="M84 14h44l6 6v22l-6 6H84l-6-6V20z"/>
                            <path d="M148 14h34l6 6v22l-6 6h-34l-6-6V20z"/>
                            <path d="M20 56h44l6 6v22l-6 6H20l-6-6V62z"/>
                            <path d="M84 56h44l6 6v22l-6 6H84l-6-6V62z"/>
                            <path d="M148 56h34l6 6v22l-6 6h-34l-6-6V62z"/>
                        </g>
                    </svg>
                </div>
                <div class="pieza" data-pieza="3">
                    <span class="pieza-numero">3</span>
                    
                    <svg viewBox="0 0 200 100" preserveAspectRatio="none">
                        <g fill="#e8d9b4" stroke="#2b2a28" stroke-width="2">
                            <path d="M20 14h44l6 6v22l-6 6H20l-6-6V20z"/>
                            <path d="M84 14h44l6 6v22l-6 6H84l-6-6V20z"/>
                            <path d="M84 56h44l6 6v22l-6 6H84l-6-6V62z"/>
                            <path d="M148 56h34l6 6v22l-6 6h-34l-6-6V62z"/>
                        </g>
                        <path d="M5 95L195 5" stroke="#6f5226" stroke-width="8"/>
                    </svg>
                </div>
                <div class="pieza" data-pieza="4">
                    <span class="pieza-numero">4</span>
                    
                    <svg viewBox="0 0 200 100" preserveAspectRatio="none">
                        <path d="M15 80H80L120 30H185" stroke="#d6242d" stroke-width="7" fill="none" stroke-linejoin="round"/>
                        <g fill="#fff" stroke="#2b2a28" stroke-width="3">
                            <circle cx="15" cy="80" r="7"/>
                            <circle cx="80" cy="80" r="7"/>
                            <circle cx="120" cy="30" r="7"/>
                            <circle cx="185" cy="30" r="9"/>
                        </g>
                    </svg>
                </div>
            </div>
            <figcaption>
                <p class="plano-estado" id="plano-estado" role="status">Peces recuperades: 0 de 4</p>
                <p class="plano-nota" data-i18n="plano.nota">S’omple amb el teu progrés en aquest navegador</p>
            </figcaption>
        </figure>
    </section>

    <section class="seccion" id="como-funciona" aria-labelledby="titulo-como">
        <h2 id="titulo-como" data-i18n="como.titulo">Com funciona</h2>
        <ol class="rejilla-3 lista-limpia">
            <li class="tarjeta paso">
                <span class="paso-numero" aria-hidden="true">1</span>
                <h3 data-i18n="paso1.titulo">Crea el teu compte</h3>
                <p data-i18n="paso1.texto">Registra’t amb un usuari i comença pel joc 1. Els altres s’obren en ordre.</p>
            </li>
            <li class="tarjeta paso">
                <span class="paso-numero" aria-hidden="true">2</span>
                <h3 data-i18n="paso2.titulo">Juga i aprèn</h3>
                <p data-i18n="paso2.texto">Quatre jocs sobre Barcelona: monuments, Eixample, història i metro. Tres nivells cadascun.</p>
            </li>
            <li class="tarjeta paso">
                <span class="paso-numero" aria-hidden="true">3</span>
                <h3 data-i18n="paso3.titulo">Completa el plànol</h3>
                <p data-i18n="paso3.texto">Cada joc superat retorna una peça. En acabar, el plànol de Cerdà queda restaurat.</p>
            </li>
        </ol>

        <ul class="cifras rejilla-3">
            <li><span class="cifra"><?php echo e($totalJuegos); ?></span> <span data-i18n="cifra.juegos">jocs, un per persona de l’equip</span></li>
            <li><span class="cifra"><?php echo e($totalNiveles); ?></span> <span data-i18n="cifra.niveles">nivells en total</span></li>
            <li><span class="cifra">3</span> <span data-i18n="cifra.idiomas">idiomes: català, castellano, English</span></li>
        </ul>
    </section>
<?php $__env->stopSection(); ?>

<?php $__env->startPush('scripts'); ?>
    <script src="<?php echo e(asset('js/progresion.js')); ?>"></script>
    <script src="<?php echo e(asset('js/inicio.js')); ?>"></script>
<?php $__env->stopPush(); ?>

<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /Users/fred89/Documents/GitHub/jocs-educatius/resources/views/paginas/inicio.blade.php ENDPATH**/ ?>