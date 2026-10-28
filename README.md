# Jocs per aprendre

Aplicació web de **jocs educatius** feta per l'equip `[PENDENT: nom de l'equip]` com a Projecte Integrat 1 (DAW2, curs 2026/27, Politècnics Barcelona).

> Temàtica: `[PENDENT]` · Públic objectiu: `[PENDENT]` · Web desplegada: `[PENDENT: domini]`

## Què inclou
- **Landing page** multiidioma (català, castellà, anglès) amb la presentació del projecte i de l'equip.
- **4 jocs** (un per membre de l'equip) amb un fil conductor comú; es desbloquegen en ordre i es guarda el progrés.
- **Administració** de jugadors i puntuacions (administradors i superadministrador).
- **Mètriques** dels jocs i vista de resultats d'aprenentatge automàtic.

## Equip
| Persona | GitHub | Joc / responsabilitat |
|---|---|---|
| Óscar Ojuel González | oojuelg2526-cmyk | Nivel 1 · Memory de Barcelona |
| Alex Campano | acampanoe2526 | Nivel 4 · Laberinto de metro |
| Roger Durán | rduran597 | Nivel 2 · Reconstruye el Eixample |
| Raúl Hernández | raulhpolitecnics | Nivel 3 · Línea del tiempo |

## Abans de tocar res
Llegeix la carpeta [`docs/`](docs/README.md): hi ha el que cal construir, com treballem i què està decidit. Les idees de temàtica i tecnologia van a [`propostes/`](propostes/README.md).

## Tecnologia `[PENDENT]`
Proposta: Laravel (PHP) + SQL Server, JavaScript sense `<canvas>`, Python (Pandas, Matplotlib, Scikit-learn) i Pyodide a la vista «Mètriques».

## Com executar-ho en local `[PENDENT]`
1. Clona el repositori: `git clone <url>`
2. Copia `.env.example` a `.env` i omple els valors (**mai** el pugis al repositori).
3. Instal·la dependències i arrenca el servidor (comandes segons la tecnologia triada).

## Com col·laborem
- Branca principal protegida: només s'hi entra amb *pull request* (convé que la reviseu entre vosaltres).
- Una branca per persona i tasca: `feature/<nom>-<tema>`.
- Missatges de commit tipus *Conventional Commits* (`feat:`, `fix:`, `docs:`…).
- Detall a [`docs/flujo-de-trabajo.md`](docs/flujo-de-trabajo.md).


## Llicència i crèdits
Projecte acadèmic. Recursos multimèdia de tercers amb atribució a `docs/credits.md` (quan es creï).

## Estructura
```
docs/                   Documentació de l'equip (producte, flux de treball, convencions, decisions)
propostes/              Una proposta per membre; la triada es registra a docs/equipo-y-decisiones.md
.github/                Plantilla de pull request
```
Les carpetes de l'aplicació (`app/`, `public/`, `lang/`, `tests/`…) i `metrics/` (ML) es creen quan toquen, un cop triada la tecnologia.
