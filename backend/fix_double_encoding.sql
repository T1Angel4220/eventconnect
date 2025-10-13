-- ==============================
-- CORRECCIÓN DE DOBLE CODIFICACIÓN EN TIPOS DE EVENTOS
-- ==============================
-- El problema es que 'académico' se codificó doblemente como 'acad\303\203\302\251mico'
-- Necesitamos corregir esto
-- ==============================
-- PASO 1: VERIFICAR EL PROBLEMA ACTUAL
-- ==============================
SELECT
    event_id,
    encode(event_type :: bytea, 'escape') as type_bytes,
    event_type
FROM
    events
WHERE
    event_type LIKE '%acad%'
LIMIT
    3;

-- ==============================
-- PASO 2: CORREGIR LA CODIFICACIÓN DE TIPOS DE EVENTOS
-- ==============================
-- Corregir 'académico' (que está mal codificado)
UPDATE
    events
SET
    event_type = 'académico'
WHERE
    encode(event_type :: bytea, 'escape') LIKE '%acad\303\203\302\251mico%';

-- Verificar que 'deportivo' no tenga problemas similares
UPDATE
    events
SET
    event_type = 'deportivo'
WHERE
    event_type = 'deportivo'
    OR encode(event_type :: bytea, 'escape') LIKE '%deportivo%';

-- 'cultural' debería estar bien, pero verificar
UPDATE
    events
SET
    event_type = 'cultural'
WHERE
    event_type = 'cultural';

-- ==============================
-- PASO 3: VERIFICAR LA CORRECCIÓN
-- ==============================
-- Verificar que los tipos ahora estén correctos
SELECT
    event_id,
    encode(event_type :: bytea, 'escape') as type_bytes,
    event_type
FROM
    events
WHERE
    event_id IN (25, 31, 36)
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

-- Mostrar algunos eventos con tipos corregidos
SELECT
    event_id,
    title,
    event_type,
    location
FROM
    events
ORDER BY
    event_id
LIMIT
    10;