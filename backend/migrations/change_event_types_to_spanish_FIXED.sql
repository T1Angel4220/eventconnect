-- ==============================
-- MIGRACIÓN: Cambiar event_type de inglés a español
-- ==============================
-- Fecha: 2025-01-23
-- Descripción: Cambia los valores de event_type de 'academic', 'cultural', 'sports'
--              a 'academico', 'cultural', 'deportivo' (en español)
-- ==============================
-- INSTRUCCIONES PARA pgAdmin:
-- 1. Asegúrate de estar conectado a la base de datos "eventconnect"
-- 2. Selecciona TODO este script
-- 3. Presiona F5 o el botón ▶️ para ejecutar
-- ==============================

-- PASO 1: PRIMERO eliminamos el constraint viejo para poder actualizar los datos
ALTER TABLE events 
DROP CONSTRAINT IF EXISTS events_event_type_check;

-- PASO 2: AHORA SÍ actualizamos todos los eventos existentes
UPDATE events 
SET event_type = CASE 
    WHEN event_type = 'academic' THEN 'academico'
    WHEN event_type = 'sports' THEN 'deportivo'
    ELSE event_type  -- 'cultural' se mantiene igual
END
WHERE event_type IN ('academic', 'sports');

-- PASO 3: Verificar cuántos eventos se actualizaron
SELECT 
    'Eventos actualizados:' as paso,
    event_type, 
    COUNT(*) as cantidad 
FROM events 
GROUP BY event_type
ORDER BY event_type;

-- PASO 4: Agregar el nuevo constraint con valores en español
ALTER TABLE events 
ADD CONSTRAINT events_event_type_check 
CHECK (event_type IN ('academico', 'cultural', 'deportivo'));

-- PASO 5: Verificación final
SELECT 
    '✅ Migración completada exitosamente!' as resultado,
    COUNT(*) as total_eventos,
    COUNT(DISTINCT event_type) as tipos_diferentes
FROM events;

-- PASO 6: Ver distribución final por tipo
SELECT 
    '📊 Distribución de eventos por tipo:' as resumen,
    event_type,
    COUNT(*) as cantidad
FROM events
GROUP BY event_type
ORDER BY event_type;



