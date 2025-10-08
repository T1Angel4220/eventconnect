-- Script para insertar usuario administrador
-- Ejecutar este script si necesitas crear solo el usuario admin

-- Verificar si el usuario admin ya existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@eventconnect.com') THEN
        INSERT INTO users (first_name, last_name, email, password, role)
        VALUES (
            'Admin', 
            'Admin', 
            'admin@eventconnect.com', 
            '$2b$10$LR4X0.IhJFhY1v4YGsW1GO58aYLHdm5MsQzD9kxPWVvHt40Wuhhu2', 
            'admin'
        );
        RAISE NOTICE 'Usuario admin creado exitosamente';
    ELSE
        RAISE NOTICE 'El usuario admin ya existe';
    END IF;
END $$;

-- Verificar la creación
SELECT 
    user_id,
    first_name,
    last_name,
    email,
    role,
    created_at
FROM users 
WHERE email = 'admin@eventconnect.com';
