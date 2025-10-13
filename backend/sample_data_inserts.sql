-- ==============================
-- INSERTS DE DATOS DE EJEMPLO PARA EVENTCONNECT
-- ==============================
-- ==============================
-- USUARIOS ORGANIZADORES
-- ==============================
-- Nota: Las contraseñas están hasheadas con bcrypt
-- Contraseña para todos los organizadores: Org123456
INSERT INTO
    users (first_name, last_name, email, password, role)
VALUES
    (
        'María',
        'García',
        'maria.garcia@eventconnect.com',
        '$2b$10$8Z5QqXKJ9vXJ5h.OxQm1/.yGxVX5qZJ9KqZQqXKJ9vXJ5h.OxQm12',
        'organizer'
    ),
    (
        'Carlos',
        'Rodríguez',
        'carlos.rodriguez@eventconnect.com',
        '$2b$10$8Z5QqXKJ9vXJ5h.OxQm1/.yGxVX5qZJ9KqZQqXKJ9vXJ5h.OxQm12',
        'organizer'
    ),
    (
        'Ana',
        'Martínez',
        'ana.martinez@eventconnect.com',
        '$2b$10$8Z5QqXKJ9vXJ5h.OxQm1/.yGxVX5qZJ9KqZQqXKJ9vXJ5h.OxQm12',
        'organizer'
    ),
    (
        'Luis',
        'Hernández',
        'luis.hernandez@eventconnect.com',
        '$2b$10$8Z5QqXKJ9vXJ5h.OxQm1/.yGxVX5qZJ9KqZQqXKJ9vXJ5h.OxQm12',
        'organizer'
    ),
    (
        'Elena',
        'López',
        'elena.lopez@eventconnect.com',
        '$2b$10$8Z5QqXKJ9vXJ5h.OxQm1/.yGxVX5qZJ9KqZQqXKJ9vXJ5h.OxQm12',
        'organizer'
    );

-- ==============================
-- USUARIOS PARTICIPANTES
-- ==============================
-- Contraseña para todos los participantes: User123456
INSERT INTO
    users (first_name, last_name, email, password, role)
VALUES
    (
        'Pedro',
        'Sánchez',
        'pedro.sanchez@student.com',
        '$2b$10$9A6RrYLK0wYK6i.PyRn2/.zHyWY6rAK0LrARrYLK0wYK6i.PyRn23',
        'participant'
    ),
    (
        'Laura',
        'Fernández',
        'laura.fernandez@student.com',
        '$2b$10$9A6RrYLK0wYK6i.PyRn2/.zHyWY6rAK0LrARrYLK0wYK6i.PyRn23',
        'participant'
    ),
    (
        'Diego',
        'Torres',
        'diego.torres@student.com',
        '$2b$10$9A6RrYLK0wYK6i.PyRn2/.zHyWY6rAK0LrARrYLK0wYK6i.PyRn23',
        'participant'
    ),
    (
        'Carmen',
        'Ramírez',
        'carmen.ramirez@student.com',
        '$2b$10$9A6RrYLK0wYK6i.PyRn2/.zHyWY6rAK0LrARrYLK0wYK6i.PyRn23',
        'participant'
    ),
    (
        'Miguel',
        'Flores',
        'miguel.flores@student.com',
        '$2b$10$9A6RrYLK0wYK6i.PyRn2/.zHyWY6rAK0LrARrYLK0wYK6i.PyRn23',
        'participant'
    ),
    (
        'Sofía',
        'Morales',
        'sofia.morales@student.com',
        '$2b$10$9A6RrYLK0wYK6i.PyRn2/.zHyWY6rAK0LrARrYLK0wYK6i.PyRn23',
        'participant'
    ),
    (
        'Javier',
        'Jiménez',
        'javier.jimenez@student.com',
        '$2b$10$9A6RrYLK0wYK6i.PyRn2/.zHyWY6rAK0LrARrYLK0wYK6i.PyRn23',
        'participant'
    ),
    (
        'Isabella',
        'Ruiz',
        'isabella.ruiz@student.com',
        '$2b$10$9A6RrYLK0wYK6i.PyRn2/.zHyWY6rAK0LrARrYLK0wYK6i.PyRn23',
        'participant'
    ),
    (
        'Andrés',
        'Díaz',
        'andres.diaz@student.com',
        '$2b$10$9A6RrYLK0wYK6i.PyRn2/.zHyWY6rAK0LrARrYLK0wYK6i.PyRn23',
        'participant'
    ),
    (
        'Valentina',
        'Castro',
        'valentina.castro@student.com',
        '$2b$10$9A6RrYLK0wYK6i.PyRn2/.zHyWY6rAK0LrARrYLK0wYK6i.PyRn23',
        'participant'
    ),
    (
        'Roberto',
        'Vargas',
        'roberto.vargas@student.com',
        '$2b$10$9A6RrYLK0wYK6i.PyRn2/.zHyWY6rAK0LrARrYLK0wYK6i.PyRn23',
        'participant'
    ),
    (
        'Patricia',
        'Ortiz',
        'patricia.ortiz@student.com',
        '$2b$10$9A6RrYLK0wYK6i.PyRn2/.zHyWY6rAK0LrARrYLK0wYK6i.PyRn23',
        'participant'
    );

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
    -- Eventos organizados por organizer@eventconnect.com (user_id: 2)
    (
        'Conferencia de Inteligencia Artificial',
        'Conferencia sobre los últimos avances en IA y Machine Learning aplicados a la industria.',
        '2025-11-15 09:00:00',
        180,
        'upcoming',
        'Auditorio Principal - Campus Norte',
        'academic',
        150,
        2,
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
        2,
        '/uploads/events/default-event.jpg'
    ),
    -- Eventos organizados por María García (user_id: 3)
    (
        'Seminario de Ciberseguridad',
        'Protección de datos, ethical hacking y mejores prácticas de seguridad informática.',
        '2025-11-22 10:00:00',
        120,
        'upcoming',
        'Sala de Conferencias A',
        'academic',
        80,
        3,
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
        3,
        '/uploads/events/default-event.jpg'
    ),
    -- Eventos organizados por Carlos Rodríguez (user_id: 4)
    (
        'Hackathon Universitario 2025',
        'Competencia de programación de 24 horas. Premios para los mejores proyectos.',
        '2025-11-25 08:00:00',
        1440,
        'upcoming',
        'Centro de Innovación Tecnológica',
        'academic',
        100,
        4,
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
        4,
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
    -- Eventos organizados por Ana Martínez (user_id: 5)
    (
        'Festival de Música Universitaria',
        'Conciertos de bandas estudiantiles y artistas invitados. Entrada libre.',
        '2025-11-18 18:00:00',
        240,
        'upcoming',
        'Plaza Central del Campus',
        'cultural',
        500,
        5,
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
        5,
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
        5,
        '/uploads/events/default-event.jpg'
    ),
    -- Eventos organizados por Luis Hernández (user_id: 6)
    (
        'Teatro Universitario: Hamlet',
        'Presentación de la obra clásica de Shakespeare por el grupo de teatro estudiantil.',
        '2025-11-30 20:00:00',
        120,
        'upcoming',
        'Teatro Universitario',
        'cultural',
        180,
        6,
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
        6,
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
    -- Eventos organizados por Elena López (user_id: 7)
    (
        'Torneo de Fútbol Interfacultades',
        'Competencia deportiva entre las diferentes facultades de la universidad.',
        '2025-11-17 08:00:00',
        480,
        'upcoming',
        'Estadio Universitario',
        'sports',
        300,
        7,
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
        7,
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
        7,
        '/uploads/events/default-event.jpg'
    ),
    -- Eventos organizados por María García (user_id: 3)
    (
        'Clase Abierta de Yoga',
        'Sesión de yoga para principiantes, trae tu mat o toalla.',
        '2025-12-08 06:30:00',
        90,
        'upcoming',
        'Gimnasio Universitario',
        'sports',
        40,
        3,
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
        3,
        '/uploads/events/default-event.jpg'
    );

-- ==============================
-- REGISTRACIONES DE USUARIOS A EVENTOS
-- ==============================
-- Nota: Los user_id de participantes van del 8 al 19
-- Los event_id dependerán de los inserts anteriores (generalmente del 1 al 17)
-- Registraciones para Conferencia de IA (event_id: 1)
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (8, 1, 'registered'),
    -- Pedro
    (9, 1, 'registered'),
    -- Laura
    (10, 1, 'registered'),
    -- Diego
    (11, 1, 'registered'),
    -- Carmen
    (15, 1, 'registered'),
    -- Isabella
    (17, 1, 'registered');

-- Andrés
-- Registraciones para Taller de Desarrollo Web (event_id: 2)
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (8, 2, 'registered'),
    -- Pedro
    (10, 2, 'registered'),
    -- Diego
    (12, 2, 'registered'),
    -- Miguel
    (14, 2, 'registered'),
    -- Javier
    (16, 2, 'registered'),
    -- Andrés
    (18, 2, 'registered');

-- Valentina
-- Registraciones para Seminario de Ciberseguridad (event_id: 3)
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (9, 3, 'registered'),
    -- Laura
    (11, 3, 'registered'),
    -- Carmen
    (13, 3, 'registered'),
    -- Sofía
    (15, 3, 'registered'),
    -- Isabella
    (17, 3, 'registered'),
    -- Andrés
    (19, 3, 'registered');

-- Roberto
-- Registraciones para Workshop de Ciencia de Datos (event_id: 4)
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (8, 4, 'registered'),
    -- Pedro
    (9, 4, 'registered'),
    -- Laura
    (12, 4, 'registered'),
    -- Miguel
    (14, 4, 'registered'),
    -- Javier
    (16, 4, 'registered');

-- Andrés
-- Registraciones para Hackathon (event_id: 5)
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (8, 5, 'registered'),
    -- Pedro
    (10, 5, 'registered'),
    -- Diego
    (12, 5, 'registered'),
    -- Miguel
    (14, 5, 'registered'),
    -- Javier
    (15, 5, 'registered'),
    -- Isabella
    (16, 5, 'registered'),
    -- Andrés
    (18, 5, 'registered'),
    -- Valentina
    (19, 5, 'registered');

-- Roberto
-- Registraciones para Charla de Emprendimiento (event_id: 6)
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (9, 6, 'registered'),
    -- Laura
    (11, 6, 'registered'),
    -- Carmen
    (13, 6, 'registered'),
    -- Sofía
    (15, 6, 'registered'),
    -- Isabella
    (17, 6, 'registered'),
    -- Andrés
    (19, 6, 'registered');

-- Roberto
-- Registraciones para Festival de Música (event_id: 7)
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (8, 7, 'registered'),
    -- Pedro
    (9, 7, 'registered'),
    -- Laura
    (10, 7, 'registered'),
    -- Diego
    (11, 7, 'registered'),
    -- Carmen
    (12, 7, 'registered'),
    -- Miguel
    (13, 7, 'registered'),
    -- Sofía
    (14, 7, 'registered'),
    -- Javier
    (15, 7, 'registered'),
    -- Isabella
    (16, 7, 'registered'),
    -- Andrés
    (17, 7, 'registered'),
    -- Valentina
    (18, 7, 'registered'),
    -- Roberto
    (19, 7, 'registered');

-- Patricia
-- Registraciones para Exposición de Arte (event_id: 8)
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (9, 8, 'registered'),
    -- Laura
    (11, 8, 'registered'),
    -- Carmen
    (13, 8, 'registered'),
    -- Sofía
    (15, 8, 'registered'),
    -- Isabella
    (17, 8, 'registered');

-- Andrés
-- Registraciones para Cine al Aire Libre (event_id: 9)
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (8, 9, 'registered'),
    -- Pedro
    (10, 9, 'registered'),
    -- Diego
    (12, 9, 'registered'),
    -- Miguel
    (14, 9, 'registered'),
    -- Javier
    (16, 9, 'registered'),
    -- Andrés
    (18, 9, 'registered'),
    -- Valentina
    (19, 9, 'registered');

-- Roberto
-- Registraciones para Teatro Hamlet (event_id: 10)
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (9, 10, 'registered'),
    -- Laura
    (11, 10, 'registered'),
    -- Carmen
    (13, 10, 'registered'),
    -- Sofía
    (15, 10, 'registered'),
    -- Isabella
    (17, 10, 'registered'),
    -- Andrés
    (19, 10, 'registered');

-- Roberto
-- Registraciones para Concurso de Fotografía (event_id: 11)
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (8, 11, 'registered'),
    -- Pedro
    (10, 11, 'registered'),
    -- Diego
    (12, 11, 'registered'),
    -- Miguel
    (14, 11, 'registered');

-- Javier
-- Registraciones para Torneo de Fútbol (event_id: 12)
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (8, 12, 'registered'),
    -- Pedro
    (10, 12, 'registered'),
    -- Diego
    (12, 12, 'registered'),
    -- Miguel
    (14, 12, 'registered'),
    -- Javier
    (16, 12, 'registered'),
    -- Andrés
    (18, 12, 'registered'),
    -- Valentina
    (19, 12, 'registered');

-- Roberto
-- Registraciones para Maratón 5K (event_id: 13)
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (8, 13, 'registered'),
    -- Pedro
    (9, 13, 'registered'),
    -- Laura
    (10, 13, 'registered'),
    -- Diego
    (11, 13, 'registered'),
    -- Carmen
    (12, 13, 'registered'),
    -- Miguel
    (13, 13, 'registered'),
    -- Sofía
    (14, 13, 'registered'),
    -- Javier
    (15, 13, 'registered'),
    -- Isabella
    (16, 13, 'registered');

-- Andrés
-- Registraciones para Torneo de Ajedrez (event_id: 14)
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (9, 14, 'registered'),
    -- Laura
    (11, 14, 'registered'),
    -- Carmen
    (13, 14, 'registered'),
    -- Sofía
    (15, 14, 'registered'),
    -- Isabella
    (17, 14, 'registered');

-- Andrés
-- Registraciones para Clase de Yoga (event_id: 15)
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (9, 15, 'registered'),
    -- Laura
    (11, 15, 'registered'),
    -- Carmen
    (13, 15, 'registered'),
    -- Sofía
    (15, 15, 'registered'),
    -- Isabella
    (17, 15, 'registered'),
    -- Andrés
    (19, 15, 'registered');

-- Patricia
-- Registraciones para Torneo de Voleibol (event_id: 16)
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (8, 16, 'registered'),
    -- Pedro
    (10, 16, 'registered'),
    -- Diego
    (12, 16, 'registered'),
    -- Miguel
    (14, 16, 'registered'),
    -- Javier
    (16, 16, 'registered'),
    -- Andrés
    (18, 16, 'registered');

-- Valentina
-- Algunos registros cancelados para variedad
INSERT INTO
    registrations (user_id, event_id, status)
VALUES
    (19, 2, 'canceled'),
    -- Patricia canceló Taller de Desarrollo Web
    (17, 7, 'canceled'),
    -- Andrés canceló Festival de Música
    (13, 12, 'canceled');

-- Sofía canceló Torneo de Fútbol
-- ==============================
-- VERIFICACIÓN DE DATOS
-- ==============================
-- Ver total de usuarios por rol
SELECT
    role,
    COUNT(*) as total
FROM
    users
GROUP BY
    role;

-- Ver total de eventos por tipo
SELECT
    event_type,
    COUNT(*) as total
FROM
    events
GROUP BY
    event_type;

-- Ver total de registraciones por estado
SELECT
    status,
    COUNT(*) as total
FROM
    registrations
GROUP BY
    status;

-- Ver eventos con más registraciones
SELECT
    e.title,
    COUNT(r.registration_id) as total_registros
FROM
    events e
    LEFT JOIN registrations r ON e.event_id = r.event_id
    AND r.status = 'registered'
GROUP BY
    e.event_id,
    e.title
ORDER BY
    total_registros DESC;

-- Ver usuarios con más registraciones
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
    eventos_inscritos DESC;