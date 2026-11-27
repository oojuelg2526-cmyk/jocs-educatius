/* =====================================================================
   Projecte Jocs educatius (Integrat 01) - Script de la base de dades
   SGBD: Microsoft SQL Server (T-SQL). Equip: Oscar Ojuel, Alex Campano,
   Roger Duran i Raul Hernandez.

   Que fa aquest script:
     1. Crea la base de dades (si no existeix) i la selecciona.
     2. Crea totes les taules de l'aplicacio (mateix esquema que les
        migracions de Laravel 13 de la carpeta database/migrations).
        Cada taula nomes es crea si encara no existeix.
     3. Insereix les dades de prova: els 4 jocs amb els seus 3 nivells,
        les metriques, 1 superadministrador de prova, 5 jugadors de prova
        i partides d'exemple dels 4 jocs.

   Usuaris de prova (NO son els del servidor real):
     admin_prova   /  Prova-Jocs-2026!   (rol superadmin)
     jugador1..5   /  Prova-Jocs-2026!   (rol player)
   La contrasenya es guarda com a hash bcrypt (cost 12), com fa Laravel.

   Sense contrasenyes reals: aquest fitxer no conte cap credencial del
   servidor de bases de dades.

   Nota: si el servidor ja us dona la base de dades creada (p. ex. jocs_dawNN),
   canvieu el nom de la linia USE i salteu el CREATE DATABASE.
   ===================================================================== */

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
GO

IF DB_ID(N'jocs_educatius') IS NULL
    CREATE DATABASE [jocs_educatius];
GO

USE [jocs_educatius];
GO

/* ---------------------------------------------------------------------
   1. TAULES
   --------------------------------------------------------------------- */

IF OBJECT_ID(N'dbo.users', N'U') IS NULL
BEGIN
    create table [users] ([id] bigint not null identity primary key, [username] nvarchar(255) not null, [email] nvarchar(255) not null, [password] nvarchar(255) not null, [role] nvarchar(255) check ([role] in (N'player', N'admin', N'superadmin')) not null default 'player', [language] nchar(2) not null default 'ca', [is_active] bit not null default '1', [last_login_at] datetime null, [remember_token] nvarchar(100) null, [created_at] datetime null, [updated_at] datetime null);
    create unique index [users_username_unique] on [users] ([username]);
    create unique index [users_email_unique] on [users] ([email]);
END;
GO

IF OBJECT_ID(N'dbo.password_reset_tokens', N'U') IS NULL
BEGIN
    create table [password_reset_tokens] ([email] nvarchar(255) not null, [token] nvarchar(255) not null, [created_at] datetime null);
    alter table [password_reset_tokens] add constraint [password_reset_tokens_email_primary] primary key ([email]);
END;
GO

IF OBJECT_ID(N'dbo.sessions', N'U') IS NULL
BEGIN
    create table [sessions] ([id] nvarchar(255) not null, [user_id] bigint null, [ip_address] nvarchar(45) null, [user_agent] nvarchar(max) null, [payload] nvarchar(max) not null, [last_activity] int not null);
    alter table [sessions] add constraint [sessions_id_primary] primary key ([id]);
    create index [sessions_user_id_index] on [sessions] ([user_id]);
    create index [sessions_last_activity_index] on [sessions] ([last_activity]);
END;
GO

IF OBJECT_ID(N'dbo.cache', N'U') IS NULL
BEGIN
    create table [cache] ([key] nvarchar(255) not null, [value] nvarchar(max) not null, [expiration] bigint not null);
    alter table [cache] add constraint [cache_key_primary] primary key ([key]);
    create index [cache_expiration_index] on [cache] ([expiration]);
END;
GO

IF OBJECT_ID(N'dbo.cache_locks', N'U') IS NULL
BEGIN
    create table [cache_locks] ([key] nvarchar(255) not null, [owner] nvarchar(255) not null, [expiration] bigint not null);
    alter table [cache_locks] add constraint [cache_locks_key_primary] primary key ([key]);
    create index [cache_locks_expiration_index] on [cache_locks] ([expiration]);
END;
GO

IF OBJECT_ID(N'dbo.jobs', N'U') IS NULL
BEGIN
    create table [jobs] ([id] bigint not null identity primary key, [queue] nvarchar(255) not null, [payload] nvarchar(max) not null, [attempts] smallint not null, [reserved_at] int null, [available_at] int not null, [created_at] int not null);
    create index [jobs_queue_index] on [jobs] ([queue]);
END;
GO

IF OBJECT_ID(N'dbo.job_batches', N'U') IS NULL
BEGIN
    create table [job_batches] ([id] nvarchar(255) not null, [name] nvarchar(255) not null, [total_jobs] int not null, [pending_jobs] int not null, [failed_jobs] int not null, [failed_job_ids] nvarchar(max) not null, [options] nvarchar(max) null, [cancelled_at] int null, [created_at] int not null, [finished_at] int null);
    alter table [job_batches] add constraint [job_batches_id_primary] primary key ([id]);
END;
GO

IF OBJECT_ID(N'dbo.failed_jobs', N'U') IS NULL
BEGIN
    create table [failed_jobs] ([id] bigint not null identity primary key, [uuid] nvarchar(255) not null, [connection] nvarchar(255) not null, [queue] nvarchar(255) not null, [payload] nvarchar(max) not null, [exception] nvarchar(max) not null, [failed_at] datetime not null default CURRENT_TIMESTAMP);
    create index [failed_jobs_connection_queue_failed_at_index] on [failed_jobs] ([connection], [queue], [failed_at]);
    create unique index [failed_jobs_uuid_unique] on [failed_jobs] ([uuid]);
END;
GO

IF OBJECT_ID(N'dbo.games', N'U') IS NULL
BEGIN
    create table [games] ([id] bigint not null identity primary key, [slug] nvarchar(255) not null, [order_no] tinyint not null, [name_key] nvarchar(255) not null);
    create unique index [games_slug_unique] on [games] ([slug]);
    create unique index [games_order_no_unique] on [games] ([order_no]);
END;
GO

IF OBJECT_ID(N'dbo.levels', N'U') IS NULL
BEGIN
    create table [levels] ([id] bigint not null identity primary key, [game_id] bigint not null, [level_no] tinyint not null, [name_key] nvarchar(255) not null);
    alter table [levels] add constraint [levels_game_id_foreign] foreign key ([game_id]) references [games] ([id]);
    create unique index [levels_game_id_level_no_unique] on [levels] ([game_id], [level_no]);
END;
GO

IF OBJECT_ID(N'dbo.user_game_progress', N'U') IS NULL
BEGIN
    create table [user_game_progress] ([user_id] bigint not null, [game_id] bigint not null, [status] nvarchar(255) check ([status] in (N'locked', N'unlocked', N'completed')) not null default 'locked', [last_level_completed] tinyint not null default '0', [best_score] int not null default '0', [completed_at] datetime null);
    alter table [user_game_progress] add constraint [user_game_progress_user_id_foreign] foreign key ([user_id]) references [users] ([id]);
    alter table [user_game_progress] add constraint [user_game_progress_game_id_foreign] foreign key ([game_id]) references [games] ([id]);
    alter table [user_game_progress] add constraint [user_game_progress_user_id_game_id_primary] primary key ([user_id], [game_id]);
END;
GO

IF OBJECT_ID(N'dbo.game_sessions', N'U') IS NULL
BEGIN
    create table [game_sessions] ([session_id] uniqueidentifier not null, [user_id] bigint not null, [game_id] bigint not null, [date_time] datetime not null, [ended_at] datetime null, [session_length] int not null default '0', [level_reached] tinyint not null default '1', [final_score] int not null default '0');
    alter table [game_sessions] add constraint [game_sessions_user_id_foreign] foreign key ([user_id]) references [users] ([id]);
    alter table [game_sessions] add constraint [game_sessions_game_id_foreign] foreign key ([game_id]) references [games] ([id]);
    alter table [game_sessions] add constraint [game_sessions_session_id_primary] primary key ([session_id]);
END;
GO

IF OBJECT_ID(N'dbo.level_attempts', N'U') IS NULL
BEGIN
    create table [level_attempts] ([id] bigint not null identity primary key, [session_id] uniqueidentifier not null, [level_id] bigint not null, [level_time] int not null, [errors_made] int null, [moves_count] int null, [help_clicks] int null, [score] int not null default '0', [stars] tinyint not null default '0', [completed] bit not null default '0');
    alter table [level_attempts] add constraint [level_attempts_session_id_foreign] foreign key ([session_id]) references [game_sessions] ([session_id]);
    alter table [level_attempts] add constraint [level_attempts_level_id_foreign] foreign key ([level_id]) references [levels] ([id]);
END;
GO

IF OBJECT_ID(N'dbo.metric_definitions', N'U') IS NULL
BEGIN
    create table [metric_definitions] ([id] bigint not null identity primary key, [game_id] bigint not null, [metric_key] nvarchar(255) not null, [description] nvarchar(255) null, [value_type] nvarchar(255) check ([value_type] in (N'int', N'float')) not null default 'int');
    alter table [metric_definitions] add constraint [metric_definitions_game_id_foreign] foreign key ([game_id]) references [games] ([id]);
    create unique index [metric_definitions_game_id_metric_key_unique] on [metric_definitions] ([game_id], [metric_key]);
END;
GO

IF OBJECT_ID(N'dbo.session_metrics', N'U') IS NULL
BEGIN
    create table [session_metrics] ([session_id] uniqueidentifier not null, [metric_id] bigint not null, [value] decimal(12, 2) not null);
    alter table [session_metrics] add constraint [session_metrics_session_id_foreign] foreign key ([session_id]) references [game_sessions] ([session_id]);
    alter table [session_metrics] add constraint [session_metrics_metric_id_foreign] foreign key ([metric_id]) references [metric_definitions] ([id]);
    alter table [session_metrics] add constraint [session_metrics_session_id_metric_id_primary] primary key ([session_id], [metric_id]);
END;
GO

IF OBJECT_ID(N'dbo.audit_log', N'U') IS NULL
BEGIN
    create table [audit_log] ([id] bigint not null identity primary key, [admin_id] bigint not null, [target_user_id] bigint null, [action] nvarchar(255) not null, [details] nvarchar(max) null, [created_at] datetime not null default CURRENT_TIMESTAMP);
    alter table [audit_log] add constraint [audit_log_admin_id_foreign] foreign key ([admin_id]) references [users] ([id]);
    alter table [audit_log] add constraint [audit_log_target_user_id_foreign] foreign key ([target_user_id]) references [users] ([id]);
END;
GO

-- Taula que Laravel fa servir per saber quines migracions ja s'han executat
IF OBJECT_ID(N'dbo.migrations', N'U') IS NULL
BEGIN
    CREATE TABLE [migrations] ([id] int NOT NULL IDENTITY PRIMARY KEY, [migration] nvarchar(255) NOT NULL, [batch] int NOT NULL);
END;
GO

/* ---------------------------------------------------------------------
   2. DADES DE PROVA
   Executeu aquesta part una sola vegada (les taules si que es poden recrear sense risc).
   --------------------------------------------------------------------- */

INSERT INTO [migrations] ([migration],[batch])
SELECT v.m, 1 FROM (VALUES
    (N'0001_01_01_000000_create_users_table'),
    (N'0001_01_01_000001_create_cache_table'),
    (N'0001_01_01_000002_create_jobs_table'),
    (N'2026_11_18_000001_create_games_table'),
    (N'2026_11_18_000002_create_levels_table'),
    (N'2026_11_18_000003_create_user_game_progress_table'),
    (N'2026_11_18_000004_create_game_sessions_table'),
    (N'2026_11_18_000005_create_level_attempts_table'),
    (N'2026_11_18_000006_create_metric_definitions_table'),
    (N'2026_11_18_000007_create_session_metrics_table'),
    (N'2026_11_18_000008_create_audit_log_table')
) AS v(m) WHERE NOT EXISTS (SELECT 1 FROM [migrations] x WHERE x.[migration] = v.m);
GO

-- Jocs (ordre de desbloqueig 1 a 4)
SET IDENTITY_INSERT [games] ON;
INSERT INTO [games] ([id],[slug],[order_no],[name_key]) SELECT 1, N'memory', 1, N'games.memory' WHERE NOT EXISTS (SELECT 1 FROM [games] WHERE [id]=1);
INSERT INTO [games] ([id],[slug],[order_no],[name_key]) SELECT 2, N'eixample', 2, N'games.eixample' WHERE NOT EXISTS (SELECT 1 FROM [games] WHERE [id]=2);
INSERT INTO [games] ([id],[slug],[order_no],[name_key]) SELECT 3, N'timeline', 3, N'games.timeline' WHERE NOT EXISTS (SELECT 1 FROM [games] WHERE [id]=3);
INSERT INTO [games] ([id],[slug],[order_no],[name_key]) SELECT 4, N'metro', 4, N'games.metro' WHERE NOT EXISTS (SELECT 1 FROM [games] WHERE [id]=4);
SET IDENTITY_INSERT [games] OFF;
GO

-- Nivells (3 per joc)
SET IDENTITY_INSERT [levels] ON;
INSERT INTO [levels] ([id],[game_id],[level_no],[name_key]) SELECT 1, 1, 1, N'games.memory.level_1' WHERE NOT EXISTS (SELECT 1 FROM [levels] WHERE [id]=1);
INSERT INTO [levels] ([id],[game_id],[level_no],[name_key]) SELECT 2, 1, 2, N'games.memory.level_2' WHERE NOT EXISTS (SELECT 1 FROM [levels] WHERE [id]=2);
INSERT INTO [levels] ([id],[game_id],[level_no],[name_key]) SELECT 3, 1, 3, N'games.memory.level_3' WHERE NOT EXISTS (SELECT 1 FROM [levels] WHERE [id]=3);
INSERT INTO [levels] ([id],[game_id],[level_no],[name_key]) SELECT 4, 2, 1, N'games.eixample.level_1' WHERE NOT EXISTS (SELECT 1 FROM [levels] WHERE [id]=4);
INSERT INTO [levels] ([id],[game_id],[level_no],[name_key]) SELECT 5, 2, 2, N'games.eixample.level_2' WHERE NOT EXISTS (SELECT 1 FROM [levels] WHERE [id]=5);
INSERT INTO [levels] ([id],[game_id],[level_no],[name_key]) SELECT 6, 2, 3, N'games.eixample.level_3' WHERE NOT EXISTS (SELECT 1 FROM [levels] WHERE [id]=6);
INSERT INTO [levels] ([id],[game_id],[level_no],[name_key]) SELECT 7, 3, 1, N'games.timeline.level_1' WHERE NOT EXISTS (SELECT 1 FROM [levels] WHERE [id]=7);
INSERT INTO [levels] ([id],[game_id],[level_no],[name_key]) SELECT 8, 3, 2, N'games.timeline.level_2' WHERE NOT EXISTS (SELECT 1 FROM [levels] WHERE [id]=8);
INSERT INTO [levels] ([id],[game_id],[level_no],[name_key]) SELECT 9, 3, 3, N'games.timeline.level_3' WHERE NOT EXISTS (SELECT 1 FROM [levels] WHERE [id]=9);
INSERT INTO [levels] ([id],[game_id],[level_no],[name_key]) SELECT 10, 4, 1, N'games.metro.level_1' WHERE NOT EXISTS (SELECT 1 FROM [levels] WHERE [id]=10);
INSERT INTO [levels] ([id],[game_id],[level_no],[name_key]) SELECT 11, 4, 2, N'games.metro.level_2' WHERE NOT EXISTS (SELECT 1 FROM [levels] WHERE [id]=11);
INSERT INTO [levels] ([id],[game_id],[level_no],[name_key]) SELECT 12, 4, 3, N'games.metro.level_3' WHERE NOT EXISTS (SELECT 1 FROM [levels] WHERE [id]=12);
SET IDENTITY_INSERT [levels] OFF;
GO

-- Definicio de metriques pròpies de cada joc
SET IDENTITY_INSERT [metric_definitions] ON;
INSERT INTO [metric_definitions] ([id],[game_id],[metric_key],[description],[value_type]) SELECT 1, 1, N'attempts', N'Intentos de pareja', N'int' WHERE NOT EXISTS (SELECT 1 FROM [metric_definitions] WHERE [id]=1);
INSERT INTO [metric_definitions] ([id],[game_id],[metric_key],[description],[value_type]) SELECT 2, 2, N'puzzles_solved', N'Puzles resueltos', N'int' WHERE NOT EXISTS (SELECT 1 FROM [metric_definitions] WHERE [id]=2);
SET IDENTITY_INSERT [metric_definitions] OFF;
GO

-- Usuaris de prova (contrasenya de prova per a tots, en hash bcrypt)
SET IDENTITY_INSERT [users] ON;
INSERT INTO [users] ([id],[username],[email],[password],[role],[language],[is_active],[last_login_at],[created_at],[updated_at]) SELECT 1, N'admin_prova', N'admin_prova@exemple.test', N'$2y$12$7AbRRZltTQK7dcPYtD2/fe.nOJpq8U53JBJ/ZZz/mfPLfygiZN9Ii', N'superadmin', N'ca', 1, '2026-11-20 10:00:00', '2026-11-20 10:00:00', '2026-11-20 10:00:00' WHERE NOT EXISTS (SELECT 1 FROM [users] WHERE [id]=1);
INSERT INTO [users] ([id],[username],[email],[password],[role],[language],[is_active],[last_login_at],[created_at],[updated_at]) SELECT 2, N'jugador1', N'jugador1@exemple.test', N'$2y$12$7AbRRZltTQK7dcPYtD2/fe.nOJpq8U53JBJ/ZZz/mfPLfygiZN9Ii', N'player', N'ca', 1, '2026-11-20 11:00:00', '2026-11-20 11:00:00', '2026-11-20 11:00:00' WHERE NOT EXISTS (SELECT 1 FROM [users] WHERE [id]=2);
INSERT INTO [users] ([id],[username],[email],[password],[role],[language],[is_active],[last_login_at],[created_at],[updated_at]) SELECT 3, N'jugador2', N'jugador2@exemple.test', N'$2y$12$7AbRRZltTQK7dcPYtD2/fe.nOJpq8U53JBJ/ZZz/mfPLfygiZN9Ii', N'player', N'es', 1, '2026-11-20 12:00:00', '2026-11-20 12:00:00', '2026-11-20 12:00:00' WHERE NOT EXISTS (SELECT 1 FROM [users] WHERE [id]=3);
INSERT INTO [users] ([id],[username],[email],[password],[role],[language],[is_active],[last_login_at],[created_at],[updated_at]) SELECT 4, N'jugador3', N'jugador3@exemple.test', N'$2y$12$7AbRRZltTQK7dcPYtD2/fe.nOJpq8U53JBJ/ZZz/mfPLfygiZN9Ii', N'player', N'en', 1, '2026-11-20 13:00:00', '2026-11-20 13:00:00', '2026-11-20 13:00:00' WHERE NOT EXISTS (SELECT 1 FROM [users] WHERE [id]=4);
INSERT INTO [users] ([id],[username],[email],[password],[role],[language],[is_active],[last_login_at],[created_at],[updated_at]) SELECT 5, N'jugador4', N'jugador4@exemple.test', N'$2y$12$7AbRRZltTQK7dcPYtD2/fe.nOJpq8U53JBJ/ZZz/mfPLfygiZN9Ii', N'player', N'ca', 1, '2026-11-20 14:00:00', '2026-11-20 14:00:00', '2026-11-20 14:00:00' WHERE NOT EXISTS (SELECT 1 FROM [users] WHERE [id]=5);
INSERT INTO [users] ([id],[username],[email],[password],[role],[language],[is_active],[last_login_at],[created_at],[updated_at]) SELECT 6, N'jugador5', N'jugador5@exemple.test', N'$2y$12$7AbRRZltTQK7dcPYtD2/fe.nOJpq8U53JBJ/ZZz/mfPLfygiZN9Ii', N'player', N'es', 1, '2026-11-20 15:00:00', '2026-11-20 15:00:00', '2026-11-20 15:00:00' WHERE NOT EXISTS (SELECT 1 FROM [users] WHERE [id]=6);
SET IDENTITY_INSERT [users] OFF;
GO

-- Partides d'exemple dels 4 jocs

INSERT INTO [game_sessions] ([session_id],[user_id],[game_id],[date_time],[ended_at],[session_length],[level_reached],[final_score]) VALUES ('8306D03B-F38B-4FFC-80A4-DF5A51C9BC70', 2, 1, '2026-11-21 13:41:00', '2026-11-21 13:45:20', 260, 1, 570);
INSERT INTO [game_sessions] ([session_id],[user_id],[game_id],[date_time],[ended_at],[session_length],[level_reached],[final_score]) VALUES ('C6CD75E9-BB04-4A79-97A7-A3CC8C3D5F16', 2, 2, '2026-11-21 16:49:00', '2026-11-21 16:54:18', 318, 3, 1600);
INSERT INTO [game_sessions] ([session_id],[user_id],[game_id],[date_time],[ended_at],[session_length],[level_reached],[final_score]) VALUES ('65B00A2D-35D1-4880-9071-950EADEC6F11', 2, 3, '2026-11-21 19:16:00', '2026-11-21 19:21:54', 354, 2, 1170);
INSERT INTO [game_sessions] ([session_id],[user_id],[game_id],[date_time],[ended_at],[session_length],[level_reached],[final_score]) VALUES ('A51149BB-E060-4724-A411-4258751B4C83', 3, 1, '2026-11-21 22:45:00', '2026-11-21 22:53:00', 480, 2, 910);
INSERT INTO [game_sessions] ([session_id],[user_id],[game_id],[date_time],[ended_at],[session_length],[level_reached],[final_score]) VALUES ('8DF05F25-95F1-4A51-A416-86CD66160227', 3, 2, '2026-11-22 01:31:00', '2026-11-22 01:32:09', 69, 1, 290);
INSERT INTO [game_sessions] ([session_id],[user_id],[game_id],[date_time],[ended_at],[session_length],[level_reached],[final_score]) VALUES ('90624FE3-6B82-46C9-982F-B0F1423674A6', 3, 3, '2026-11-22 04:30:00', '2026-11-22 04:40:30', 630, 3, 1750);
INSERT INTO [game_sessions] ([session_id],[user_id],[game_id],[date_time],[ended_at],[session_length],[level_reached],[final_score]) VALUES ('D9814559-3A9A-4A39-A261-E34A7B6BC3C6', 3, 4, '2026-11-22 07:07:00', '2026-11-22 07:10:20', 200, 1, 160);
INSERT INTO [game_sessions] ([session_id],[user_id],[game_id],[date_time],[ended_at],[session_length],[level_reached],[final_score]) VALUES ('FA97002C-FCBA-4167-B5A9-CA5FEDF165DA', 4, 1, '2026-11-22 10:34:00', '2026-11-22 10:42:50', 530, 3, 940);
INSERT INTO [game_sessions] ([session_id],[user_id],[game_id],[date_time],[ended_at],[session_length],[level_reached],[final_score]) VALUES ('A7D83351-265C-48EA-8879-D955025FF87C', 5, 1, '2026-11-22 13:38:00', '2026-11-22 13:42:08', 248, 2, 520);
INSERT INTO [game_sessions] ([session_id],[user_id],[game_id],[date_time],[ended_at],[session_length],[level_reached],[final_score]) VALUES ('CED66B44-7F45-4096-9380-1B73C446AB8C', 5, 2, '2026-11-22 16:27:00', '2026-11-22 16:35:14', 494, 3, 1500);
INSERT INTO [game_sessions] ([session_id],[user_id],[game_id],[date_time],[ended_at],[session_length],[level_reached],[final_score]) VALUES ('5EC0C260-7F98-40A6-A73C-49EA44371FF3', 6, 1, '2026-11-22 19:06:00', '2026-11-22 19:11:20', 320, 3, 1850);
INSERT INTO [game_sessions] ([session_id],[user_id],[game_id],[date_time],[ended_at],[session_length],[level_reached],[final_score]) VALUES ('8BE40E7F-C079-41D4-8B6E-C6F39EFEBFDA', 6, 2, '2026-11-22 22:17:00', '2026-11-22 22:20:31', 211, 1, 690);
INSERT INTO [game_sessions] ([session_id],[user_id],[game_id],[date_time],[ended_at],[session_length],[level_reached],[final_score]) VALUES ('ED1BA5C8-C4FF-464E-9304-3FCA9543C6C3', 6, 3, '2026-11-23 01:31:00', '2026-11-23 01:38:18', 438, 3, 1260);
GO

-- Intents de nivell
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('8306D03B-F38B-4FFC-80A4-DF5A51C9BC70', 1, 260, 1, 26, 3, 570, 3, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('C6CD75E9-BB04-4A79-97A7-A3CC8C3D5F16', 4, 165, 9, 40, 1, 370, 1, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('C6CD75E9-BB04-4A79-97A7-A3CC8C3D5F16', 5, 40, 9, 17, 0, 650, 1, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('C6CD75E9-BB04-4A79-97A7-A3CC8C3D5F16', 6, 113, 1, 40, 0, 580, 3, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('65B00A2D-35D1-4880-9071-950EADEC6F11', 7, 129, 5, 36, 0, 540, 2, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('65B00A2D-35D1-4880-9071-950EADEC6F11', 8, 225, 5, 17, 2, 630, 2, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('A51149BB-E060-4724-A411-4258751B4C83', 1, 223, 9, 31, 0, 510, 1, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('A51149BB-E060-4724-A411-4258751B4C83', 2, 257, 5, 35, 3, 400, 2, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('8DF05F25-95F1-4A51-A416-86CD66160227', 4, 69, 6, 44, 3, 290, 1, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('90624FE3-6B82-46C9-982F-B0F1423674A6', 7, 171, 8, 13, 1, 660, 1, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('90624FE3-6B82-46C9-982F-B0F1423674A6', 8, 236, 2, 15, 0, 810, 3, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('90624FE3-6B82-46C9-982F-B0F1423674A6', 9, 223, 9, 39, 3, 280, 1, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('D9814559-3A9A-4A39-A261-E34A7B6BC3C6', 10, 200, 7, 55, 3, 160, 1, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('FA97002C-FCBA-4167-B5A9-CA5FEDF165DA', 1, 104, 8, 37, 2, 370, 1, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('FA97002C-FCBA-4167-B5A9-CA5FEDF165DA', 2, 180, 8, 56, 3, 130, 1, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('FA97002C-FCBA-4167-B5A9-CA5FEDF165DA', 3, 246, 6, 39, 1, 440, 1, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('A7D83351-265C-48EA-8879-D955025FF87C', 1, 157, 8, 43, 2, 310, 1, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('A7D83351-265C-48EA-8879-D955025FF87C', 2, 91, 4, 56, 3, 210, 2, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('CED66B44-7F45-4096-9380-1B73C446AB8C', 4, 182, 0, 30, 2, 600, 3, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('CED66B44-7F45-4096-9380-1B73C446AB8C', 5, 157, 1, 40, 2, 480, 3, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('CED66B44-7F45-4096-9380-1B73C446AB8C', 6, 155, 2, 39, 3, 420, 3, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('5EC0C260-7F98-40A6-A73C-49EA44371FF3', 1, 89, 6, 21, 3, 520, 1, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('5EC0C260-7F98-40A6-A73C-49EA44371FF3', 2, 43, 1, 12, 3, 710, 3, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('5EC0C260-7F98-40A6-A73C-49EA44371FF3', 3, 188, 8, 17, 1, 620, 1, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('8BE40E7F-C079-41D4-8B6E-C6F39EFEBFDA', 4, 211, 5, 21, 0, 690, 2, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('ED1BA5C8-C4FF-464E-9304-3FCA9543C6C3', 7, 216, 2, 46, 1, 450, 3, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('ED1BA5C8-C4FF-464E-9304-3FCA9543C6C3', 8, 161, 9, 20, 2, 520, 1, 1);
INSERT INTO [level_attempts] ([session_id],[level_id],[level_time],[errors_made],[moves_count],[help_clicks],[score],[stars],[completed]) VALUES ('ED1BA5C8-C4FF-464E-9304-3FCA9543C6C3', 9, 61, 6, 54, 1, 290, 1, 1);
GO

-- Metriques per sessio (Memory: intents; Eixample: puzles)
INSERT INTO [session_metrics] ([session_id],[metric_id],[value]) VALUES ('8306D03B-F38B-4FFC-80A4-DF5A51C9BC70', 1, 18.00);
INSERT INTO [session_metrics] ([session_id],[metric_id],[value]) VALUES ('C6CD75E9-BB04-4A79-97A7-A3CC8C3D5F16', 2, 9.00);
INSERT INTO [session_metrics] ([session_id],[metric_id],[value]) VALUES ('A51149BB-E060-4724-A411-4258751B4C83', 1, 25.00);
INSERT INTO [session_metrics] ([session_id],[metric_id],[value]) VALUES ('8DF05F25-95F1-4A51-A416-86CD66160227', 2, 2.00);
INSERT INTO [session_metrics] ([session_id],[metric_id],[value]) VALUES ('FA97002C-FCBA-4167-B5A9-CA5FEDF165DA', 1, 36.00);
INSERT INTO [session_metrics] ([session_id],[metric_id],[value]) VALUES ('A7D83351-265C-48EA-8879-D955025FF87C', 1, 26.00);
INSERT INTO [session_metrics] ([session_id],[metric_id],[value]) VALUES ('CED66B44-7F45-4096-9380-1B73C446AB8C', 2, 3.00);
INSERT INTO [session_metrics] ([session_id],[metric_id],[value]) VALUES ('5EC0C260-7F98-40A6-A73C-49EA44371FF3', 1, 33.00);
INSERT INTO [session_metrics] ([session_id],[metric_id],[value]) VALUES ('8BE40E7F-C079-41D4-8B6E-C6F39EFEBFDA', 2, 2.00);
GO

-- Progres de cada jugador per joc
INSERT INTO [user_game_progress] ([user_id],[game_id],[status],[last_level_completed],[best_score],[completed_at]) VALUES (2, 1, N'unlocked', 1, 570, NULL);
INSERT INTO [user_game_progress] ([user_id],[game_id],[status],[last_level_completed],[best_score],[completed_at]) VALUES (2, 2, N'completed', 3, 1600, '2026-11-22 10:00:00');
INSERT INTO [user_game_progress] ([user_id],[game_id],[status],[last_level_completed],[best_score],[completed_at]) VALUES (2, 3, N'unlocked', 2, 1170, NULL);
INSERT INTO [user_game_progress] ([user_id],[game_id],[status],[last_level_completed],[best_score],[completed_at]) VALUES (2, 4, N'locked', 0, 0, NULL);
INSERT INTO [user_game_progress] ([user_id],[game_id],[status],[last_level_completed],[best_score],[completed_at]) VALUES (3, 1, N'unlocked', 2, 910, NULL);
INSERT INTO [user_game_progress] ([user_id],[game_id],[status],[last_level_completed],[best_score],[completed_at]) VALUES (3, 2, N'unlocked', 1, 290, NULL);
INSERT INTO [user_game_progress] ([user_id],[game_id],[status],[last_level_completed],[best_score],[completed_at]) VALUES (3, 3, N'completed', 3, 1750, '2026-11-22 10:00:00');
INSERT INTO [user_game_progress] ([user_id],[game_id],[status],[last_level_completed],[best_score],[completed_at]) VALUES (3, 4, N'unlocked', 1, 160, NULL);
INSERT INTO [user_game_progress] ([user_id],[game_id],[status],[last_level_completed],[best_score],[completed_at]) VALUES (4, 1, N'completed', 3, 940, '2026-11-22 10:00:00');
INSERT INTO [user_game_progress] ([user_id],[game_id],[status],[last_level_completed],[best_score],[completed_at]) VALUES (4, 2, N'locked', 0, 0, NULL);
INSERT INTO [user_game_progress] ([user_id],[game_id],[status],[last_level_completed],[best_score],[completed_at]) VALUES (4, 3, N'locked', 0, 0, NULL);
INSERT INTO [user_game_progress] ([user_id],[game_id],[status],[last_level_completed],[best_score],[completed_at]) VALUES (4, 4, N'locked', 0, 0, NULL);
INSERT INTO [user_game_progress] ([user_id],[game_id],[status],[last_level_completed],[best_score],[completed_at]) VALUES (5, 1, N'unlocked', 2, 520, NULL);
INSERT INTO [user_game_progress] ([user_id],[game_id],[status],[last_level_completed],[best_score],[completed_at]) VALUES (5, 2, N'completed', 3, 1500, '2026-11-22 10:00:00');
INSERT INTO [user_game_progress] ([user_id],[game_id],[status],[last_level_completed],[best_score],[completed_at]) VALUES (5, 3, N'locked', 0, 0, NULL);
INSERT INTO [user_game_progress] ([user_id],[game_id],[status],[last_level_completed],[best_score],[completed_at]) VALUES (5, 4, N'locked', 0, 0, NULL);
INSERT INTO [user_game_progress] ([user_id],[game_id],[status],[last_level_completed],[best_score],[completed_at]) VALUES (6, 1, N'completed', 3, 1850, '2026-11-22 10:00:00');
INSERT INTO [user_game_progress] ([user_id],[game_id],[status],[last_level_completed],[best_score],[completed_at]) VALUES (6, 2, N'unlocked', 1, 690, NULL);
INSERT INTO [user_game_progress] ([user_id],[game_id],[status],[last_level_completed],[best_score],[completed_at]) VALUES (6, 3, N'completed', 3, 1260, '2026-11-22 10:00:00');
INSERT INTO [user_game_progress] ([user_id],[game_id],[status],[last_level_completed],[best_score],[completed_at]) VALUES (6, 4, N'locked', 0, 0, NULL);
GO

-- Registre d'auditoria d'exemple (accions del superadministrador)
INSERT INTO [audit_log] ([admin_id],[target_user_id],[action],[details]) VALUES (1, 3, N'update_user', N'Canvi d''idioma de prova');
INSERT INTO [audit_log] ([admin_id],[target_user_id],[action],[details]) VALUES (1, 4, N'reset_score', N'Puntuacio reiniciada de prova');
GO

PRINT N'Base de dades jocs_educatius creada amb dades de prova.';
GO

/* ---------------------------------------------------------------------
   3. COMPROVACIONS RAPIDES (opcional)
   --------------------------------------------------------------------- */
-- SELECT g.slug, COUNT(l.id) AS nivells FROM games g JOIN levels l ON l.game_id = g.id GROUP BY g.slug;
-- SELECT role, COUNT(*) FROM users GROUP BY role;
-- SELECT COUNT(*) AS partides FROM game_sessions;

