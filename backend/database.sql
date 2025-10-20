DROP DATABASE IF EXISTS eventconnect;
CREATE DATABASE eventconnect;
\c eventconnect;

-- Users table
CREATE TABLE users (
user_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
first_name VARCHAR(100) NOT NULL,
last_name VARCHAR(100) NOT NULL,
email VARCHAR(150) UNIQUE NOT NULL,
password VARCHAR(200) NOT NULL,
role VARCHAR(50) CHECK (role IN ('participant', 'organizer', 'admin')) NOT NULL,
profile_image VARCHAR(500), -- URL o path de la imagen de perfil
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
event_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
title VARCHAR(200) NOT NULL,
description TEXT,
event_date TIMESTAMP NOT NULL,
duration INT CHECK (duration > 0) NOT NULL, -- Duration in minutes
status VARCHAR(50) CHECK (status IN ('upcoming', 'in_progress', 'completed')) DEFAULT 'upcoming',
location VARCHAR(200),
event_type VARCHAR(50) CHECK (event_type IN ('academico', 'cultural', 'deportivo')) NOT NULL,
capacity INT CHECK (capacity > 0),
organizer_id INT NOT NULL,
event_image TEXT NOT NULL, -- URL o path de la imagen del evento (OBLIGATORIA) - TEXT para soportar base64
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (organizer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Registrations table
CREATE TABLE registrations (
registration_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
user_id INT NOT NULL,
event_id INT NOT NULL,
registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
status VARCHAR(50) CHECK (status IN ('registered', 'canceled')) DEFAULT 'registered',
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
UNIQUE(user_id, event_id)
);

-- Notifications table
CREATE TABLE notifications (
notification_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
user_id INT NOT NULL,
message TEXT NOT NULL,
sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
status VARCHAR(50) CHECK (status IN ('sent', 'pending', 'read')) DEFAULT 'pending',
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Password reset codes table
CREATE TABLE password_reset_codes (
reset_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
user_id INT NOT NULL,
code VARCHAR(6) NOT NULL,
expires_at TIMESTAMP NOT NULL,
used BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- User push tokens table for Expo notifications
CREATE TABLE user_push_tokens (
token_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
user_id INT NOT NULL,
expo_push_token VARCHAR(200) NOT NULL,
device_id VARCHAR(100), -- Identificador único del dispositivo
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Índices para optimizar consultas de tokens push
CREATE INDEX idx_user_push_tokens_user ON user_push_tokens(user_id);
CREATE UNIQUE INDEX idx_user_push_tokens_user_device ON user_push_tokens(user_id, device_id) WHERE device_id IS NOT NULL;



-- ==============================
-- MIGRACIÓN SEGURA PARA USUARIOS EXISTENTES
-- ==============================

-- 1. Agregar campo de imagen de perfil a usuarios (OPCIONAL)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'profile_image') THEN
        ALTER TABLE users ADD COLUMN profile_image VARCHAR(500);
    END IF;
END $$;

-- 3. Crear tabla de push tokens si no existe (MIGRACIÓN SEGURA)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_push_tokens') THEN
        CREATE TABLE user_push_tokens (
            token_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            user_id INT NOT NULL,
            expo_push_token VARCHAR(200) NOT NULL,
            device_id VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        );
        
        -- Crear índices solo si la tabla se creó
        CREATE INDEX idx_user_push_tokens_user ON user_push_tokens(user_id);
        CREATE UNIQUE INDEX idx_user_push_tokens_user_device ON user_push_tokens(user_id, device_id) WHERE device_id IS NOT NULL;
        
        RAISE NOTICE 'Tabla user_push_tokens creada con índices';
    ELSE
        RAISE NOTICE 'Tabla user_push_tokens ya existe';
    END IF;
END $$;

-- 2. Agregar campo de imagen de eventos (OBLIGATORIO)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'event_image') THEN
        -- Si la columna no existe, agregar como TEXT con valor por defecto
        ALTER TABLE events ADD COLUMN event_image TEXT NOT NULL DEFAULT '/uploads/events/default-event.jpg';
        
        -- Si la columna existe pero no es TEXT, cambiar el tipo
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'events' AND column_name = 'event_image' AND data_type <> 'text'
        ) THEN
            ALTER TABLE events ALTER COLUMN event_image TYPE TEXT;
        END IF;
        -- Si la columna existe pero no tiene default, agregarlo
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'events' AND column_name = 'event_image' AND column_default IS NOT NULL
        ) THEN
            ALTER TABLE events ALTER COLUMN event_image SET DEFAULT '/uploads/events/default-event.jpg';
        END IF;
    END IF;
END $$;

-- ==============================
-- LIMPIAR URLs BLOB DE LA BASE DE DATOS
-- ==============================
-- Actualizar todos los eventos que tengan URLs blob con imagen por defecto
UPDATE events 
SET event_image = '/uploads/events/default-event.jpg' 
WHERE event_image LIKE 'blob:%';

-- Verificar cuántos eventos se actualizaron
SELECT COUNT(*) as eventos_actualizados 
FROM events 
WHERE event_image = '/uploads/events/default-event.jpg';

-- ==============================
-- Insert sample users
-- ==============================
INSERT INTO users (first_name, last_name, email, password, role)
VALUES
('Admin', 'Johnson', 'admin@eventconnect.com', '$2b$10$LR4X0.IhJFhY1v4YGsW1GO58aYLHdm5MsQzD9kxPWVvHt40Wuhhu2', 'admin'), -- Contraseña: Admin123
('Organizador', 'Smith', 'organizer@eventconnect.com', '$2b$10$Ev..m0X4g8bqgJ2wyFDDDOVH0tDiX5PZ0RrDb7RV8k/8.SudESFCi', 'organizer'); -- Contraseña: organizer123
