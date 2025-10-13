-- ==============================
-- INSERTS DE EVENTOS Y REGISTRACIONES
-- Usando los IDs correctos de la base de datos existente
-- ==============================
-- IDs de Organizadores:
-- 32: Angell Ayuquina
-- 33: Admin
-- 34: María García
-- 35: Carlos Rodríguez
-- 36: Ana Martínez
-- 37: Luis Hernández
-- 38: Elena López
-- IDs de Participantes:
-- 30: Angel Ayuquina
-- 39: Pedro Sánchez
-- 40: Laura Fernández
-- 41: Diego Torres
-- 42: Carmen Ramírez
-- 43: Miguel Flores
-- 44: Sofía Morales
-- 45: Javier Jiménez
-- 46: Isabella Ruiz
-- 47: Andrés Díaz
-- 48: Valentina Castro
-- 49: Roberto Vargas
-- 50: Patricia Ortiz
-- ==============================
-- EVENTOS ACADÉMICOS
-- ==============================
INSERT INTO
    events (
        title,
        description,
        event_date,
        duration,
        status,
        location,
        event_type,
        capacity,
        organizer_id,
        event_image
    )
VALUES
    -- Eventos organizados por Angell Ayuquina (user_id: 32)
    (
        'Conferencia de Inteligencia Artificial',
        'Conferencia sobre los últimos avances en IA y Machine Learning aplicados a la industria.',
        '2025-11-15 09:00:00',
        180,
        'upcoming',
        'Auditorio Principal - Campus Norte',
        'academic',
        150,
        32,
        '/uploads/events/default-event.jpg'
    ),
    (
        'Taller de Desarrollo Web Moderno',
        'Aprende las últimas tecnologías: React, Node.js, TypeScript y más.',
        '2025-11-20 14:00:00',
        240,
        'upcoming',
        'Laboratorio de Computación 3',
        'academic',
        40,
        32,
        '/uploads/events/default-event.jpg'
    ),
    -- Eventos organizados por María García (user_id: 34)
    (
        'Seminario de Ciberseguridad',
        'Protección de datos, ethical hacking y mejores prácticas de seguridad informática.',
        '2025-11-22 10:00:00',
        120,
        'upcoming',
        'Sala de Conferencias A',
        'academic',
        80,
        34,
        '/uploads/events/default-event.jpg'
    ),
    (
        'Workshop de Ciencia de Datos',
        'Análisis de datos con Python, Pandas y visualización con Matplotlib.',
        '2025-12-01 15:00:00',
        180,
        'upcoming',
        'Laboratorio de Computación 1',
        'academic',
        35,
        34,
        '/uploads/events/default-event.jpg'
    ),
    -- Eventos organizados por Carlos Rodríguez (user_id: 35)
    (
        'Hackathon Universitario 2025',
        'Competencia de programación de 24 horas. Premios para los mejores proyectos.',
        '2025-11-25 08:00:00',
        1440,
        'upcoming',
        'Centro de Innovación Tecnológica',
        'academic',
        100,
        35,
        '/uploads/events/default-event.jpg'
    ),
    (
        'Charla: Emprendimiento Tecnológico',
        'Experiencias de founders exitosos en startups tecnológicas.',
        '2025-12-05 16:00:00',
        90,
        'upcoming',
        'Auditorio Principal - Campus Sur',
        'academic',
        200,
        35,
        '/uploads/events/default-event.jpg'
    );

-- ==============================
-- EVENTOS CULTURALES
-- ==============================
INSERT INTO
    events (
        title,
        description,
        event_date,
        duration,
        status,
        location,
        event_type,
        capacity,
        organizer_id,
        event_image
    )
VALUES
    -- Eventos organizados por Ana Martínez (user_id: 36)
    (
        'Festival de Música Universitaria',
        'Conciertos de bandas estudiantiles y artistas invitados. Entrada libre.',
        '2025-11-18 18:00:00',
        240,
        'upcoming',
        'Plaza Central del Campus',
        'cultural',
        500,
        36,
        '/uploads/events/default-event.jpg'
    ),
    (
        'Exposición de Arte Contemporáneo',
        'Obras de estudiantes de la Facultad de Bellas Artes y artistas locales.',
        '2025-11-28 11:00:00',
        300,
        'upcoming',
        'Galería de Arte Universitaria',
        'cultural',
        120,
        36,
        '/uploads/events/default-event.jpg'
    ),
    (
        'Noche de Cine al Aire Libre',
        'Proyección de películas clásicas bajo las estrellas con entrada gratuita.',
        '2025-12-07 19:00:00',
        150,
        'upcoming',
        'Jardines del Campus',
        'cultural',
        300,
        36,
        '/uploads/events/default-event.jpg'
    ),
    -- Eventos organizados por Luis Hernández (user_id: 37)
    (
        'Teatro Universitario: Hamlet',
        'Presentación de la obra clásica de Shakespeare por el grupo de teatro estudiantil.',
        '2025-11-30 20:00:00',
        120,
        'upcoming',
        'Teatro Universitario',
        'cultural',
        180,
        37,
        '/uploads/events/default-event.jpg'
    ),
    (
        'Concurso de Fotografía Estudiantil',
        'Exposición y premiación de las mejores fotografías tomadas por estudiantes.',
        '2025-12-10 17:00:00',
        90,
        'upcoming',
        'Centro Cultural',
        'cultural',
        100,
        37,
        '/uploads/events/default-event.jpg'
    );

-- ==============================
-- EVENTOS DEPORTIVOS
-- ==============================
INSERT INTO
    events (
        title,
        description,
        event_date,
        duration,
        status,
        location,
        event_type,
        capacity,
        organizer_id,
        event_image
    )
VALUES
    -- Eventos organizados por Elena López (user_id: 38)
    (
        'Torneo de Fútbol Interfacultades',
        'Competencia deportiva entre las diferentes facultades de la universidad.',
        '2025-11-17 08:00:00',
        480,
        'upcoming',
        'Estadio Universitario',
        'sports',
        300,
        38,
        '/uploads/events/default-event.jpg'
    ),
    (
        'Maratón Universitaria 5K',
        'Carrera de 5 kilómetros abierta a toda la comunidad universitaria.',
        '2025-11-24 07:00:00',
        120,
        'upcoming',
        'Campus Universitario - Circuito Atlético',
        'sports',
        250,
        38,
        '/uploads/events/default-event.jpg'
    ),
    (
        'Torneo de Ajedrez Relámpago',
        'Competencia de ajedrez rápido con partidas de 10 minutos.',
        '2025-12-03 14:00:00',
        180,
        'upcoming',
        'Sala Polivalente',
        'sports',
        60,
        38,
        '/uploads/events/default-event.jpg'
    ),
    -- Eventos organizados por María García (user_id: 34)
    (
        'Clase Abierta de Yoga',
        'Sesión de yoga para principiantes, trae tu mat o toalla.',
        '2025-12-08 06:30:00',
        90,
        'upcoming',
        'Gimnasio Universitario',
        'sports',
        40,
        34,
        '/uploads/events/default-event.jpg'
    ),
    (
        'Torneo de Voleibol Playa',
        'Competencia de voleibol en las canchas de arena del campus.',
        '2025-12-12 15:00:00',
        240,
        'upcoming',
        'Canchas de Voleibol Playa',
        'sports',
        80,
        34,
        '/uploads/events/default-event.jpg'
    );

-- ==============================
-- REGISTRACIONES DE USUARIOS A EVENTOS
-- ==============================
-- Nota: Estos IDs de evento asumen que la tabla events está vacía
-- Si ya hay eventos, los IDs comenzarán desde el siguiente disponible
-- Primero, obtener los IDs de eventos que acabamos de insertar
-- Para este script, asumimos que los eventos tienen IDs del 1 al 16
-- Registraciones para Conferencia de IA (primer evento insertado)
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (
        39,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Conferencia de Inteligencia Artificial'
        ),
        'registered'
    ),
    -- Pedro
    (
        40,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Conferencia de Inteligencia Artificial'
        ),
        'registered'
    ),
    -- Laura
    (
        41,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Conferencia de Inteligencia Artificial'
        ),
        'registered'
    ),
    -- Diego
    (
        42,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Conferencia de Inteligencia Artificial'
        ),
        'registered'
    ),
    -- Carmen
    (
        46,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Conferencia de Inteligencia Artificial'
        ),
        'registered'
    ),
    -- Isabella
    (
        47,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Conferencia de Inteligencia Artificial'
        ),
        'registered'
    );

-- Andrés
-- Registraciones para Taller de Desarrollo Web
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (
        39,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Taller de Desarrollo Web Moderno'
        ),
        'registered'
    ),
    -- Pedro
    (
        41,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Taller de Desarrollo Web Moderno'
        ),
        'registered'
    ),
    -- Diego
    (
        43,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Taller de Desarrollo Web Moderno'
        ),
        'registered'
    ),
    -- Miguel
    (
        45,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Taller de Desarrollo Web Moderno'
        ),
        'registered'
    ),
    -- Javier
    (
        47,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Taller de Desarrollo Web Moderno'
        ),
        'registered'
    ),
    -- Andrés
    (
        48,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Taller de Desarrollo Web Moderno'
        ),
        'registered'
    );

-- Valentina
-- Registraciones para Seminario de Ciberseguridad
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (
        40,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Seminario de Ciberseguridad'
        ),
        'registered'
    ),
    -- Laura
    (
        42,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Seminario de Ciberseguridad'
        ),
        'registered'
    ),
    -- Carmen
    (
        44,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Seminario de Ciberseguridad'
        ),
        'registered'
    ),
    -- Sofía
    (
        46,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Seminario de Ciberseguridad'
        ),
        'registered'
    ),
    -- Isabella
    (
        47,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Seminario de Ciberseguridad'
        ),
        'registered'
    ),
    -- Andrés
    (
        49,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Seminario de Ciberseguridad'
        ),
        'registered'
    );

-- Roberto
-- Registraciones para Workshop de Ciencia de Datos
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (
        39,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Workshop de Ciencia de Datos'
        ),
        'registered'
    ),
    -- Pedro
    (
        40,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Workshop de Ciencia de Datos'
        ),
        'registered'
    ),
    -- Laura
    (
        43,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Workshop de Ciencia de Datos'
        ),
        'registered'
    ),
    -- Miguel
    (
        45,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Workshop de Ciencia de Datos'
        ),
        'registered'
    ),
    -- Javier
    (
        47,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Workshop de Ciencia de Datos'
        ),
        'registered'
    );

-- Andrés
-- Registraciones para Hackathon
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (
        39,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Hackathon Universitario 2025'
        ),
        'registered'
    ),
    -- Pedro
    (
        41,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Hackathon Universitario 2025'
        ),
        'registered'
    ),
    -- Diego
    (
        43,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Hackathon Universitario 2025'
        ),
        'registered'
    ),
    -- Miguel
    (
        45,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Hackathon Universitario 2025'
        ),
        'registered'
    ),
    -- Javier
    (
        46,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Hackathon Universitario 2025'
        ),
        'registered'
    ),
    -- Isabella
    (
        47,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Hackathon Universitario 2025'
        ),
        'registered'
    ),
    -- Andrés
    (
        48,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Hackathon Universitario 2025'
        ),
        'registered'
    ),
    -- Valentina
    (
        49,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Hackathon Universitario 2025'
        ),
        'registered'
    );

-- Roberto
-- Registraciones para Charla de Emprendimiento
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (
        40,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Charla: Emprendimiento Tecnológico'
        ),
        'registered'
    ),
    -- Laura
    (
        42,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Charla: Emprendimiento Tecnológico'
        ),
        'registered'
    ),
    -- Carmen
    (
        44,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Charla: Emprendimiento Tecnológico'
        ),
        'registered'
    ),
    -- Sofía
    (
        46,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Charla: Emprendimiento Tecnológico'
        ),
        'registered'
    ),
    -- Isabella
    (
        47,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Charla: Emprendimiento Tecnológico'
        ),
        'registered'
    ),
    -- Andrés
    (
        49,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Charla: Emprendimiento Tecnológico'
        ),
        'registered'
    );

-- Roberto
-- Registraciones para Festival de Música
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (
        30,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Festival de Música Universitaria'
        ),
        'registered'
    ),
    -- Angel
    (
        39,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Festival de Música Universitaria'
        ),
        'registered'
    ),
    -- Pedro
    (
        40,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Festival de Música Universitaria'
        ),
        'registered'
    ),
    -- Laura
    (
        41,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Festival de Música Universitaria'
        ),
        'registered'
    ),
    -- Diego
    (
        42,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Festival de Música Universitaria'
        ),
        'registered'
    ),
    -- Carmen
    (
        43,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Festival de Música Universitaria'
        ),
        'registered'
    ),
    -- Miguel
    (
        44,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Festival de Música Universitaria'
        ),
        'registered'
    ),
    -- Sofía
    (
        45,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Festival de Música Universitaria'
        ),
        'registered'
    ),
    -- Javier
    (
        46,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Festival de Música Universitaria'
        ),
        'registered'
    ),
    -- Isabella
    (
        47,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Festival de Música Universitaria'
        ),
        'registered'
    ),
    -- Andrés
    (
        48,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Festival de Música Universitaria'
        ),
        'registered'
    ),
    -- Valentina
    (
        49,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Festival de Música Universitaria'
        ),
        'registered'
    );

-- Roberto
-- Registraciones para Exposición de Arte
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (
        40,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Exposición de Arte Contemporáneo'
        ),
        'registered'
    ),
    -- Laura
    (
        42,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Exposición de Arte Contemporáneo'
        ),
        'registered'
    ),
    -- Carmen
    (
        44,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Exposición de Arte Contemporáneo'
        ),
        'registered'
    ),
    -- Sofía
    (
        46,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Exposición de Arte Contemporáneo'
        ),
        'registered'
    ),
    -- Isabella
    (
        50,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Exposición de Arte Contemporáneo'
        ),
        'registered'
    );

-- Patricia
-- Registraciones para Cine al Aire Libre
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (
        39,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Noche de Cine al Aire Libre'
        ),
        'registered'
    ),
    -- Pedro
    (
        41,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Noche de Cine al Aire Libre'
        ),
        'registered'
    ),
    -- Diego
    (
        43,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Noche de Cine al Aire Libre'
        ),
        'registered'
    ),
    -- Miguel
    (
        45,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Noche de Cine al Aire Libre'
        ),
        'registered'
    ),
    -- Javier
    (
        47,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Noche de Cine al Aire Libre'
        ),
        'registered'
    ),
    -- Andrés
    (
        48,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Noche de Cine al Aire Libre'
        ),
        'registered'
    ),
    -- Valentina
    (
        49,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Noche de Cine al Aire Libre'
        ),
        'registered'
    );

-- Roberto
-- Registraciones para Teatro Hamlet
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (
        40,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Teatro Universitario: Hamlet'
        ),
        'registered'
    ),
    -- Laura
    (
        42,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Teatro Universitario: Hamlet'
        ),
        'registered'
    ),
    -- Carmen
    (
        44,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Teatro Universitario: Hamlet'
        ),
        'registered'
    ),
    -- Sofía
    (
        46,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Teatro Universitario: Hamlet'
        ),
        'registered'
    ),
    -- Isabella
    (
        47,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Teatro Universitario: Hamlet'
        ),
        'registered'
    ),
    -- Andrés
    (
        50,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Teatro Universitario: Hamlet'
        ),
        'registered'
    );

-- Patricia
-- Registraciones para Concurso de Fotografía
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (
        39,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Concurso de Fotografía Estudiantil'
        ),
        'registered'
    ),
    -- Pedro
    (
        41,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Concurso de Fotografía Estudiantil'
        ),
        'registered'
    ),
    -- Diego
    (
        43,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Concurso de Fotografía Estudiantil'
        ),
        'registered'
    ),
    -- Miguel
    (
        45,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Concurso de Fotografía Estudiantil'
        ),
        'registered'
    );

-- Javier
-- Registraciones para Torneo de Fútbol
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (
        39,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Torneo de Fútbol Interfacultades'
        ),
        'registered'
    ),
    -- Pedro
    (
        41,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Torneo de Fútbol Interfacultades'
        ),
        'registered'
    ),
    -- Diego
    (
        43,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Torneo de Fútbol Interfacultades'
        ),
        'registered'
    ),
    -- Miguel
    (
        45,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Torneo de Fútbol Interfacultades'
        ),
        'registered'
    ),
    -- Javier
    (
        47,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Torneo de Fútbol Interfacultades'
        ),
        'registered'
    ),
    -- Andrés
    (
        48,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Torneo de Fútbol Interfacultades'
        ),
        'registered'
    ),
    -- Valentina
    (
        49,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Torneo de Fútbol Interfacultades'
        ),
        'registered'
    );

-- Roberto
-- Registraciones para Maratón 5K
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (
        30,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Maratón Universitaria 5K'
        ),
        'registered'
    ),
    -- Angel
    (
        39,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Maratón Universitaria 5K'
        ),
        'registered'
    ),
    -- Pedro
    (
        40,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Maratón Universitaria 5K'
        ),
        'registered'
    ),
    -- Laura
    (
        41,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Maratón Universitaria 5K'
        ),
        'registered'
    ),
    -- Diego
    (
        42,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Maratón Universitaria 5K'
        ),
        'registered'
    ),
    -- Carmen
    (
        43,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Maratón Universitaria 5K'
        ),
        'registered'
    ),
    -- Miguel
    (
        44,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Maratón Universitaria 5K'
        ),
        'registered'
    ),
    -- Sofía
    (
        45,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Maratón Universitaria 5K'
        ),
        'registered'
    ),
    -- Javier
    (
        46,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Maratón Universitaria 5K'
        ),
        'registered'
    );

-- Isabella
-- Registraciones para Torneo de Ajedrez
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (
        40,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Torneo de Ajedrez Relámpago'
        ),
        'registered'
    ),
    -- Laura
    (
        42,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Torneo de Ajedrez Relámpago'
        ),
        'registered'
    ),
    -- Carmen
    (
        44,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Torneo de Ajedrez Relámpago'
        ),
        'registered'
    ),
    -- Sofía
    (
        46,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Torneo de Ajedrez Relámpago'
        ),
        'registered'
    ),
    -- Isabella
    (
        50,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Torneo de Ajedrez Relámpago'
        ),
        'registered'
    );

-- Patricia
-- Registraciones para Clase de Yoga
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (
        40,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Clase Abierta de Yoga'
        ),
        'registered'
    ),
    -- Laura
    (
        42,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Clase Abierta de Yoga'
        ),
        'registered'
    ),
    -- Carmen
    (
        44,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Clase Abierta de Yoga'
        ),
        'registered'
    ),
    -- Sofía
    (
        46,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Clase Abierta de Yoga'
        ),
        'registered'
    ),
    -- Isabella
    (
        48,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Clase Abierta de Yoga'
        ),
        'registered'
    ),
    -- Valentina
    (
        50,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Clase Abierta de Yoga'
        ),
        'registered'
    );

-- Patricia
-- Registraciones para Torneo de Voleibol
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (
        39,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Torneo de Voleibol Playa'
        ),
        'registered'
    ),
    -- Pedro
    (
        41,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Torneo de Voleibol Playa'
        ),
        'registered'
    ),
    -- Diego
    (
        43,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Torneo de Voleibol Playa'
        ),
        'registered'
    ),
    -- Miguel
    (
        45,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Torneo de Voleibol Playa'
        ),
        'registered'
    ),
    -- Javier
    (
        47,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Torneo de Voleibol Playa'
        ),
        'registered'
    ),
    -- Andrés
    (
        48,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Torneo de Voleibol Playa'
        ),
        'registered'
    );

-- Valentina
-- Algunos registros cancelados para variedad
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (
        50,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Taller de Desarrollo Web Moderno'
        ),
        'canceled'
    ),
    -- Patricia canceló
    (
        49,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Festival de Música Universitaria'
        ),
        'canceled'
    ),
    -- Roberto canceló
    (
        44,
        (
            SELECT
                event_id
            FROM
                events
            WHERE
                title = 'Torneo de Fútbol Interfacultades'
        ),
        'canceled'
    );

-- Sofía canceló
-- ==============================
-- VERIFICACIÓN DE DATOS
-- ==============================
-- Ver total de eventos por tipo
SELECT
    event_type,
    COUNT(*) as total
FROM
    events
GROUP BY
    event_type
ORDER BY
    total DESC;

-- Ver total de registraciones por estado
SELECT
    status,
    COUNT(*) as total
FROM
    registrations
GROUP BY
    status
ORDER BY
    total DESC;

-- Ver eventos con más registraciones
SELECT
    e.title,
    e.event_type,
    COUNT(r.registration_id) as total_registros
FROM
    events e
    LEFT JOIN registrations r ON e.event_id = r.event_id
    AND r.status = 'registered'
GROUP BY
    e.event_id,
    e.title,
    e.event_type
ORDER BY
    total_registros DESC
LIMIT
    10;

-- Ver usuarios participantes con más registraciones
SELECT
    u.first_name,
    u.last_name,
    u.email,
    COUNT(r.registration_id) as eventos_inscritos
FROM
    users u
    LEFT JOIN registrations r ON u.user_id = r.user_id
    AND r.status = 'registered'
WHERE
    u.role = 'participant'
GROUP BY
    u.user_id,
    u.first_name,
    u.last_name,
    u.email
ORDER BY
    eventos_inscritos DESC
LIMIT
    10;

-- Ver organizadores y cuántos eventos han creado
SELECT
    u.first_name,
    u.last_name,
    u.email,
    COUNT(e.event_id) as eventos_organizados
FROM
    users u
    LEFT JOIN events e ON u.user_id = e.organizer_id
WHERE
    u.role = 'organizer'
GROUP BY
    u.user_id,
    u.first_name,
    u.last_name,
    u.email
ORDER BY
    eventos_organizados DESC;