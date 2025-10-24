-- ==============================
-- MIGRACIÓN: Cambiar event_type de inglés a español
-- ==============================
-- Fecha: 2025-01-23
-- Descripción: Cambia los valores de event_type de 'academic', 'cultural', 'sports'
--              a 'academico', 'cultural', 'deportivo' (en español)

\c eventconnect;

-- Paso 1: Actualizar todos los eventos existentes
UPDATE events 
SET event_type = CASE 
    WHEN event_type = 'academic' THEN 'academico'
    WHEN event_type = 'sports' THEN 'deportivo'
    ELSE event_type  -- 'cultural' se mantiene igual
END
WHERE event_type IN ('academic', 'sports');

-- Verificar cuántos eventos se actualizaron
SELECT 
    event_type, 
    COUNT(*) as cantidad 
FROM events 
GROUP BY event_type;

-- Paso 2: Eliminar el constraint viejo
ALTER TABLE events 
DROP CONSTRAINT IF EXISTS events_event_type_check;

-- Paso 3: Agregar el nuevo constraint con valores en español
ALTER TABLE events 
ADD CONSTRAINT events_event_type_check 
CHECK (event_type IN ('academico', 'cultural', 'deportivo'));

-- Verificación final
SELECT 
    'Migración completada exitosamente!' as mensaje,
    COUNT(*) as total_eventos,
    COUNT(DISTINCT event_type) as tipos_diferentes
FROM events;

-- Ver distribución por tipo
SELECT 
    event_type,
    COUNT(*) as cantidad
FROM events
GROUP BY event_type
ORDER BY event_type;

