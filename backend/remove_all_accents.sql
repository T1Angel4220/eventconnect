-- ==============================
-- REMOVER TODAS LAS TILDES Y CARACTERES ESPECIALES
-- ==============================
-- ==============================
-- PASO 1: ACTUALIZAR RESTRICCIÓN PARA TIPOS SIN TILDES
-- ==============================
ALTER TABLE
    events DROP CONSTRAINT IF EXISTS events_event_type_check;

ALTER TABLE
    events
ADD
    CONSTRAINT events_event_type_check CHECK (
        event_type IN ('academico', 'cultural', 'deportivo')
    );

-- ==============================
-- PASO 2: CAMBIAR TIPOS DE EVENTOS A VERSIONES SIN TILDES
-- ==============================
UPDATE
    events
SET
    event_type = 'academico'
WHERE
    event_type LIKE '%academico%';

UPDATE
    events
SET
    event_type = 'deportivo'
WHERE
    event_type LIKE '%deportivo%';

-- 'cultural' ya está sin tildes
-- ==============================
-- PASO 3: CORREGIR TÍTULOS - REMOVER TILDES
-- ==============================
UPDATE
    events
SET
    title = 'Conferencia de Inteligencia Artificial'
WHERE
    title LIKE '%Conferencia de Inteligencia Artificial%';

UPDATE
    events
SET
    title = 'Taller de Desarrollo Web Moderno'
WHERE
    title LIKE '%Taller de Desarrollo Web Moderno%';

UPDATE
    events
SET
    title = 'Seminario de Ciberseguridad'
WHERE
    title LIKE '%Seminario de Ciberseguridad%';

UPDATE
    events
SET
    title = 'Workshop de Ciencia de Datos'
WHERE
    title LIKE '%Workshop de Ciencia de Datos%';

UPDATE
    events
SET
    title = 'Hackathon Universitario 2025'
WHERE
    title LIKE '%Hackathon Universitario 2025%';

UPDATE
    events
SET
    title = 'Charla: Emprendimiento Tecnologico'
WHERE
    title LIKE '%Emprendimiento%';

UPDATE
    events
SET
    title = 'Festival de Musica Universitaria'
WHERE
    title LIKE '%Festival de M%';

UPDATE
    events
SET
    title = 'Exposicion de Arte Contemporaneo'
WHERE
    title LIKE '%Exposicion%';

UPDATE
    events
SET
    title = 'Noche de Cine al Aire Libre'
WHERE
    title LIKE '%Noche de Cine al Aire Libre%';

UPDATE
    events
SET
    title = 'Teatro Universitario: Hamlet'
WHERE
    title LIKE '%Teatro Universitario: Hamlet%';

UPDATE
    events
SET
    title = 'Concurso de Fotografia Estudiantil'
WHERE
    title LIKE '%Concurso de Fotografia%';

UPDATE
    events
SET
    title = 'Torneo de Futbol Interfacultades'
WHERE
    title LIKE '%Torneo de F%';

UPDATE
    events
SET
    title = 'Maraton Universitaria 5K'
WHERE
    title LIKE '%Maraton%';

UPDATE
    events
SET
    title = 'Torneo de Ajedrez Relampago'
WHERE
    title LIKE '%Torneo de Ajedrez%';

UPDATE
    events
SET
    title = 'Clase Abierta de Yoga'
WHERE
    title LIKE '%Clase Abierta de Yoga%';

UPDATE
    events
SET
    title = 'Torneo de Voleibol Playa'
WHERE
    title LIKE '%Torneo de Voleibol Playa%';

-- ==============================
-- PASO 4: CORREGIR DESCRIPCIONES - REMOVER TILDES
-- ==============================
UPDATE
    events
SET
    description = 'Conferencia sobre los ultimos avances en IA y Machine Learning aplicados a la industria.'
WHERE
    description LIKE '%avances en IA%';

UPDATE
    events
SET
    description = 'Aprende las ultimas tecnologias: React, Node.js, TypeScript y mas.'
WHERE
    description LIKE '%tecnologias: React%';

UPDATE
    events
SET
    description = 'Proteccion de datos, ethical hacking y mejores practicas de seguridad informatica.'
WHERE
    description LIKE '%seguridad informatica%';

UPDATE
    events
SET
    description = 'Analisis de datos con Python, Pandas y visualizacion con Matplotlib.'
WHERE
    description LIKE '%datos con Python%';

UPDATE
    events
SET
    description = 'Competencia de programacion de 24 horas. Premios para los mejores proyectos.'
WHERE
    description LIKE '%programacion de 24%';

UPDATE
    events
SET
    description = 'Experiencias de founders exitosos en startups tecnologicas.'
WHERE
    description LIKE '%startups tecnologicas%';

UPDATE
    events
SET
    description = 'Conciertos de bandas estudiantiles y artistas invitados. Entrada libre.'
WHERE
    description LIKE '%bandas estudiantiles%';

UPDATE
    events
SET
    description = 'Obras de estudiantes de la Facultad de Bellas Artes y artistas locales.'
WHERE
    description LIKE '%Bellas Artes%';

UPDATE
    events
SET
    description = 'Proyeccion de peliculas clasicas bajo las estrellas con entrada gratuita.'
WHERE
    description LIKE '%peliculas clasicas%';

UPDATE
    events
SET
    description = 'Presentacion de la obra clasica de Shakespeare por el grupo de teatro estudiantil.'
WHERE
    description LIKE '%Shakespeare%';

UPDATE
    events
SET
    description = 'Exposicion y premiacion de las mejores fotografias tomadas por estudiantes.'
WHERE
    description LIKE '%fotografias tomadas%';

UPDATE
    events
SET
    description = 'Competencia deportiva entre las diferentes facultades de la universidad.'
WHERE
    description LIKE '%facultades de la universidad%';

UPDATE
    events
SET
    description = 'Carrera de 5 kilometros abierta a toda la comunidad universitaria.'
WHERE
    description LIKE '%kilometros abierta%';

UPDATE
    events
SET
    description = 'Competencia de ajedrez rapido con partidas de 10 minutos.'
WHERE
    description LIKE '%ajedrez rapido%';

UPDATE
    events
SET
    description = 'Sesion de yoga para principiantes, trae tu mat o toalla.'
WHERE
    description LIKE '%yoga para principiantes%';

UPDATE
    events
SET
    description = 'Competencia de voleibol en las canchas de arena del campus.'
WHERE
    description LIKE '%voleibol en las canchas%';

-- ==============================
-- PASO 5: CORREGIR UBICACIONES - REMOVER TILDES
-- ==============================
UPDATE
    events
SET
    location = 'Laboratorio de Computacion 3'
WHERE
    location LIKE '%Computacion%';

UPDATE
    events
SET
    location = 'Centro de Innovacion Tecnologica'
WHERE
    location LIKE '%Innovacion Tecnologica%';

UPDATE
    events
SET
    location = 'Galeria de Arte Universitaria'
WHERE
    location LIKE '%Galeria%';

UPDATE
    events
SET
    location = 'Campus Universitario - Circuito Atletico'
WHERE
    location LIKE '%Atletico%';

-- ==============================
-- VERIFICACIÓN FINAL
-- ==============================
-- Ver todos los eventos con caracteres sin tildes
SELECT
    event_id,
    title,
    event_type,
    location
FROM
    events
ORDER BY
    event_id;

-- Ver conteo por tipo de evento
SELECT
    event_type,
    COUNT(*) as total
FROM
    events
GROUP BY
    event_type
ORDER BY
    total DESC;

-- Verificar que no hay caracteres especiales problemáticos
SELECT
    event_id,
    title,
    description,
    event_type,
    location
FROM
    events
WHERE
    title LIKE '%á%'
    OR title LIKE '%é%'
    OR title LIKE '%í%'
    OR title LIKE '%ó%'
    OR title LIKE '%ú%'
    OR title LIKE '%ñ%'
    OR description LIKE '%á%'
    OR description LIKE '%é%'
    OR description LIKE '%í%'
    OR description LIKE '%ó%'
    OR description LIKE '%ú%'
    OR description LIKE '%ñ%'
    OR location LIKE '%á%'
    OR location LIKE '%é%'
    OR location LIKE '%í%'
    OR location LIKE '%ó%'
    OR location LIKE '%ú%'
    OR location LIKE '%ñ%'
ORDER BY
    event_id;