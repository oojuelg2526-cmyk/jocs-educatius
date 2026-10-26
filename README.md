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
| Óscar Ojuel González | oojuelg2526-cmyk | `[PENDENT]` |
| Alex Campano | acampanoe2526 | `[PENDENT]` |
| Roger Durán | rduran597 | `[PENDENT]` |
| Raúl Hernández | raulhpolitecnics | `[PENDENT]` |

## Abans de tocar res
Llegeix [`AGENTS.md`](AGENTS.md) i la carpeta [`AGENTS/`](AGENTS/README.md): expliquen com treballem tots igual (cadascú al seu ordinador i amb la seva IA). Les idees de temàtica i tecnologia van a [`propostes/`](propostes/README.md).

## Tecnologia `[PENDENT]`
Proposta: Laravel (PHP) + SQL Server, JavaScript sense `<canvas>`, Python (Pandas, Matplotlib, Scikit-learn) i Pyodide a la vista «Mètriques».

## Com executar-ho en local `[PENDENT]`
1. Clona el repositori: `git clone <url>`
2. Copia `.env.example` a `.env` i omple els valors (**mai** el pugis al repositori).
3. Instal·la dependències i arrenca el servidor (comandes segons la tecnologia triada).

## Com col·laborem
- Branca principal protegida: només es fusiona amb *pull request* revisada i acceptada per una altra persona.
- Una branca per persona i tasca: `feature/<nom>-<tema>`.
- Missatges de commit tipus *Conventional Commits* (`feat:`, `fix:`, `docs:`…).
- Detall a [`AGENTS/02-flujo.md`](AGENTS/02-flujo.md).


## Llicència i crèdits
Projecte acadèmic. Recursos multimèdia de tercers amb atribució a `docs/credits.md` (quan es creï).

## Estructura
```
AGENTS.md · CLAUDE.md   Entrada para personas e IA
AGENTS/                 Reglas y memoria compartida (README + 01..04)
propostes/              Una proposta per membre; la triada es registra a AGENTS/04
.github/                Plantilla de pull request
```
Les carpetes de l'aplicació (`app/`, `public/`, `lang/`, `tests/`…), `docs/` (memòria tècnica i desplegament) i `metrics/` (ML) es creen quan toquen, un cop triada la tecnologia.
