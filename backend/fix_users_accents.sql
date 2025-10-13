-- ==============================
-- CORREGIR NOMBRES DE USUARIOS - REMOVER TILDES
-- ==============================

-- Corregir todos los nombres y apellidos que tienen tildes

-- ==============================
-- CORREGIR PRIMEROS NOMBRES
-- ==============================

UPDATE users 
SET first_name = 'Maria'
WHERE first_name LIKE '%Mar%a%';

UPDATE users 
SET first_name = 'Elena'
WHERE first_name LIKE '%Elena%';

UPDATE users 
SET first_name = 'Carlos'
WHERE first_name LIKE '%Carlos%';

UPDATE users 
SET first_name = 'Ana'
WHERE first_name LIKE '%Ana%';

UPDATE users 
SET first_name = 'Luis'
WHERE first_name LIKE '%Luis%';

UPDATE users 
SET first_name = 'Pedro'
WHERE first_name LIKE '%Pedro%';

UPDATE users 
SET first_name = 'Laura'
WHERE first_name LIKE '%Laura%';

UPDATE users 
SET first_name = 'Diego'
WHERE first_name LIKE '%Diego%';

UPDATE users 
SET first_name = 'Carmen'
WHERE first_name LIKE '%Carmen%';

UPDATE users 
SET first_name = 'Miguel'
WHERE first_name LIKE '%Miguel%';

UPDATE users 
SET first_name = 'Sofia'
WHERE first_name LIKE '%Sof%a%';

UPDATE users 
SET first_name = 'Javier'
WHERE first_name LIKE '%Javier%';

UPDATE users 
SET first_name = 'Isabella'
WHERE first_name LIKE '%Isabella%';

UPDATE users 
SET first_name = 'Andres'
WHERE first_name LIKE '%Andr%s%';

UPDATE users 
SET first_name = 'Valentina'
WHERE first_name LIKE '%Valentina%';

UPDATE users 
SET first_name = 'Roberto'
WHERE first_name LIKE '%Roberto%';

UPDATE users 
SET first_name = 'Patricia'
WHERE first_name LIKE '%Patricia%';

-- ==============================
-- CORREGIR APELLIDOS
-- ==============================

UPDATE users 
SET last_name = 'Garcia'
WHERE last_name LIKE '%Garc%a%';

UPDATE users 
SET last_name = 'Lopez'
WHERE last_name LIKE '%L%pez%';

UPDATE users 
SET first_name = 'Lopez'
WHERE first_name LIKE '%L%pez%';

UPDATE users 
SET last_name = 'Rodriguez'
WHERE last_name LIKE '%Rodr%guez%';

UPDATE users 
SET last_name = 'Martinez'
WHERE last_name LIKE '%Mart%nez%';

UPDATE users 
SET last_name = 'Hernandez'
WHERE last_name LIKE '%Hern%ndez%';

UPDATE users 
SET last_name = 'Sanchez'
WHERE last_name LIKE '%S%nchez%';

UPDATE users 
SET last_name = 'Fernandez'
WHERE last_name LIKE '%Fern%ndez%';

UPDATE users 
SET last_name = 'Torres'
WHERE last_name LIKE '%Torres%';

UPDATE users 
SET last_name = 'Ramirez'
WHERE last_name LIKE '%Ram%rez%';

UPDATE users 
SET last_name = 'Flores'
WHERE last_name LIKE '%Flores%';

UPDATE users 
SET last_name = 'Morales'
WHERE last_name LIKE '%Morales%';

UPDATE users 
SET last_name = 'Jimenez'
WHERE last_name LIKE '%Jim%nez%';

UPDATE users 
SET last_name = 'Ruiz'
WHERE last_name LIKE '%Ruiz%';

UPDATE users 
SET last_name = 'Diaz'
WHERE last_name LIKE '%D%az%';

UPDATE users 
SET last_name = 'Castro'
WHERE last_name LIKE '%Castro%';

UPDATE users 
SET last_name = 'Vargas'
WHERE last_name LIKE '%Vargas%';

UPDATE users 
SET last_name = 'Ortiz'
WHERE last_name LIKE '%Ortiz%';

-- ==============================
-- VERIFICACIÓN
-- ==============================

-- Mostrar todos los usuarios corregidos
SELECT user_id, first_name, last_name, email, role 
FROM users 
ORDER BY user_id;

-- Verificar que no queden tildes en nombres y apellidos
SELECT user_id, first_name, last_name, email
FROM users 
WHERE first_name LIKE '%á%' OR first_name LIKE '%é%' OR first_name LIKE '%í%' OR first_name LIKE '%ó%' OR first_name LIKE '%ú%' OR first_name LIKE '%ñ%'
   OR last_name LIKE '%á%' OR last_name LIKE '%é%' OR last_name LIKE '%í%' OR last_name LIKE '%ó%' OR last_name LIKE '%ú%' OR last_name LIKE '%ñ%'
ORDER BY user_id;
