-- ==============================
-- SCRIPT DE VERIFICACIÓN PARA CAMPOS DE IMAGEN
-- Ejecutar después de la migración para verificar que todo esté correcto
-- ==============================

-- 1. Verificar estructura de tablas
SELECT 
    'ESTRUCTURA DE TABLAS' as seccion,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('users', 'events') 
  AND column_name IN ('profile_image', 'event_image')
ORDER BY table_name, column_name;

-- 2. Verificar usuarios
SELECT 
    'USUARIOS' as seccion,
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN profile_image IS NOT NULL THEN 1 END) as con_imagen_perfil,
    COUNT(CASE WHEN profile_image IS NULL THEN 1 END) as sin_imagen_perfil
FROM users;

-- 3. Verificar eventos
SELECT 
    'EVENTOS' as seccion,
    COUNT(*) as total_eventos,
    COUNT(CASE WHEN event_image IS NOT NULL THEN 1 END) as con_imagen,
    COUNT(CASE WHEN event_image = '/uploads/events/default-event.jpg' THEN 1 END) as imagen_por_defecto,
    COUNT(CASE WHEN event_image LIKE 'blob:%' THEN 1 END) as urls_blob,
    COUNT(CASE WHEN event_image LIKE '/uploads/events/%' THEN 1 END) as urls_permanentes
FROM events;

-- 4. Mostrar algunos eventos de ejemplo
SELECT 
    'EJEMPLOS DE EVENTOS' as seccion,
    event_id,
    title,
    event_image,
    CASE 
        WHEN event_image LIKE 'blob:%' THEN '⚠️ URL Blob (temporal)'
        WHEN event_image = '/uploads/events/default-event.jpg' THEN '✅ Imagen por defecto'
        WHEN event_image LIKE '/uploads/events/%' THEN '✅ URL permanente'
        ELSE '❓ Otro tipo'
    END as tipo_imagen
FROM events 
ORDER BY event_id 
LIMIT 10;

-- 5. Verificar que no hay URLs blob
SELECT 
    'LIMPIEZA DE URLs BLOB' as seccion,
    CASE 
        WHEN COUNT(CASE WHEN event_image LIKE 'blob:%' THEN 1 END) = 0 
        THEN '✅ No hay URLs blob'
        ELSE '⚠️ Aún hay URLs blob: ' || COUNT(CASE WHEN event_image LIKE 'blob:%' THEN 1 END)
    END as estado_blob
FROM events;

-- 6. Resumen final
SELECT 
    'RESUMEN FINAL' as seccion,
    'Tabla users: ' || 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profile_image') 
         THEN '✅ profile_image existe' 
         ELSE '❌ profile_image NO existe' 
    END as estado_users,
    'Tabla events: ' || 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'event_image') 
         THEN '✅ event_image existe' 
         ELSE '❌ event_image NO existe' 
    END as estado_events;

