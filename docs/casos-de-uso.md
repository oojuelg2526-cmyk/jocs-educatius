# Casos de uso (borrador)

Borrador para validar con el equipo. Actores: **Visitante** (sin sesión), **Jugador** (registrado), **Administrador** y **Superadministrador**. El administrador hereda lo que hace un jugador y el superadministrador lo que hace un administrador.

## Diagrama general
```mermaid
flowchart LR
    V([Visitante])
    J([Jugador])
    A([Administrador])
    S([Superadministrador])

    subgraph Landing
        U1((Ver proyecto y equipo))
        U2((Cambiar idioma ca/es/en))
        U3((Ver plano de Cerdà y récords))
        U4((Registrarse))
        U5((Iniciar sesión))
    end
    subgraph Juegos
        U6((Ver juegos y su estado))
        U7((Jugar un juego))
        U8((Retomar donde lo dejó))
        U9((Rejugar un juego superado))
        U10((Ver mis estadísticas))
    end
    subgraph Administración
        U11((Listar y buscar usuarios))
        U12((Modificar usuario))
        U13((Modificar o borrar puntuación))
        U14((Ver estadísticas globales))
        U15((Gestionar administradores))
    end

    V --- U1
    V --- U2
    V --- U3
    V --- U4
    V --- U5
    J --- U6
    J --- U7
    J --- U8
    J --- U9
    J --- U10
    A --- U11
    A --- U12
    A --- U13
    A --- U14
    S --- U15
    V -. se convierte en .-> J
    J -. "hereda" .-> A
    A -. "hereda" .-> S
```

## Casos de uso principales
| ID | Caso de uso | Actor | Resumen | Resultado |
|---|---|---|---|---|
| CU1 | Registrarse | Visitante | Crea cuenta con usuario, correo y contraseña | Usuario nuevo con el juego 1 abierto y los demás bloqueados |
| CU2 | Iniciar sesión | Visitante | Entra con usuario y contraseña | Sesión iniciada; en la landing ve su progreso |
| CU3 | Ver juegos | Jugador | Ve los 4 juegos; los no desbloqueados salen bloqueados | Estado de cada juego |
| CU4 | Jugar | Jugador | Elige un juego abierto y juega por niveles | Se crea una `game_session` con sus métricas y puntuación |
| CU5 | Superar un juego | Jugador | Completa los 3 niveles | Se guarda el progreso, se desbloquea el siguiente juego y se rellena la pieza del plano |
| CU6 | Retomar o rejugar | Jugador | Vuelve en otra visita y sigue por donde iba, o rejuega uno superado | Progreso recuperado; nueva sesión para el récord |
| CU7 | Ver estadísticas y récords | Visitante / Jugador | Récords diarios y semanales por juego, y los suyos | Tabla de récords |
| CU8 | Gestionar usuarios | Administrador | Lista, busca y modifica usuarios | Cambios guardados y apuntados en `audit_log` |
| CU9 | Gestionar puntuaciones | Administrador | Modifica o elimina una puntuación | Puntuación corregida y apuntada en `audit_log` |
| CU10 | Gestionar administradores | Superadministrador | Crea, modifica o desactiva administradores | Administradores actualizados |
| CU11 | Cambiar idioma | Todos | Elige ca, es o en | Interfaz en ese idioma |

## Flujo del caso central (CU4 + CU5)
```mermaid
sequenceDiagram
    actor J as Jugador
    participant W as Juego (navegador)
    participant S as Servidor
    participant B as BD
    J->>W: Abre el juego 2
    W->>S: ¿Está desbloqueado?
    S->>B: user_game_progress
    B-->>S: unlocked
    S-->>W: sí, nivel 1
    J->>W: Juega los niveles
    W->>S: Envía sesión, métricas y puntuación
    S->>B: game_sessions, level_attempts, session_metrics
    J->>W: Supera el nivel 3
    S->>B: progress = completed y desbloquea el juego 3
    S-->>W: pieza del plano y nota de Cerdà
```

## Restricciones del enunciado
- Los juegos se desbloquean en orden y los bloqueados se ven como bloqueados.
- Solo los administradores ven y modifican datos; solo el superadministrador gestiona a los administradores. Los permisos se comprueban siempre en el servidor.
- Cada sesión registra `username`, `session_id`, `date_time`, `session_length` y al menos 4 métricas propias.

## Por decidir con el equipo
- ¿Hay registro abierto o solo cuentas creadas por administración?
- ¿Se puede jugar como invitado (sin guardar progreso)?
- ¿Qué ve exactamente un administrador de las contraseñas? (nada: solo hash, y puede forzar un reinicio).
