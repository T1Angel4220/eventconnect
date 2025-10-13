-- ==============================
-- CORREGIR TODAS LAS DESCRIPCIONES - REMOVER TILDES
-- ==============================
-- Corregir todas las descripciones que aún tienen tildes
UPDATE
    events
SET
    description = 'Proyeccion de peliculas clasicas bajo las estrellas con entrada gratuita.'
WHERE
    description LIKE '%peliculas cl%';

UPDATE
    events
SET
    description = 'Exposicion y premiacion de las mejores fotografias tomadas por estudiantes.'
WHERE
    description LIKE '%fotografias tomadas%';

UPDATE
    events
SET
    description = 'Proteccion de datos, ethical hacking y mejores practicas de seguridad informatica.'
WHERE
    description LIKE '%practicas de seguridad%';

UPDATE
    events
SET
    description = 'Aprende las ultimas tecnologias: React, Node.js, TypeScript y mas.'
WHERE
    description LIKE '%ultimas tecnologias%';

UPDATE
    events
SET
    description = 'Competencia de ajedrez rapido con partidas de 10 minutos.'
WHERE
    description LIKE '%ajedrez rapido%';

UPDATE
    events
SET
    description = 'Experiencias de founders exitosos en startups tecnologicas.'
WHERE
    description LIKE '%startups tecnologicas%';

UPDATE
    events
SET
    description = 'Conferencia sobre los ultimos avances en IA y Machine Learning aplicados a la industria.'
WHERE
    description LIKE '%ultimos avances en IA%';

UPDATE
    events
SET
    description = 'Competencia de programacion de 24 horas. Premios para los mejores proyectos.'
WHERE
    description LIKE '%programacion de 24%';

UPDATE
    events
SET
    description = 'Carrera de 5 kilometros abierta a toda la comunidad universitaria.'
WHERE
    description LIKE '%kilometros abierta%';

-- ==============================
-- VERIFICACIÓN
-- ==============================
-- Mostrar todas las descripciones para verificar
SELECT
    event_id,
    title,
    description
FROM
    events
ORDER BY
    event_id;

-- Verificar que no queden tildes en las descripciones
SELECT
    event_id,
    title,
    description
FROM
    events
WHERE
    description LIKE '%á%'
    OR description LIKE '%é%'
    OR description LIKE '%í%'
    OR description LIKE '%ó%'
    OR description LIKE '%ú%'
    OR description LIKE '%ñ%'
ORDER BY
    event_id;