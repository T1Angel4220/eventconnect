-- ==============================
-- MIGRACIÓN: Cambiar event_type de inglés a español
-- ==============================
-- Descripción: Cambia los valores de event_type de 'academic', 'cultural', 'sports'
--              a 'academico', 'cultural', 'deportivo' (en español)
-- ==============================

-- PASO 1: Eliminar el constraint anterior para permitir actualizar los datos
ALTER TABLE events 
DROP CONSTRAINT IF EXISTS events_event_type_check;

-- PASO 2: Actualizar eventos existentes
UPDATE events 
SET event_type = CASE 
    WHEN event_type = 'academic' THEN 'academico'
    WHEN event_type = 'sports' THEN 'deportivo'
    ELSE event_type  -- 'cultural' se mantiene igual
END
WHERE event_type IN ('academic', 'sports');

-- PASO 3: Agregar el nuevo constraint con valores en español
ALTER TABLE events 
ADD CONSTRAINT events_event_type_check 
CHECK (event_type IN ('academico', 'cultural', 'deportivo'));

-- PASO 4: Resumen de eventos por tipo
SELECT 
    'Distribución de eventos por tipo:' AS resumen,
    event_type,
    COUNT(*) AS cantidad
FROM events
GROUP BY event_type
ORDER BY event_type;
