-- ==============================
-- LIMPIEZA FINAL - CORREGIR CARACTERES QUE QUEDARON
-- ==============================
-- ==============================
-- CORREGIR TÍTULOS QUE AÚN TIENEN CARACTERES ESPECIALES
-- ==============================
UPDATE
    events
SET
    title = 'Exposicion de Arte Contemporaneo'
WHERE
    title LIKE '%Exposici%';

UPDATE
    events
SET
    title = 'Concurso de Fotografia Estudiantil'
WHERE
    title LIKE '%Concurso de Fotograf%';

UPDATE
    events
SET
    title = 'Maraton Universitaria 5K'
WHERE
    title LIKE '%Marat%';

-- ==============================
-- CORREGIR UBICACIONES QUE AÚN TIENEN CARACTERES ESPECIALES
-- ==============================
UPDATE
    events
SET
    location = 'Laboratorio de Computacion 3'
WHERE
    location LIKE '%Computaci%';

UPDATE
    events
SET
    location = 'Centro de Innovacion Tecnologica'
WHERE
    location LIKE '%Innovaci%';

UPDATE
    events
SET
    location = 'Galeria de Arte Universitaria'
WHERE
    location LIKE '%Galer%';

UPDATE
    events
SET
    location = 'Campus Universitario - Circuito Atletico'
WHERE
    location LIKE '%Atletico%';

-- ==============================
-- CORREGIR DESCRIPCIONES QUE AÚN TIENEN CARACTERES ESPECIALES
-- ==============================
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
    description = 'Proyeccion de peliculas clasicas bajo las estrellas con entrada gratuita.'
WHERE
    description LIKE '%peliculas clasicas%';

UPDATE
    events
SET
    description = 'Exposicion y premiacion de las mejores fotografias tomadas por estudiantes.'
WHERE
    description LIKE '%fotografias tomadas%';

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

-- ==============================
-- CORREGIR TIPO DE EVENTO QUE AÚN TIENE CARACTERES ESPECIALES
-- ==============================
-- Primero eliminar la restricción problemática
ALTER TABLE
    events DROP CONSTRAINT IF EXISTS events_event_type_check;

-- Actualizar el tipo problemático
UPDATE
    events
SET
    event_type = 'academico'
WHERE
    encode(event_type :: bytea, 'escape') LIKE '%acad%';

-- Recrear la restricción con valores correctos
ALTER TABLE
    events
ADD
    CONSTRAINT events_event_type_check CHECK (
        event_type IN ('academico', 'cultural', 'deportivo')
    );

-- ==============================
-- VERIFICACIÓN FINAL
-- ==============================
-- Ver todos los eventos limpios
SELECT
    event_id,
    title,
    event_type,
    location
FROM
    events
ORDER BY
    event_id;

-- Verificar conteo por tipo
SELECT
    event_type,
    COUNT(*) as total
FROM
    events
GROUP BY
    event_type
ORDER BY
    total DESC;

-- Mostrar algunos ejemplos de eventos corregidos
SELECT
    event_id,
    title,
    description,
    event_type,
    location
FROM
    events
WHERE
    event_id IN (25, 30, 32, 37)
ORDER BY
    event_id;