-- ==============================
-- MIGRACIÓN SEGURA PARA AGREGAR CAMPOS DE IMAGEN
-- Para usuarios que ya tienen la base de datos sin campos de imagen
-- ==============================

-- 1. Verificar y agregar campo de imagen de perfil a usuarios (OPCIONAL)
DO $$ 
BEGIN
    -- Verificar si la columna ya existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'profile_image'
        AND table_schema = 'public'
    ) THEN
        -- Agregar la columna si no existe
        ALTER TABLE users ADD COLUMN profile_image VARCHAR(500);
        RAISE NOTICE 'Columna profile_image agregada a la tabla users';
    ELSE
        RAISE NOTICE 'Columna profile_image ya existe en la tabla users';
    END IF;
END $$;

-- 2. Verificar y agregar campo de imagen de eventos (OBLIGATORIO)
DO $$ 
BEGIN
    -- Verificar si la columna ya existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'event_image'
        AND table_schema = 'public'
    ) THEN
        -- Agregar la columna con valor por defecto
        ALTER TABLE events ADD COLUMN event_image VARCHAR(500) NOT NULL DEFAULT '/uploads/events/default-event.jpg';
        RAISE NOTICE 'Columna event_image agregada a la tabla events';
        
        -- Cambiar el tipo a TEXT para soportar URLs más largas
        ALTER TABLE events ALTER COLUMN event_image TYPE TEXT;
        RAISE NOTICE 'Tipo de columna event_image cambiado a TEXT';
    ELSE
        RAISE NOTICE 'Columna event_image ya existe en la tabla events';
        
        -- Si ya existe, verificar si es VARCHAR y cambiarla a TEXT si es necesario
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'events' 
            AND column_name = 'event_image'
            AND data_type = 'character varying'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE events ALTER COLUMN event_image TYPE TEXT;
            RAISE NOTICE 'Tipo de columna event_image actualizado a TEXT';
        END IF;
    END IF;
END $$;

-- 3. Limpiar URLs blob existentes (si las hay)
UPDATE events 
SET event_image = '/uploads/events/default-event.jpg' 
WHERE event_image LIKE 'blob:%' 
   OR event_image IS NULL 
   OR event_image = '';

-- 4. Verificar el resultado
SELECT 
    'users' as tabla,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profile_image') 
        THEN 'profile_image: ✅ Existe' 
        ELSE 'profile_image: ❌ No existe' 
    END as estado
UNION ALL
SELECT 
    'events' as tabla,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_image') 
        THEN 'event_image: ✅ Existe' 
        ELSE 'event_image: ❌ No existe' 
    END as estado;

-- 5. Mostrar información de las columnas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('users', 'events') 
  AND column_name IN ('profile_image', 'event_image')
ORDER BY table_name, column_name;

-- 6. Verificar eventos existentes
SELECT 
    COUNT(*) as total_eventos,
    COUNT(CASE WHEN event_image IS NOT NULL THEN 1 END) as con_imagen,
    COUNT(CASE WHEN event_image = '/uploads/events/default-event.jpg' THEN 1 END) as imagen_por_defecto
FROM events;

