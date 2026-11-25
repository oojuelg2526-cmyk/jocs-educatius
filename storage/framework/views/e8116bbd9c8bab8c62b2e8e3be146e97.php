<?php $__env->startSection('titulo', 'Jocs'); ?>
<?php $__env->startSection('clave_titulo', 'titulo.juegos'); ?>
<?php $__env->startSection('descripcion', 'Els quatre jocs de la ruta pel centre de Barcelona: Memory, Eixample, línia del temps i metro. Es juguen en ordre.'); ?>

<?php $__env->startSection('contenido'); ?>
    <p class="antetitulo" data-i18n="juegos.antetitulo">Ruta pel centre de Barcelona</p>
    <h1 class="titulo-pagina" data-i18n="juegos.titulo">Els quatre jocs</h1>
    <p class="entradilla" data-i18n="juegos.texto">Es juguen en ordre. Els bloquejats es veuen, però no s’obren fins que superes l’anterior.</p>

    
    <ol class="rejilla-4 lista-limpia seccion">
        <?php $__currentLoopData = $juegos; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $juego): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <?php
                $disponible = $juego['numero'] === 1;
                $estado = $disponible ? 'disponible' : 'bloqueado';
            ?>
            <li class="tarjeta juego" data-juego="<?php echo e($juego['numero']); ?>" data-estado="<?php echo e($estado); ?>">
                <p class="juego-orden"><?php echo e($juego['numero']); ?> / <?php echo e(count($juegos)); ?></p>
                <div class="juego-imagen" aria-hidden="true" data-icono="<?php echo e($juego['icono']); ?>"><?php echo e($disponible ? $juego['icono'] : '🔒'); ?></div>
                <h2 data-i18n="juego.<?php echo e($juego['slug']); ?>.nombre"><?php echo e($juego['nombre']); ?></h2>
                <p class="juego-descripcion" data-i18n="juego.<?php echo e($juego['slug']); ?>.descripcion"><?php echo e($juego['descripcion']); ?></p>
                <p class="juego-autor"><?php echo e($juego['autor']); ?></p>
                <span class="etiqueta etiqueta-<?php echo e($estado); ?>" data-i18n="estado.<?php echo e($estado); ?>"><?php echo e($disponible ? 'Disponible' : 'Bloquejat'); ?></span>
                <?php if($disponible): ?>
                    <a class="boton boton-principal" data-enlace="<?php echo e(asset('juegos/'.$juego['carpeta'].'/index.html')); ?>" href="<?php echo e(asset('juegos/'.$juego['carpeta'].'/index.html')); ?>">Juga</a>
                <?php else: ?>
                    <a class="boton boton-bloqueado" data-enlace="<?php echo e(asset('juegos/'.$juego['carpeta'].'/index.html')); ?>" aria-disabled="true">Supera el joc anterior</a>
                <?php endif; ?>
            </li>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    </ol>
<?php $__env->stopSection(); ?>

<?php $__env->startPush('scripts'); ?>
    <script src="<?php echo e(asset('js/progresion.js')); ?>"></script>
    <script src="<?php echo e(asset('js/juegos.js')); ?>"></script>
<?php $__env->stopPush(); ?>

<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /Users/fred89/Documents/GitHub/jocs-educatius/resources/views/paginas/juegos.blade.php ENDPATH**/ ?>