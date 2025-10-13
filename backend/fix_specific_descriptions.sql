-- ==============================
-- CORREGIR DESCRIPCIONES ESPECÍFICAS POR EVENT_ID
-- ==============================

-- Corregir descripciones específicas que aún tienen problemas de codificación

UPDATE events 
SET description = 'Aprende las ultimas tecnologias: React, Node.js, TypeScript y mas.'
WHERE event_id = 26;

UPDATE events 
SET description = 'Proteccion de datos, ethical hacking y mejores practicas de seguridad informatica.'
WHERE event_id = 27;

UPDATE events 
SET description = 'Competencia de programacion de 24 horas. Premios para los mejores proyectos.'
WHERE event_id = 29;

UPDATE events 
SET description = 'Experiencias de founders exitosos en startups tecnologicas.'
WHERE event_id = 30;

UPDATE events 
SET description = 'Proyeccion de peliculas clasicas bajo las estrellas con entrada gratuita.'
WHERE event_id = 33;

UPDATE events 
SET description = 'Exposicion y premiacion de las mejores fotografias tomadas por estudiantes.'
WHERE event_id = 35;

UPDATE events 
SET description = 'Carrera de 5 kilometros abierta a toda la comunidad universitaria.'
WHERE event_id = 37;

UPDATE events 
SET description = 'Competencia de ajedrez rapido con partidas de 10 minutos.'
WHERE event_id = 38;

-- ==============================
-- VERIFICACIÓN FINAL
-- ==============================

-- Mostrar todas las descripciones corregidas
SELECT event_id, title, description 
FROM events 
ORDER BY event_id;

-- Verificar que no queden caracteres especiales problemáticos
SELECT COUNT(*) as eventos_con_caracteres_especiales
FROM events 
WHERE description LIKE '%á%' OR description LIKE '%é%' OR description LIKE '%í%' OR description LIKE '%ó%' OR description LIKE '%ú%' OR description LIKE '%ñ%'
   OR description LIKE '%├%' OR description LIKE '%│%' OR description LIKE '%║%';
