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

## Tecnologia `[PENDENT]`
Proposta: Laravel (PHP) + SQL Server, JavaScript sense `<canvas>`, Python (Pandas, Matplotlib, Scikit-learn) i Pyodide a la vista «Mètriques».

## Com executar-ho en local `[PENDENT]`
1. Clona el repositori: `git clone <url>`
2. Copia `.env.example` a `.env` i omple els valors (**mai** el pugis al repositori).
3. Instal·la dependències i arrenca el servidor (comandes segons la tecnologia triada).

## Com col·laborem
Branca `main` protegida: només s'hi entra amb *pull request*. Una branca per persona i tasca (`feature/<nom>-<tema>`) i commits tipus *Conventional Commits*. Detall a la [guia de treball](docs/guia-de-trabajo.md).

## Llicència i crèdits
Projecte acadèmic. Els recursos multimèdia de tercers s'atribueixen en un fitxer de crèdits (quan es creï).

## Estructura
```
propostes/   Proposta final i una proposta per joc
docs/        Requisits i guia de treball
.github/     Plantilla de pull request
```
Les carpetes de l'aplicació es creen quan toquen, un cop triada la tecnologia.
