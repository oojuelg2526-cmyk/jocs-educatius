# Jocs per aprendre

Aplicació web de **jocs educatius** feta per l'equip `[PENDENT: nom de l'equip]` com a Projecte Integrat 1 (DAW2, curs 2026/27, Politècnics Barcelona).

> Temàtica: història i geografia de Barcelona · Públic: gent de la ciutat · Web desplegada: `[PENDENT: domini]`

## Què inclou
- **Landing page** multiidioma (català, castellà, anglès) amb la presentació del projecte i de l'equip.
- **4 jocs** (un per membre de l'equip) amb un fil conductor comú; es desbloquegen en ordre i es guarda el progrés.
- **Administració** de jugadors i puntuacions (administradors i superadministrador).
- **Mètriques** dels jocs i vista de resultats d'aprenentatge automàtic.

## Equip
| Persona | GitHub | Joc / responsabilitat |
|---|---|---|
| Óscar Ojuel González | oojuelg2526-cmyk | Nivell 1 · Memory de Barcelona |
| Alex Campano | acampanoe2526 | Nivell 4 · Laberinto de metro |
| Roger Durán | rduran597 | Nivell 2 · Reconstruye el Eixample |
| Raúl Hernández | raulhpolitecnics | Nivell 3 · Línea del tiempo |

## Documentació
Les propostes són a [`propostes/`](propostes/): la [proposta final](propostes/propuesta-final-ildefons-cerda-perdio-el-plano.md) i la de cada joc. Els [requisits](docs/requisitos.md) i la [guia de treball](docs/guia-de-trabajo.md) són a [`docs/`](docs/).

## Tecnologia
Laravel 13 (PHP) + SQL Server per a la landing, el login, l'administració i el desat de progrés i mètriques. Els jocs són HTML, CSS i JavaScript sense `<canvas>` i viuen a [`public/juegos/`](public/juegos/), tal com estaven (només ha canviat la ruta). Python (Pandas, Matplotlib, Scikit-learn) i Pyodide a la vista «Mètriques».

## Com executar-ho en local
1. Clona el repositori i entra a la carpeta.
2. `composer install`
3. Copia `.env.example` a `.env` (**mai** el pugis al repositori) i omple `DB_HOST`, `DB_DATABASE`, `DB_USERNAME` i `DB_PASSWORD` amb les dades de SQL Server. Per veure la landing i els jocs no cal base de dades.
4. `php artisan key:generate`
5. `php artisan serve` i obre http://localhost:8000
6. Els jocs són a `/juegos/memory/`, `/juegos/lineaDelTiempo/` i `/juegos/metro/`.

Per connectar amb SQL Server cal l'extensió `pdo_sqlsrv` de PHP (i el driver ODBC de Microsoft).

Proves d'un joc: `cd public/juegos/memory && npm test` (igual per a `metro`). Proves de Laravel: `php artisan test`.
