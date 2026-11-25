<?php
    // Cada página pone su título y su descripción; si no, se usan estos.
    $titulo = trim($__env->yieldContent('titulo', 'Inici'));
    $descripcion = trim($__env->yieldContent('descripcion', 'Quatre jocs per recuperar el plànol de Barcelona d’Ildefons Cerdà. Projecte de DAW2 de Politècnics Barcelona.'));
    $tituloCompleto = $titulo.' · Cerdà ha perdut el plànol';
?>
<!DOCTYPE html>
<html lang="ca" class="sin-js">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title data-i18n="<?php echo $__env->yieldContent('clave_titulo', 'titulo.inicio'); ?>"><?php echo e($tituloCompleto); ?></title>
    <meta name="description" content="<?php echo e($descripcion); ?>">
    <meta name="theme-color" content="#f3ead6">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Cerdà ha perdut el plànol">
    <meta property="og:title" content="<?php echo e($tituloCompleto); ?>">
    <meta property="og:description" content="<?php echo e($descripcion); ?>">
    <meta property="og:url" content="<?php echo e(url()->current()); ?>">
    <meta property="og:locale" content="ca_ES">
    <link rel="icon" href="<?php echo e(asset('favicon.svg')); ?>" type="image/svg+xml">
    <link rel="alternate icon" href="<?php echo e(asset('favicon.ico')); ?>">
    <link rel="stylesheet" href="<?php echo e(asset('css/web.css')); ?>">
    
    <script>document.documentElement.classList.remove("sin-js");</script>
</head>
<body>
    <a class="saltar" href="#contenido" data-i18n="saltar">Salta al contingut</a>

    <header class="cabecera">
        <div class="contenedor cabecera-interior">
            <a class="marca" href="<?php echo e(route('inicio')); ?>">
                <svg viewBox="0 0 32 32" aria-hidden="true"><rect x="2" y="2" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2 12h28M2 22h28M12 2v28M22 2v28" stroke="currentColor" stroke-width="1.5"/><rect x="12" y="12" width="10" height="10" fill="currentColor"/></svg>
                <span data-i18n="marca">Cerdà ha perdut el plànol</span>
            </a>

            <button type="button" class="boton-menu" id="boton-menu" aria-expanded="false" aria-controls="menu">
                <span class="boton-menu-icono" aria-hidden="true"></span>
                <span data-i18n="menu.boton">Menú</span>
            </button>

            <div class="menu" id="menu">
                <nav aria-label="Menú principal" data-i18n-aria-label="menu.etiqueta">
                    <ul class="menu-lista">
                        <li><a href="<?php echo e(route('inicio')); ?>" <?php if(request()->routeIs('inicio')): ?> aria-current="page" <?php endif; ?> data-i18n="menu.inicio">Inici</a></li>
                        <li><a href="<?php echo e(route('juegos')); ?>" <?php if(request()->routeIs('juegos')): ?> aria-current="page" <?php endif; ?> data-i18n="menu.juegos">Jocs</a></li>
                        <li><a href="<?php echo e(route('records')); ?>" <?php if(request()->routeIs('records')): ?> aria-current="page" <?php endif; ?> data-i18n="menu.records">Rècords</a></li>
                        <li><a href="<?php echo e(route('equipo')); ?>" <?php if(request()->routeIs('equipo')): ?> aria-current="page" <?php endif; ?> data-i18n="menu.equipo">Equip</a></li>
                        <?php if(auth()->guard()->guest()): ?>
                            <li><a href="<?php echo e(route('login')); ?>" <?php if(request()->routeIs('login', 'registro')): ?> aria-current="page" <?php endif; ?> data-i18n="menu.entrar">Entrar</a></li>
                        <?php else: ?>
                            <?php if(auth()->user()->isAdmin()): ?>
                                <li><a href="<?php echo e(route('admin')); ?>" <?php if(request()->routeIs('admin*')): ?> aria-current="page" <?php endif; ?> data-i18n="menu.admin">Administració</a></li>
                            <?php endif; ?>
                            <li>
                                <form method="POST" action="<?php echo e(route('logout')); ?>">
                                    <?php echo csrf_field(); ?>
                                    <button type="submit" data-i18n="menu.salir">Surt</button>
                                </form>
                            </li>
                        <?php endif; ?>
                    </ul>
                </nav>

                <div class="idioma">
                    <label for="idioma" data-i18n="idioma">Idioma</label>
                    <select id="idioma">
                        <option value="ca" lang="ca">Català</option>
                        <option value="es" lang="es">Castellano</option>
                        <option value="en" lang="en">English</option>
                    </select>
                </div>
            </div>
        </div>
    </header>

    <main id="contenido" tabindex="-1">
        <div class="contenedor pagina">
            <?php if(session('estado')): ?>
                <p class="aviso" role="status"><?php echo e(session('estado')); ?></p>
            <?php endif; ?>

            <?php echo $__env->yieldContent('contenido'); ?>
        </div>
    </main>

    <footer class="pie">
        <div class="contenedor">
            <p>Projecte Jocs educatius · DAW2 26/27 · Politècnics Barcelona</p>
        </div>
    </footer>

    <script src="<?php echo e(asset('js/idioma.js')); ?>"></script>
    <script src="<?php echo e(asset('js/menu.js')); ?>"></script>
    
    <?php if(auth()->guard()->check()): ?>
        <script>try { localStorage.setItem("cerda_username", <?php echo json_encode(auth()->user()->username, 15, 512) ?>); } catch (e) {}</script>
    <?php else: ?>
        <script>try { localStorage.removeItem("cerda_username"); } catch (e) {}</script>
    <?php endif; ?>
    <?php echo $__env->yieldPushContent('scripts'); ?>
</body>
</html>
<?php /**PATH C:\Users\raulh\OneDrive\Escritorio\ProyectoJuegos\jocs-educatius\resources\views/layouts/app.blade.php ENDPATH**/ ?>