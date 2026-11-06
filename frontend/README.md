# 💻 EventConnect - Frontend Client

Interfaz de usuario moderna, reactiva y accesible para la plataforma de gestión de eventos **EventConnect**, construida con **React 19**, **TypeScript**, **Vite** y **Tailwind CSS v4**.

---

## 🚀 Tecnologías Principales

- **[React 19](https://react.dev/)**: Biblioteca base para componentes de interfaz reactivos y concurrentes.
- **[TypeScript](https://www.typescriptlang.org/)**: Tipado estático estricto para alta mantenibilidad y reducción de bugs.
- **[Vite 7](https://vitejs.dev/)**: Herramienta de compilación ultrarrápida con Hot Module Replacement (HMR).
- **[Tailwind CSS v4](https://tailwindcss.com/)**: Estilizado declarativo con arquitectura de variables CSS modernas.
- **[React Router DOM v7](https://reactrouter.com/)**: Enrutamiento declarativo para SPAs con protección de rutas públicas y privadas.
- **[Chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/)**: Gráficos interactivos de barras, líneas y métricas.
- **[jsPDF](https://github.com/parallax/jsPDF) & jspdf-autotable**: Generación de reportes profesionales en formato PDF descargables en el navegador.
- **[Lucide React](https://lucide.dev/)**: Colección de iconos limpios y consistentes.
- **[Radix UI](https://www.radix-ui.com/)**: Primitivas de accesibilidad sin estilos para componentes interactivos.

---

## 📁 Estructura del Código

```
frontend/src/
├── assets/                 # Recursos gráficos y SVGs
├── components/             # Componentes modulares y reutilizables
│   ├── charts/             # Gráficos (AdminStatsChart, ParticipantsChart)
│   ├── forms/              # Inputs personalizados con validación (EmailInput, LetterOnlyInput, PasswordStrength, VerificationCodeInput)
│   ├── login-Web/          # Guards de rutas: PrivateRoute y PublicRoute
│   ├── modals/             # Modales del sistema (SessionExpiredModal, ConfirmModal, ExportModal)
│   └── ui/                 # Componentes visuales base (Buttons, Dropdowns, Notificaciones, Badges)
├── config/                 # Configuración del cliente HTTP y endpoints de API
│   └── api.ts              # Cliente API centralizado con detección de sesión expirada
├── contexts/               # React Contexts para estado global
│   ├── DashboardContext.tsx
│   └── DashboardContextDefinition.tsx
├── hooks/                  # Custom Hooks reutilizables
│   ├── useAuth.ts          # Estado de autenticación, logout y token
│   ├── useDashboard.ts     # Carga de métricas y datos analíticos
│   ├── useEvents.ts        # Lógica de consumo de eventos y filtros
│   ├── useNotifications.ts # Gestión de alertas y toasts
│   ├── useSessionExpired.ts# Detección y manejo reactivo de caducidad de JWT
│   └── useTheme.ts         # Conmutador y persistencia de tema claro/oscuro
├── lib/                    # Utilidades de Tailwind y helper clsx/tailwind-merge
├── pages/                  # Vistas principales de la aplicación
│   ├── AdminPanel.tsx      # Panel del administrador (usuarios, moderación y estadísticas globales)
│   ├── Configuration.tsx   # Perfil de usuario, cambio de contraseña y avatar
│   ├── Dashboard.tsx       # Vista general con métricas, gráficos y accesos rápidos
│   ├── EventsManagement.tsx# CRUD y gestión visual de eventos con banners
│   ├── RegistrationsManagement.tsx # Listado de inscripciones y exportación PDF
│   ├── Login.tsx           # Inicio de sesión
│   ├── Register.tsx        # Registro de nuevos usuarios
│   ├── ForgotPassword.tsx  # Solicitud de código de restablecimiento
│   ├── VerifyCode.tsx      # Validación del código de 6 dígitos
│   ├── ResetPassword.tsx   # Establecimiento de nueva contraseña
│   ├── RegisterSuccess.tsx # Confirmación visual de registro exitoso
│   └── PasswordResetSuccess.tsx # Confirmación visual de restablecimiento
├── services/               # Clientes y llamadas HTTP hacia el backend
│   ├── authService.ts
│   ├── dashboardService.ts
│   ├── eventService.ts
│   ├── eventsService.ts
│   ├── notificationService.ts
│   └── registrationService.ts
├── types/                  # Definiciones de tipos e interfaces TypeScript
│   ├── dashboard.types.ts
│   ├── dashboard-context.types.ts
│   └── event.types.ts
└── utils/                  # Funciones utilitarias
    ├── dateUtils.ts        # Formateo de fechas y cálculo de estados de eventos
    ├── pdfGenerator.ts     # Generador de reportes PDF de inscripciones
    └── validations.ts      # Validadores de formularios y contraseñas
```

---

## 🔐 Control de Acceso y Rutas

La aplicación implementa protección de rutas basada en roles (**RBAC**):

| Ruta | Acceso | Descripción |
| :--- | :---: | :--- |
| `/login`, `/register` | Público | Autenticación y registro de nuevos usuarios |
| `/forgot-password`, `/verify-code`, `/reset-password` | Público | Flujo de recuperación de contraseña |
| `/dashboard` | `organizer`, `admin` | Métricas, eventos próximos, actividad reciente |
| `/events` | `organizer`, `admin` | Creación, edición, filtrado y eliminación de eventos |
| `/registrations` | `organizer`, `admin` | Control de inscritos, estados y exportación de reportes |
| `/admin` | `admin` | Panel maestro: gestión de usuarios, roles, métricas globales |
| `/configuration` | Todos autenticados | Ajustes de cuenta, foto de perfil y seguridad |

### Detección Automática de Sesión Expirada
Cuando el token JWT caduca o el servidor responde con un código `401 Unauthorized`, un interceptor en [api.ts](file:///c:/Proyectos-HojaDeVida/eventconnect/frontend/src/config/api.ts) dispara un evento global que despliega automáticamente el [SessionExpiredModal](file:///c:/Proyectos-HojaDeVida/eventconnect/frontend/src/components/modals/SessionExpiredModal.tsx), protegiendo la navegación y redirigiendo limpiamente al usuario.

---

## 🎨 Características de Diseño y UI/UX

1. **Tema Claro y Oscuro Persistente**: Conmutador integrado con almacenamiento en `localStorage` y detección de preferencia del sistema.
2. **Validación en Tiempo Real**: Inputs con verificación reactiva (solo letras, email RFC estándar, medidor visual de seguridad de contraseña con 5 niveles).
3. **Exportación de Reportes a PDF**: Creación de documentos imprimibles con formato tabular y cabeceras dinámicas directamente en el cliente.
4. **Subida y Previsualización de Banners**: Soporte para subida de imágenes con validación de tipo y tamaño antes de enviar al servidor.

---

## ⚙️ Instalación y Ejecución

### Prerrequisitos
- Node.js 18.0 o superior
- npm, pnpm o yarn

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Crea un archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```
Contenido de `.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

### 4. Scripts disponibles
- `npm run dev`: Servidor de desarrollo con HMR.
- `npm run build`: Compilación tipada con TypeScript y bundling optimizado con Vite.
- `npm run preview`: Previsualización local del artefacto generado en `dist/`.
- `npm run lint`: Análisis estático de código con ESLint.
