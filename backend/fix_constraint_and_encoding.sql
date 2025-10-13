-- ==============================
-- CORRECCIÓN COMPLETA: RESTRICCIÓN Y CODIFICACIÓN
-- ==============================
-- ==============================
-- PASO 1: ELIMINAR LA RESTRICCIÓN ACTUAL
-- ==============================
ALTER TABLE
    events DROP CONSTRAINT IF EXISTS events_event_type_check;

-- ==============================
-- PASO 2: CREAR NUEVA RESTRICCIÓN CON VALORES EN ESPAÑOL
-- ==============================
ALTER TABLE
    events
ADD
    CONSTRAINT events_event_type_check CHECK (
        event_type IN ('académico', 'cultural', 'deportivo')
    );

-- ==============================
-- PASO 3: ACTUALIZAR TIPOS DE EVENTOS A ESPAÑOL
-- ==============================
UPDATE
    events
SET
    event_type = 'académico'
WHERE
    event_type = 'academic';

UPDATE
    events
SET
    event_type = 'deportivo'
WHERE
    event_type = 'sports';

-- 'cultural' ya está correcto, no necesita cambio
-- ==============================
-- PASO 4: CORRECCIÓN COMPLETA DE CARACTERES ESPECIALES
-- ==============================
-- Corregir títulos
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
    title = 'Charla: Emprendimiento Tecnológico'
WHERE
    title LIKE '%Charla: Emprendimiento%';

UPDATE
    events
SET
    title = 'Festival de Música Universitaria'
WHERE
    title LIKE '%Festival de M%';

UPDATE
    events
SET
    title = 'Exposición de Arte Contemporáneo'
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
    title = 'Concurso de Fotografía Estudiantil'
WHERE
    title LIKE '%Concurso de Fotografia%';

UPDATE
    events
SET
    title = 'Torneo de Fútbol Interfacultades'
WHERE
    title LIKE '%Torneo de Ftbol%';

UPDATE
    events
SET
    title = 'Maratón Universitaria 5K'
WHERE
    title LIKE '%Maraton%';

UPDATE
    events
SET
    title = 'Torneo de Ajedrez Relámpago'
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

-- Corregir descripciones
UPDATE
    events
SET
    description = 'Conferencia sobre los últimos avances en IA y Machine Learning aplicados a la industria.'
WHERE
    description LIKE '%avances en IA%';

UPDATE
    events
SET
    description = 'Aprende las últimas tecnologías: React, Node.js, TypeScript y más.'
WHERE
    description LIKE '%tecnologías: React%';

UPDATE
    events
SET
    description = 'Protección de datos, ethical hacking y mejores prácticas de seguridad informática.'
WHERE
    description LIKE '%seguridad informática%';

UPDATE
    events
SET
    description = 'Análisis de datos con Python, Pandas y visualización con Matplotlib.'
WHERE
    description LIKE '%datos con Python%';

UPDATE
    events
SET
    description = 'Competencia de programación de 24 horas. Premios para los mejores proyectos.'
WHERE
    description LIKE '%programación de 24%';

UPDATE
    events
SET
    description = 'Experiencias de founders exitosos en startups tecnológicas.'
WHERE
    description LIKE '%startups tecnológicas%';

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
    description = 'Proyección de películas clásicas bajo las estrellas con entrada gratuita.'
WHERE
    description LIKE '%películas clásicas%';

UPDATE
    events
SET
    description = 'Presentación de la obra clásica de Shakespeare por el grupo de teatro estudiantil.'
WHERE
    description LIKE '%Shakespeare%';

UPDATE
    events
SET
    description = 'Exposición y premiación de las mejores fotografías tomadas por estudiantes.'
WHERE
    description LIKE '%fotografías tomadas%';

UPDATE
    events
SET
    description = 'Competencia deportiva entre las diferentes facultades de la universidad.'
WHERE
    description LIKE '%facultades de la universidad%';

UPDATE
    events
SET
    description = 'Carrera de 5 kilómetros abierta a toda la comunidad universitaria.'
WHERE
    description LIKE '%kilómetros abierta%';

UPDATE
    events
SET
    description = 'Competencia de ajedrez rápido con partidas de 10 minutos.'
WHERE
    description LIKE '%ajedrez rápido%';

UPDATE
    events
SET
    description = 'Sesión de yoga para principiantes, trae tu mat o toalla.'
WHERE
    description LIKE '%yoga para principiantes%';

UPDATE
    events
SET
    description = 'Competencia de voleibol en las canchas de arena del campus.'
WHERE
    description LIKE '%voleibol en las canchas%';

-- Corregir ubicaciones
UPDATE
    events
SET
    location = 'Laboratorio de Computación 3'
WHERE
    location LIKE '%Computación%';

UPDATE
    events
SET
    location = 'Centro de Innovación Tecnológica'
WHERE
    location LIKE '%Innovación Tecnológica%';

UPDATE
    events
SET
    location = 'Galería de Arte Universitaria'
WHERE
    location LIKE '%Galería%';

UPDATE
    events
SET
    location = 'Campus Universitario - Circuito Atlético'
WHERE
    location LIKE '%Atlético%';

-- ==============================
-- VERIFICACIÓN FINAL
-- ==============================
-- Ver todos los eventos con tipos corregidos
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

-- Verificar algunos eventos específicos
SELECT
    event_id,
    title,
    description,
    event_type,
    location
FROM
    events
WHERE
    event_id IN (25, 26, 31, 36, 39)
ORDER BY
    event_id;