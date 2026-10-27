# Convenciones de código y diseño común

`[PENDENT]` hasta decidir la tecnología (ver `equipo-y-decisiones.md`). Valores por defecto propuestos si se elige Laravel + JS:
- **Idiomas:** código y nombres en inglés (`game`, `score`), comentarios en catalán o castellano, **textos de interfaz solo vía archivos de idioma** (`lang/ca|es|en`).
- **Nombres:** carpetas y archivos en minúsculas con guiones; clases en PascalCase; variables en camelCase; tablas en plural `snake_case`.
- **JS:** `const`/`let` (nunca `var`), funciones pequeñas, módulos por juego en `public/games/game-N/`, sin librerías pesadas no acordadas, **sin `<canvas>`**, estado del juego separado del DOM.
- **CSS:** solo `public/css/common.css` (+ un CSS pequeño por juego para lo propio). Variables CSS para colores/tipografías. Nada de estilos en línea ni colores sueltos.
- **PHP/Laravel:** controladores finos, validación en *Form Requests*, consultas con Eloquent, contraseñas con bcrypt, protección CSRF, rutas con nombre.
- **Python (métricas):** en `metrics/`, un script de simulación y un pipeline reproducibles, sin datos reales de usuarios.
- **Tests:** una prueba por ruta/funcionalidad importante.
- **Seguridad:** sin secretos en Git; `.env.example`; permisos de administrador comprobados en servidor, nunca solo en el cliente.

## Diseño común (landing + 4 juegos)

El enunciado exige **estética compartida**: mismos personajes, botones, colores, tipografías y controles, con **CSS común**.

- Archivo único de tokens y componentes: `public/css/common.css`. Todo juego y la landing lo importan.
- Antes de crear un botón, panel o control: búscalo en `common.css`. Si falta y es reutilizable, **añádelo ahí** y descríbelo en esta página en el mismo commit.
- Paleta, tipografías, personajes y logotipo: `[PENDENT]` (se fija tras elegir temática; guardar aquí tokens y referencias).
- Accesibilidad: contraste, foco visible, `label` en formularios, uso en móvil (375 px) y escritorio, controles también por teclado.
- Wireframes y prototipo: `docs/diseno/` (se crea cuando haga falta).
- Multimedia propia (imágenes/audio): guardar en `public/assets/` con su origen anotado en `docs/credits.md`.

Catálogo de componentes: `[PENDENT]`, se rellena aquí a medida que se añaden.
