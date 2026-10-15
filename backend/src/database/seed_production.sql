-- ============================================================================
-- INSTITUTO CASA JANE - SCRIPT DE MIGRAÇÃO DE DADOS LOCAL -> PRODUÇÃO (NEON)
-- Gerado em: 15/10/2026, 19:00:02
-- ============================================================================

-- Desabilita temporariamente verificações se necessário
BEGIN;

-- ----------------------------------------------------------------------------
-- Dados da Tabela: users (3 registros)
-- ----------------------------------------------------------------------------
INSERT INTO users ("id", "name", "email", "password_hash", "role", "active", "created_at", "first_login_at", "last_login_at", "failed_login_attempts", "is_locked", "lock_reason", "locked_at")
VALUES (1, 'Administrador', 'admin@institutocasajane.org.br', '$2a$10$4Qn1OtLCDl9aFlrh/DqMnensm9eQx/DdPKxOOA9u3WG2xuoT25z/C', 'superadmin', true, '2026-10-10T03:08:33.234Z', '2026-10-15T21:20:34.984Z', '2026-10-15T21:20:34.984Z', 0, false, 'MANUAL', '2026-10-15T15:23:50.382Z')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name", "email" = EXCLUDED."email", "password_hash" = EXCLUDED."password_hash", "role" = EXCLUDED."role", "active" = EXCLUDED."active", "created_at" = EXCLUDED."created_at", "first_login_at" = EXCLUDED."first_login_at", "last_login_at" = EXCLUDED."last_login_at", "failed_login_attempts" = EXCLUDED."failed_login_attempts", "is_locked" = EXCLUDED."is_locked", "lock_reason" = EXCLUDED."lock_reason", "locked_at" = EXCLUDED."locked_at";

INSERT INTO users ("id", "name", "email", "password_hash", "role", "active", "created_at", "first_login_at", "last_login_at", "failed_login_attempts", "is_locked", "lock_reason", "locked_at")
VALUES (2, 'Debleko', 'gabrielfreecss@gmail.com', '$2a$10$4xcl46chLsJhp3/MP/1yk.qsiPUH7BNec2FK9dfzoBAAbZH/1tLkq', 'superadmin', true, '2026-10-10T03:52:17.976Z', '2026-10-15T11:32:54.952Z', '2026-10-15T21:29:12.833Z', 0, false, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name", "email" = EXCLUDED."email", "password_hash" = EXCLUDED."password_hash", "role" = EXCLUDED."role", "active" = EXCLUDED."active", "created_at" = EXCLUDED."created_at", "first_login_at" = EXCLUDED."first_login_at", "last_login_at" = EXCLUDED."last_login_at", "failed_login_attempts" = EXCLUDED."failed_login_attempts", "is_locked" = EXCLUDED."is_locked", "lock_reason" = EXCLUDED."lock_reason", "locked_at" = EXCLUDED."locked_at";

INSERT INTO users ("id", "name", "email", "password_hash", "role", "active", "created_at", "first_login_at", "last_login_at", "failed_login_attempts", "is_locked", "lock_reason", "locked_at")
VALUES (3, 'teste', 'teste@gmail.com', '$2a$10$sWT62SXt5HWI1AhYQJIwTOOh/qTCIH9VE3JW/cIv4ywdWYNzC8WKK', 'coordinator', true, '2026-10-14T22:06:10.686Z', NULL, NULL, 0, false, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name", "email" = EXCLUDED."email", "password_hash" = EXCLUDED."password_hash", "role" = EXCLUDED."role", "active" = EXCLUDED."active", "created_at" = EXCLUDED."created_at", "first_login_at" = EXCLUDED."first_login_at", "last_login_at" = EXCLUDED."last_login_at", "failed_login_attempts" = EXCLUDED."failed_login_attempts", "is_locked" = EXCLUDED."is_locked", "lock_reason" = EXCLUDED."lock_reason", "locked_at" = EXCLUDED."locked_at";

SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1));

-- ----------------------------------------------------------------------------
-- Dados da Tabela: projects (7 registros)
-- ----------------------------------------------------------------------------
INSERT INTO projects ("id", "name", "description", "category", "status", "coordinator_id", "schedule", "location", "max_capacity", "created_at")
VALUES (1, 'Aula de Violão', 'Aulas de violão para crianças e adolescentes, desenvolvendo coordenação, ritmo e expressão artística.', 'Música', 'active', 1, '', 'Igreja ADMV (Rua Tarumã, 53, Alvorada)', 15, '2026-10-10T04:04:20.317Z')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name", "description" = EXCLUDED."description", "category" = EXCLUDED."category", "status" = EXCLUDED."status", "coordinator_id" = EXCLUDED."coordinator_id", "schedule" = EXCLUDED."schedule", "location" = EXCLUDED."location", "max_capacity" = EXCLUDED."max_capacity", "created_at" = EXCLUDED."created_at";

INSERT INTO projects ("id", "name", "description", "category", "status", "coordinator_id", "schedule", "location", "max_capacity", "created_at")
VALUES (2, 'Aulas de Violino', 'Iniciação ao violino, desenvolvimento da postura, afinação e percepção musical para crianças e adolescentes.', 'Música', 'active', NULL, 'Conforme turma na secretaria', 'Igreja ADMV (Rua Tarumã, 53, Alvorada)', 15, '2026-10-14T22:00:18.571Z')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name", "description" = EXCLUDED."description", "category" = EXCLUDED."category", "status" = EXCLUDED."status", "coordinator_id" = EXCLUDED."coordinator_id", "schedule" = EXCLUDED."schedule", "location" = EXCLUDED."location", "max_capacity" = EXCLUDED."max_capacity", "created_at" = EXCLUDED."created_at";

INSERT INTO projects ("id", "name", "description", "category", "status", "coordinator_id", "schedule", "location", "max_capacity", "created_at")
VALUES (3, 'Aulas de Teclado', 'Estudo prático de teclado e piano, aprendizado de acordes, escalas e repertório popular e clássico.', 'Música', 'active', NULL, 'Conforme turma na secretaria', 'Igreja ADMV (Rua Tarumã, 53, Alvorada)', 15, '2026-10-14T22:00:18.574Z')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name", "description" = EXCLUDED."description", "category" = EXCLUDED."category", "status" = EXCLUDED."status", "coordinator_id" = EXCLUDED."coordinator_id", "schedule" = EXCLUDED."schedule", "location" = EXCLUDED."location", "max_capacity" = EXCLUDED."max_capacity", "created_at" = EXCLUDED."created_at";

INSERT INTO projects ("id", "name", "description", "category", "status", "coordinator_id", "schedule", "location", "max_capacity", "created_at")
VALUES (4, 'Aulas de Flauta Doce', 'Introdução à linguagem dos instrumentos de sopro, estimulando a respiração, ritmo e coordenação motora.', 'Música', 'active', NULL, 'Conforme turma na secretaria', 'Igreja ADMV (Rua Tarumã, 53, Alvorada)', 15, '2026-10-14T22:00:18.575Z')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name", "description" = EXCLUDED."description", "category" = EXCLUDED."category", "status" = EXCLUDED."status", "coordinator_id" = EXCLUDED."coordinator_id", "schedule" = EXCLUDED."schedule", "location" = EXCLUDED."location", "max_capacity" = EXCLUDED."max_capacity", "created_at" = EXCLUDED."created_at";

INSERT INTO projects ("id", "name", "description", "category", "status", "coordinator_id", "schedule", "location", "max_capacity", "created_at")
VALUES (5, 'Teoria Musical', 'Formação complementar com leitura de partituras, ritmo, solfejo e princípios fundamentais da música.', 'Música', 'active', NULL, 'Conforme turma na secretaria', 'Igreja ADMV (Rua Tarumã, 53, Alvorada)', 20, '2026-10-14T22:00:18.576Z')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name", "description" = EXCLUDED."description", "category" = EXCLUDED."category", "status" = EXCLUDED."status", "coordinator_id" = EXCLUDED."coordinator_id", "schedule" = EXCLUDED."schedule", "location" = EXCLUDED."location", "max_capacity" = EXCLUDED."max_capacity", "created_at" = EXCLUDED."created_at";

INSERT INTO projects ("id", "name", "description", "category", "status", "coordinator_id", "schedule", "location", "max_capacity", "created_at")
VALUES (6, 'Aulas de Jiu-Jitsu', 'Artes marciais promovendo disciplina, respeito mútuo, autocontrole, cidadania e condicionamento físico.', 'Esporte', 'active', NULL, 'Conforme turma na secretaria', 'Igreja ADMV (Rua Tarumã, 53, Alvorada)', 25, '2026-10-14T22:00:18.577Z')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name", "description" = EXCLUDED."description", "category" = EXCLUDED."category", "status" = EXCLUDED."status", "coordinator_id" = EXCLUDED."coordinator_id", "schedule" = EXCLUDED."schedule", "location" = EXCLUDED."location", "max_capacity" = EXCLUDED."max_capacity", "created_at" = EXCLUDED."created_at";

INSERT INTO projects ("id", "name", "description", "category", "status", "coordinator_id", "schedule", "location", "max_capacity", "created_at")
VALUES (7, 'Xadrez & Raciocínio Lógico', 'Iniciativas pedagógicas e campeonatos de xadrez voltados ao desenvolvimento do raciocínio lógico, foco e paciência.', 'Esporte & Lazer', 'active', NULL, 'Conforme turma na secretaria', 'Igreja ADMV (Rua Tarumã, 53, Alvorada)', 20, '2026-10-14T22:00:18.577Z')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name", "description" = EXCLUDED."description", "category" = EXCLUDED."category", "status" = EXCLUDED."status", "coordinator_id" = EXCLUDED."coordinator_id", "schedule" = EXCLUDED."schedule", "location" = EXCLUDED."location", "max_capacity" = EXCLUDED."max_capacity", "created_at" = EXCLUDED."created_at";

SELECT setval(pg_get_serial_sequence('projects', 'id'), COALESCE((SELECT MAX(id) FROM projects), 1));

-- ----------------------------------------------------------------------------
-- Dados da Tabela: people (12 registros)
-- ----------------------------------------------------------------------------
INSERT INTO people ("id", "name", "birth_date", "cpf", "rg", "gender", "person_type", "phone", "email", "address", "neighborhood", "city", "school", "notes", "photo_url", "status", "created_at")
VALUES (1, 'Gabriel Ferreira', '1999-06-13T03:00:00.000Z', '', '', 'Masculino', 'adult', '', 'gabrielfreecss@gmail.com', '', 'Alvorada', 'Vila Velha', '', '', NULL, 'active', '2026-10-10T04:04:45.280Z')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name", "birth_date" = EXCLUDED."birth_date", "cpf" = EXCLUDED."cpf", "rg" = EXCLUDED."rg", "gender" = EXCLUDED."gender", "person_type" = EXCLUDED."person_type", "phone" = EXCLUDED."phone", "email" = EXCLUDED."email", "address" = EXCLUDED."address", "neighborhood" = EXCLUDED."neighborhood", "city" = EXCLUDED."city", "school" = EXCLUDED."school", "notes" = EXCLUDED."notes", "photo_url" = EXCLUDED."photo_url", "status" = EXCLUDED."status", "created_at" = EXCLUDED."created_at";

INSERT INTO people ("id", "name", "birth_date", "cpf", "rg", "gender", "person_type", "phone", "email", "address", "neighborhood", "city", "school", "notes", "photo_url", "status", "created_at")
VALUES (2, 'Danielle Santos de Oliveira', '1980-06-15T03:00:00.000Z', '', '', 'Feminino', 'adult', '', '', '', '', '', '', '', NULL, 'active', '2026-10-10T14:56:44.531Z')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name", "birth_date" = EXCLUDED."birth_date", "cpf" = EXCLUDED."cpf", "rg" = EXCLUDED."rg", "gender" = EXCLUDED."gender", "person_type" = EXCLUDED."person_type", "phone" = EXCLUDED."phone", "email" = EXCLUDED."email", "address" = EXCLUDED."address", "neighborhood" = EXCLUDED."neighborhood", "city" = EXCLUDED."city", "school" = EXCLUDED."school", "notes" = EXCLUDED."notes", "photo_url" = EXCLUDED."photo_url", "status" = EXCLUDED."status", "created_at" = EXCLUDED."created_at";

INSERT INTO people ("id", "name", "birth_date", "cpf", "rg", "gender", "person_type", "phone", "email", "address", "neighborhood", "city", "school", "notes", "photo_url", "status", "created_at")
VALUES (3, 'Geraldo Dalco Ferreira', '1970-06-13T03:00:00.000Z', '', '', 'Masculino', 'adult', '', '', '', '', '', '', '', NULL, 'active', '2026-10-10T14:57:07.711Z')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name", "birth_date" = EXCLUDED."birth_date", "cpf" = EXCLUDED."cpf", "rg" = EXCLUDED."rg", "gender" = EXCLUDED."gender", "person_type" = EXCLUDED."person_type", "phone" = EXCLUDED."phone", "email" = EXCLUDED."email", "address" = EXCLUDED."address", "neighborhood" = EXCLUDED."neighborhood", "city" = EXCLUDED."city", "school" = EXCLUDED."school", "notes" = EXCLUDED."notes", "photo_url" = EXCLUDED."photo_url", "status" = EXCLUDED."status", "created_at" = EXCLUDED."created_at";

INSERT INTO people ("id", "name", "birth_date", "cpf", "rg", "gender", "person_type", "phone", "email", "address", "neighborhood", "city", "school", "notes", "photo_url", "status", "created_at")
VALUES (4, 'Elton Oliveira Ferreira', '2000-09-14T03:00:00.000Z', '', '', 'Masculino', 'adult', '', '', '', '', '', '', '', NULL, 'active', '2026-10-10T14:57:27.506Z')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name", "birth_date" = EXCLUDED."birth_date", "cpf" = EXCLUDED."cpf", "rg" = EXCLUDED."rg", "gender" = EXCLUDED."gender", "person_type" = EXCLUDED."person_type", "phone" = EXCLUDED."phone", "email" = EXCLUDED."email", "address" = EXCLUDED."address", "neighborhood" = EXCLUDED."neighborhood", "city" = EXCLUDED."city", "school" = EXCLUDED."school", "notes" = EXCLUDED."notes", "photo_url" = EXCLUDED."photo_url", "status" = EXCLUDED."status", "created_at" = EXCLUDED."created_at";

INSERT INTO people ("id", "name", "birth_date", "cpf", "rg", "gender", "person_type", "phone", "email", "address", "neighborhood", "city", "school", "notes", "photo_url", "status", "created_at")
VALUES (5, 'Aluno Teste da Silva', '2014-05-10T03:00:00.000Z', '123.456.789-00', NULL, 'Masculino', 'child', '(27) 99888-7777', NULL, NULL, 'Alvorada', 'Vila Velha', 'EMEF Prof. Teste', '[INSCRIÇÃO VIA SITE - MATRÍCULA ONLINE]
Responsável: Maria da Silva (mother)
Contato do Responsável: (27) 99888-7777
Turno Escolar: Vespertino
Turno de Preferência: Manhã
Observações da Família: Interesse em violão ou xadrez', NULL, 'waitlist', '2026-10-15T12:25:17.399Z')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name", "birth_date" = EXCLUDED."birth_date", "cpf" = EXCLUDED."cpf", "rg" = EXCLUDED."rg", "gender" = EXCLUDED."gender", "person_type" = EXCLUDED."person_type", "phone" = EXCLUDED."phone", "email" = EXCLUDED."email", "address" = EXCLUDED."address", "neighborhood" = EXCLUDED."neighborhood", "city" = EXCLUDED."city", "school" = EXCLUDED."school", "notes" = EXCLUDED."notes", "photo_url" = EXCLUDED."photo_url", "status" = EXCLUDED."status", "created_at" = EXCLUDED."created_at";

INSERT INTO people ("id", "name", "birth_date", "cpf", "rg", "gender", "person_type", "phone", "email", "address", "neighborhood", "city", "school", "notes", "photo_url", "status", "created_at")
VALUES (6, 'Maria da Silva', NULL, NULL, NULL, NULL, 'adult', '(27) 99888-7777', NULL, NULL, 'Alvorada', 'Vila Velha', NULL, 'Responsável legal por Aluno Teste da Silva (cadastrado via matrícula online)', NULL, 'active', '2026-10-15T12:25:17.403Z')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name", "birth_date" = EXCLUDED."birth_date", "cpf" = EXCLUDED."cpf", "rg" = EXCLUDED."rg", "gender" = EXCLUDED."gender", "person_type" = EXCLUDED."person_type", "phone" = EXCLUDED."phone", "email" = EXCLUDED."email", "address" = EXCLUDED."address", "neighborhood" = EXCLUDED."neighborhood", "city" = EXCLUDED."city", "school" = EXCLUDED."school", "notes" = EXCLUDED."notes", "photo_url" = EXCLUDED."photo_url", "status" = EXCLUDED."status", "created_at" = EXCLUDED."created_at";

INSERT INTO people ("id", "name", "birth_date", "cpf", "rg", "gender", "person_type", "phone", "email", "address", "neighborhood", "city", "school", "notes", "photo_url", "status", "created_at")
VALUES (7, 'Aluno Teste da Silva', '2014-05-10T03:00:00.000Z', '123.456.789-00', NULL, 'Masculino', 'child', '(27) 99888-7777', NULL, NULL, 'Alvorada', 'Vila Velha', 'EMEF Prof. Teste', '[INSCRIÇÃO VIA SITE - MATRÍCULA ONLINE]
Responsável: Maria da Silva (mother)
Contato do Responsável: (27) 99888-7777
Turno Escolar: Vespertino
Turno de Preferência: Manhã
Observações da Família: Interesse em violão ou xadrez', NULL, 'waitlist', '2026-10-15T12:26:17.950Z')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name", "birth_date" = EXCLUDED."birth_date", "cpf" = EXCLUDED."cpf", "rg" = EXCLUDED."rg", "gender" = EXCLUDED."gender", "person_type" = EXCLUDED."person_type", "phone" = EXCLUDED."phone", "email" = EXCLUDED."email", "address" = EXCLUDED."address", "neighborhood" = EXCLUDED."neighborhood", "city" = EXCLUDED."city", "school" = EXCLUDED."school", "notes" = EXCLUDED."notes", "photo_url" = EXCLUDED."photo_url", "status" = EXCLUDED."status", "created_at" = EXCLUDED."created_at";

INSERT INTO people ("id", "name", "birth_date", "cpf", "rg", "gender", "person_type", "phone", "email", "address", "neighborhood", "city", "school", "notes", "photo_url", "status", "created_at")
VALUES (8, 'Maria da Silva', NULL, NULL, NULL, NULL, 'adult', '(27) 99888-7777', NULL, NULL, 'Alvorada', 'Vila Velha', NULL, 'Responsável legal por Aluno Teste da Silva (cadastrado via matrícula online)', NULL, 'active', '2026-10-15T12:26:17.955Z')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name", "birth_date" = EXCLUDED."birth_date", "cpf" = EXCLUDED."cpf", "rg" = EXCLUDED."rg", "gender" = EXCLUDED."gender", "person_type" = EXCLUDED."person_type", "phone" = EXCLUDED."phone", "email" = EXCLUDED."email", "address" = EXCLUDED."address", "neighborhood" = EXCLUDED."neighborhood", "city" = EXCLUDED."city", "school" = EXCLUDED."school", "notes" = EXCLUDED."notes", "photo_url" = EXCLUDED."photo_url", "status" = EXCLUDED."status", "created_at" = EXCLUDED."created_at";

INSERT INTO people ("id", "name", "birth_date", "cpf", "rg", "gender", "person_type", "phone", "email", "address", "neighborhood", "city", "school", "notes", "photo_url", "status", "created_at")
VALUES (9, 'Aluno Projeto Teste', '2012-08-15T03:00:00.000Z', NULL, NULL, NULL, 'child', '(27) 99777-6666', NULL, NULL, 'Alvorada', 'Vila Velha', NULL, '[INSCRIÇÃO VIA SITE - MATRÍCULA ONLINE]
Responsável: João Pai Teste (father)', NULL, 'waitlist', '2026-10-15T12:27:04.495Z')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name", "birth_date" = EXCLUDED."birth_date", "cpf" = EXCLUDED."cpf", "rg" = EXCLUDED."rg", "gender" = EXCLUDED."gender", "person_type" = EXCLUDED."person_type", "phone" = EXCLUDED."phone", "email" = EXCLUDED."email", "address" = EXCLUDED."address", "neighborhood" = EXCLUDED."neighborhood", "city" = EXCLUDED."city", "school" = EXCLUDED."school", "notes" = EXCLUDED."notes", "photo_url" = EXCLUDED."photo_url", "status" = EXCLUDED."status", "created_at" = EXCLUDED."created_at";

INSERT INTO people ("id", "name", "birth_date", "cpf", "rg", "gender", "person_type", "phone", "email", "address", "neighborhood", "city", "school", "notes", "photo_url", "status", "created_at")
VALUES (10, 'João Pai Teste', NULL, NULL, NULL, NULL, 'adult', '(27) 99777-6666', NULL, NULL, 'Alvorada', 'Vila Velha', NULL, 'Responsável legal por Aluno Projeto Teste (cadastrado via matrícula online)', NULL, 'active', '2026-10-15T12:27:04.497Z')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name", "birth_date" = EXCLUDED."birth_date", "cpf" = EXCLUDED."cpf", "rg" = EXCLUDED."rg", "gender" = EXCLUDED."gender", "person_type" = EXCLUDED."person_type", "phone" = EXCLUDED."phone", "email" = EXCLUDED."email", "address" = EXCLUDED."address", "neighborhood" = EXCLUDED."neighborhood", "city" = EXCLUDED."city", "school" = EXCLUDED."school", "notes" = EXCLUDED."notes", "photo_url" = EXCLUDED."photo_url", "status" = EXCLUDED."status", "created_at" = EXCLUDED."created_at";

INSERT INTO people ("id", "name", "birth_date", "cpf", "rg", "gender", "person_type", "phone", "email", "address", "neighborhood", "city", "school", "notes", "photo_url", "status", "created_at")
VALUES (11, 'Pedro Zezinho', '2018-08-20T03:00:00.000Z', '', '', 'Masculino', 'child', '(27) 99835-4839', 'gabrielfreecss@gmail.com', '', 'Alvorada', 'Vila Velha', 'Gabriel Ferreira', '[INSCRIÇÃO VIA SITE - MATRÍCULA ONLINE]
Responsável: Gabriel Ferreira (Pai)
Contato do Responsável: (27) 99835-4839
Turno Escolar: Vespertino
Turno de Preferência: Tarde
Observações da Família: Possui experiência/conhecimento prévio: Sim, já praticou antes | Teste', '', 'active', '2026-10-15T13:00:38.161Z')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name", "birth_date" = EXCLUDED."birth_date", "cpf" = EXCLUDED."cpf", "rg" = EXCLUDED."rg", "gender" = EXCLUDED."gender", "person_type" = EXCLUDED."person_type", "phone" = EXCLUDED."phone", "email" = EXCLUDED."email", "address" = EXCLUDED."address", "neighborhood" = EXCLUDED."neighborhood", "city" = EXCLUDED."city", "school" = EXCLUDED."school", "notes" = EXCLUDED."notes", "photo_url" = EXCLUDED."photo_url", "status" = EXCLUDED."status", "created_at" = EXCLUDED."created_at";

INSERT INTO people ("id", "name", "birth_date", "cpf", "rg", "gender", "person_type", "phone", "email", "address", "neighborhood", "city", "school", "notes", "photo_url", "status", "created_at")
VALUES (12, 'Gabriel Ferreira', NULL, NULL, NULL, NULL, 'adult', '(27) 99835-4839', NULL, NULL, 'Alvorada', 'Vila Velha', NULL, 'Responsável legal por Pedro Zezinho (cadastrado via matrícula online)', NULL, 'active', '2026-10-15T13:00:38.163Z')
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name", "birth_date" = EXCLUDED."birth_date", "cpf" = EXCLUDED."cpf", "rg" = EXCLUDED."rg", "gender" = EXCLUDED."gender", "person_type" = EXCLUDED."person_type", "phone" = EXCLUDED."phone", "email" = EXCLUDED."email", "address" = EXCLUDED."address", "neighborhood" = EXCLUDED."neighborhood", "city" = EXCLUDED."city", "school" = EXCLUDED."school", "notes" = EXCLUDED."notes", "photo_url" = EXCLUDED."photo_url", "status" = EXCLUDED."status", "created_at" = EXCLUDED."created_at";

SELECT setval(pg_get_serial_sequence('people', 'id'), COALESCE((SELECT MAX(id) FROM people), 1));

-- ----------------------------------------------------------------------------
-- Dados da Tabela: family_relationships (7 registros)
-- ----------------------------------------------------------------------------
INSERT INTO family_relationships ("id", "person_a_id", "person_b_id", "relationship_type")
VALUES (2, 1, 4, 'sibling')
ON CONFLICT (id) DO UPDATE SET
  "person_a_id" = EXCLUDED."person_a_id", "person_b_id" = EXCLUDED."person_b_id", "relationship_type" = EXCLUDED."relationship_type";

INSERT INTO family_relationships ("id", "person_a_id", "person_b_id", "relationship_type")
VALUES (3, 1, 2, 'parent')
ON CONFLICT (id) DO UPDATE SET
  "person_a_id" = EXCLUDED."person_a_id", "person_b_id" = EXCLUDED."person_b_id", "relationship_type" = EXCLUDED."relationship_type";

INSERT INTO family_relationships ("id", "person_a_id", "person_b_id", "relationship_type")
VALUES (4, 1, 3, 'parent')
ON CONFLICT (id) DO UPDATE SET
  "person_a_id" = EXCLUDED."person_a_id", "person_b_id" = EXCLUDED."person_b_id", "relationship_type" = EXCLUDED."relationship_type";

INSERT INTO family_relationships ("id", "person_a_id", "person_b_id", "relationship_type")
VALUES (5, 5, 6, 'mother')
ON CONFLICT (id) DO UPDATE SET
  "person_a_id" = EXCLUDED."person_a_id", "person_b_id" = EXCLUDED."person_b_id", "relationship_type" = EXCLUDED."relationship_type";

INSERT INTO family_relationships ("id", "person_a_id", "person_b_id", "relationship_type")
VALUES (6, 7, 8, 'mother')
ON CONFLICT (id) DO UPDATE SET
  "person_a_id" = EXCLUDED."person_a_id", "person_b_id" = EXCLUDED."person_b_id", "relationship_type" = EXCLUDED."relationship_type";

INSERT INTO family_relationships ("id", "person_a_id", "person_b_id", "relationship_type")
VALUES (7, 9, 10, 'father')
ON CONFLICT (id) DO UPDATE SET
  "person_a_id" = EXCLUDED."person_a_id", "person_b_id" = EXCLUDED."person_b_id", "relationship_type" = EXCLUDED."relationship_type";

INSERT INTO family_relationships ("id", "person_a_id", "person_b_id", "relationship_type")
VALUES (8, 11, 12, 'Pai')
ON CONFLICT (id) DO UPDATE SET
  "person_a_id" = EXCLUDED."person_a_id", "person_b_id" = EXCLUDED."person_b_id", "relationship_type" = EXCLUDED."relationship_type";

SELECT setval(pg_get_serial_sequence('family_relationships', 'id'), COALESCE((SELECT MAX(id) FROM family_relationships), 1));

-- ----------------------------------------------------------------------------
-- Dados da Tabela: project_enrollments (4 registros)
-- ----------------------------------------------------------------------------
INSERT INTO project_enrollments ("id", "person_id", "project_id", "enrolled_at", "status", "class_group", "notes")
VALUES (1, 1, 1, '2026-10-10T03:00:00.000Z', 'active', '', '')
ON CONFLICT (id) DO UPDATE SET
  "person_id" = EXCLUDED."person_id", "project_id" = EXCLUDED."project_id", "enrolled_at" = EXCLUDED."enrolled_at", "status" = EXCLUDED."status", "class_group" = EXCLUDED."class_group", "notes" = EXCLUDED."notes";

INSERT INTO project_enrollments ("id", "person_id", "project_id", "enrolled_at", "status", "class_group", "notes")
VALUES (2, 9, 1, '2026-10-15T03:00:00.000Z', 'waitlist', NULL, 'Inscrição realizada pelo site público')
ON CONFLICT (id) DO UPDATE SET
  "person_id" = EXCLUDED."person_id", "project_id" = EXCLUDED."project_id", "enrolled_at" = EXCLUDED."enrolled_at", "status" = EXCLUDED."status", "class_group" = EXCLUDED."class_group", "notes" = EXCLUDED."notes";

INSERT INTO project_enrollments ("id", "person_id", "project_id", "enrolled_at", "status", "class_group", "notes")
VALUES (4, 7, 1, '2026-10-15T03:00:00.000Z', 'active', '', '')
ON CONFLICT (id) DO UPDATE SET
  "person_id" = EXCLUDED."person_id", "project_id" = EXCLUDED."project_id", "enrolled_at" = EXCLUDED."enrolled_at", "status" = EXCLUDED."status", "class_group" = EXCLUDED."class_group", "notes" = EXCLUDED."notes";

INSERT INTO project_enrollments ("id", "person_id", "project_id", "enrolled_at", "status", "class_group", "notes")
VALUES (6, 11, 6, '2026-10-15T03:00:00.000Z', 'active', '', '')
ON CONFLICT (id) DO UPDATE SET
  "person_id" = EXCLUDED."person_id", "project_id" = EXCLUDED."project_id", "enrolled_at" = EXCLUDED."enrolled_at", "status" = EXCLUDED."status", "class_group" = EXCLUDED."class_group", "notes" = EXCLUDED."notes";

SELECT setval(pg_get_serial_sequence('project_enrollments', 'id'), COALESCE((SELECT MAX(id) FROM project_enrollments), 1));

-- ----------------------------------------------------------------------------
-- Dados da Tabela: documents (1 registros)
-- ----------------------------------------------------------------------------
INSERT INTO documents ("id", "title", "category", "file_url", "file_name", "is_public", "uploaded_by", "created_at")
VALUES (1, 'Instituto Casa Jane', 'Ata', '/uploads/file-1791604810337-807756748.pdf', 'Apresentacao Institucional - Instituto Casa Jane.pdf', true, 2, '2026-10-10T04:00:10.377Z')
ON CONFLICT (id) DO UPDATE SET
  "title" = EXCLUDED."title", "category" = EXCLUDED."category", "file_url" = EXCLUDED."file_url", "file_name" = EXCLUDED."file_name", "is_public" = EXCLUDED."is_public", "uploaded_by" = EXCLUDED."uploaded_by", "created_at" = EXCLUDED."created_at";

SELECT setval(pg_get_serial_sequence('documents', 'id'), COALESCE((SELECT MAX(id) FROM documents), 1));

-- ----------------------------------------------------------------------------
-- Dados da Tabela: donation_config (1 registros)
-- ----------------------------------------------------------------------------
INSERT INTO donation_config ("id", "pix_key", "pix_key_type", "bank_name", "agency", "account", "account_holder", "message", "show_donation_section")
VALUES (1, '27998354839', 'phone', 'Caixa', '0001', '00000-0', 'Gabriel de Oliveira Ferreira', 'Sua doação transforma vidas!', true)
ON CONFLICT (id) DO UPDATE SET
  "pix_key" = EXCLUDED."pix_key", "pix_key_type" = EXCLUDED."pix_key_type", "bank_name" = EXCLUDED."bank_name", "agency" = EXCLUDED."agency", "account" = EXCLUDED."account", "account_holder" = EXCLUDED."account_holder", "message" = EXCLUDED."message", "show_donation_section" = EXCLUDED."show_donation_section";

SELECT setval(pg_get_serial_sequence('donation_config', 'id'), COALESCE((SELECT MAX(id) FROM donation_config), 1));

-- ----------------------------------------------------------------------------
-- Dados da Tabela: security_settings (1 registros)
-- ----------------------------------------------------------------------------
INSERT INTO security_settings ("id", "max_failed_attempts", "inactivity_days_limit", "session_timeout_hours", "require_strong_passwords", "updated_at")
VALUES (1, 6, 30, 5, true, '2026-10-15T15:12:37.297Z')
ON CONFLICT (id) DO UPDATE SET
  "max_failed_attempts" = EXCLUDED."max_failed_attempts", "inactivity_days_limit" = EXCLUDED."inactivity_days_limit", "session_timeout_hours" = EXCLUDED."session_timeout_hours", "require_strong_passwords" = EXCLUDED."require_strong_passwords", "updated_at" = EXCLUDED."updated_at";

SELECT setval(pg_get_serial_sequence('security_settings', 'id'), COALESCE((SELECT MAX(id) FROM security_settings), 1));

COMMIT;
-- ============================================================================
-- FIM DO SCRIPT DE MIGRAÇÃO - DADOS TRANSFERIDOS COM SUCESSO!
-- ============================================================================
