# EventConnect

Una aplicación web de gestión de eventos con sistema de autenticación completo que incluye registro, login, recuperación de contraseña y dashboard.

## 🚀 Funcionalidades

### Autenticación y Gestión de Usuarios
- **Registro de usuarios** con validación de datos
- **Login con JWT** para sesiones seguras
- **Recuperación de contraseña** con códigos de verificación por email
- **Protección de rutas** según roles de usuario
- **Validación de formularios** en tiempo real
- **Gestión de sesiones** con localStorage

### Roles y Permisos
- **Organizadores**: Usuarios que pueden gestionar eventos
- **Administradores**: Control total de la plataforma
- **Rutas protegidas** según rol del usuario

### Interfaz de Usuario
- **Diseño responsivo** con Tailwind CSS
- **Componentes reutilizables** con Radix UI
- **Tema oscuro/claro** configurable
- **Validaciones visuales** con indicadores de estado
- **Componentes de formulario** especializados

## 🛠️ Tecnologías Principales

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web minimalista
- **TypeScript** - Tipado estático para JavaScript
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación con tokens
- **bcryptjs** - Encriptación de contraseñas
- **Nodemailer** - Envío de emails
- **CORS** - Configuración de políticas de acceso

### Frontend
- **React 19** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Vite** - Herramienta de construcción y desarrollo
- **React Router DOM** - Enrutamiento
- **Tailwind CSS** - Framework de estilos utilitarios
- **Radix UI** - Componentes accesibles sin estilos
- **Lucide React** - Iconos
- **Class Variance Authority** - Gestión de variantes de clases

## 📁 Estructura del Proyecto

```
eventconnect/
├── backend/                    # Servidor Node.js + Express
│   ├── config/
│   │   └── env.ts             # Configuración de variables de entorno
│   ├── controllers/
│   │   └── authController.ts  # Lógica de autenticación
│   ├── middleware/
│   │   └── authMiddleware.ts  # Middleware de autorización
│   ├── models/
│   │   ├── db.ts             # Conexión a PostgreSQL
│   │   ├── user.ts           # Modelo de usuario
│   │   └── passwordReset.ts  # Modelo de recuperación de contraseña
│   ├── routes/
│   │   └── auth.ts           # Rutas de autenticación
│   ├── services/
│   │   └── emailService.ts   # Servicio de envío de emails
│   ├── tests/
│   │   ├── testDb.ts         # Pruebas de base de datos
│   │   └── testMail.ts       # Pruebas de email
│   ├── utils/
│   │   └── hashPassword.js   # Utilidades de encriptación
│   ├── .env                  # Variables de entorno
│   ├── index.ts              # Punto de entrada del servidor
│   └── package.json          # Dependencias del backend
│
├── frontend/                  # Aplicación React
│   ├── public/               # Archivos estáticos
│   ├── src/
│   │   ├── assets/           # Recursos estáticos
│   │   ├── components/       # Componentes reutilizables
│   │   │   ├── forms/        # Componentes de formulario
│   │   │   ├── login-Web/    # Componentes de autenticación
│   │   │   └── ui/           # Componentes base de UI
│   │   ├── hooks/
│   │   │   └── useTheme.ts   # Hook para manejo de temas
│   │   ├── lib/
│   │   │   └── utils.ts      # Utilidades generales
│   │   ├── pages/            # Páginas de la aplicación
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── VerifyCode.tsx
│   │   │   └── ResetPassword.tsx
│   │   ├── services/
│   │   │   └── authService.ts # Servicios de API
│   │   ├── utils/
│   │   │   └── validations.ts # Validaciones del frontend
│   │   ├── App.tsx           # Componente principal
│   │   └── main.tsx          # Punto de entrada
│   ├── components.json       # Configuración de shadcn/ui
│   ├── vite.config.ts        # Configuración de Vite
│   └── package.json          # Dependencias del frontend
│
└── README.md                 # Documentación del proyecto
```

## ⚙️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- PostgreSQL 12+
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd eventconnect
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

#### Configurar variables de entorno
Crear archivo `.env` en la carpeta `backend/`:

```env
# Puerto del servidor
PORT=3001

# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=eventconnect

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=24h

# Email (para recuperación de contraseña)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

#### Configurar base de datos
```sql
-- Crear base de datos
CREATE DATABASE eventconnect;

-- Crear tabla de usuarios
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'organizer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de códigos de recuperación
CREATE TABLE password_reset_codes (
    reset_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Configurar el Frontend

```bash
cd frontend
npm install
```

## 🚀 Proceso para Levantar la Aplicación

### Levantar el Backend

```bash
cd backend

# Ejecutar tests (opcional)
npm test

# Iniciar servidor en modo desarrollo
npm start
```

El servidor se ejecutará en `http://localhost:3001`

### Levantar el Frontend

```bash
cd frontend

# Iniciar en modo desarrollo
npm run dev

# Para producción
npm run build
npm run preview
```

La aplicación se ejecutará en `http://localhost:5173`

### Scripts Disponibles

#### Backend
- `npm start` - Inicia el servidor
- `npm test` - Ejecuta pruebas de base de datos y email

#### Frontend
- `npm run dev` - Servidor de desarrollo con hot reload
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta el linter

## 🔧 Configuración Adicional

### Base de Datos
Asegúrate de tener PostgreSQL corriendo y ejecutar las migraciones de la base de datos antes de iniciar el backend.

### Email
Para la funcionalidad de recuperación de contraseña, configura un servicio de email (Gmail recomendado) con una contraseña de aplicación.

### CORS
El backend está configurado para aceptar peticiones desde cualquier origen en desarrollo. Para producción, configura los orígenes permitidos.

## 📝 Uso

1. **Registro**: Los usuarios pueden registrarse como organizadores
2. **Login**: Autenticación con email y contraseña
3. **Recuperar contraseña**: Sistema de códigos de verificación por email
4. **Dashboard**: Área protegida para usuarios autenticados
5. **Rutas protegidas**: Acceso basado en roles de usuario

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.