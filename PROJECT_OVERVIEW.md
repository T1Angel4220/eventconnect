# 📖 EventConnect - Especificación y Visión del Proyecto

> Documento técnico y funcional que describe la naturaleza, arquitectura, casos de uso y valor del sistema **EventConnect**.

---

## 1. 🎯 ¿Qué es EventConnect?

**EventConnect** es una plataforma web integral diseñada para la **gestión, publicación, control de asistencia y análisis de eventos** en entornos institucionales, académicos, culturales y deportivos.

El sistema resuelve la necesidad de coordinar eventos de forma centralizada, ofreciendo a organizadores y administradores herramientas avanzadas de control de cupos, reportes analíticos y comunicación multicanal, al tiempo que brinda a los participantes una experiencia moderna, fluida y transparente para descubrir eventos e inscribirse en ellos.

```mermaid
graph TD
    A[EventConnect Platform] --> B[Gestión de Eventos]
    A --> C[Control de Aforo e Inscripciones]
    A --> D[Analítica y Reportes PDF]
    A --> E[Notificaciones Multicanal Web & Push]
    A --> F[Seguridad y Roles RBAC]
    
    B --> B1[Académicos / Culturales / Deportivos]
    C --> C1[Capacidad dinámica y estados en vivo]
    D --> D1[Gráficos interactivos Chart.js + Exportación jsPDF]
    E --> E1[Notificaciones en plataforma + Expo Mobile Push]
    F --> F1[Admin / Organizador / Participante + JWT]
```

---

## 2. 💡 Problemas del Mundo Real que Resuelve

1. **Descentralización y desorden en la convocatoria**: En muchas organizaciones, los eventos se anuncian a través de canales dispersos (redes sociales, correos manuales, carteleras), dificultando la visibilidad unificada y el control formal de quién asiste.
2. **Sobre-cupo y falta de control de capacidad**: Sin un sistema transaccional con validación de concurrencia, los eventos se saturan o se desperdician plazas si alguien cancela su asistencia sin aviso.
3. **Carencia de métricas accionables**: Los organizadores no disponen de estadísticas para evaluar qué temáticas convocan más público, la estacionalidad de las inscripciones o la tasa de cancelación.
4. **Inseguridad y gestión precaria de accesos**: Proteger los datos personales de asistentes y contar con autenticación moderna (JWT, hashing bcrypt, recuperación de clave con código temporal) es indispensable para cumplir estándares de privacidad.
5. **Generación manual y tardía de reportes**: La recopilación manual de listados de asistencia para fines acreditativos o logísticos genera retrasos y errores humanos; EventConnect lo automatiza mediante exportación directa a PDF.

---

## 3. 👥 Roles del Sistema y Modelo de Permisos (RBAC)

EventConnect opera con un esquema estricto de **Control de Acceso Basado en Roles**:

```mermaid
classDiagram
    class Admin {
      +Ver estadísticas globales del sistema
      +Auditar y eliminar usuarios
      +Moderar y gestionar todos los eventos
      +Emitir notificaciones broadcast globales
    }
    class Organizador {
      +Crear, editar y eliminar eventos propios
      +Subir y actualizar posters/banners
      +Monitorear aforo e inscritos en tiempo real
      +Exportar listados a reportes PDF
      +Visualizar dashboard analítico propio
    }
    class Participante {
      +Explorar catálogo de eventos con filtros
      +Inscribirse y cancelar inscripciones
      +Recibir notificaciones en vivo y en móvil
      +Gestionar perfil y contraseña
    }
    Admin --|> Organizador : Hereda capacidades
```

### Matriz Detallada de Permisos

| Módulo / Acción | Administrador | Organizador | Participante |
| :--- | :---: | :---: | :---: |
| Explorar catálogo de eventos | ✅ | ✅ | ✅ |
| Inscribirse / Cancelar inscripción | ✅ | ✅ | ✅ |
| Crear y editar eventos con banner | ✅ | ✅ (propios) | ❌ |
| Eliminar eventos | ✅ (cualquiera) | ✅ (propios) | ❌ |
| Descargar reportes PDF de inscritos | ✅ | ✅ (sus eventos) | ❌ |
| Acceso al Dashboard de métricas | ✅ | ✅ | ❌ |
| Gestión global de usuarios y roles | ✅ | ❌ | ❌ |
| Difusión de notificaciones masivas | ✅ | ❌ | ❌ |
| Actualización de perfil y avatar | ✅ | ✅ | ✅ |

---

## 4. 🏗️ Arquitectura de Software y Patrones de Diseño

El sistema está construido siguiendo los principios de **separación de responsabilidades**, **modularidad por capas** y **comunicación desacoplada**:

```mermaid
flowchart LR
    subgraph Frontend["Frontend SPA (React 19 + Vite)"]
        UI[Páginas & Componentes UI]
        State[Custom Hooks & Contexts]
        Services[API Services & HTTP Client]
        UI --> State --> Services
    end

    subgraph Backend["Backend API (Node.js + Express + TS)"]
        Routes[API Routes & Guards]
        Controllers[Controllers]
        ServicesB[Domain Services]
        Repos[Repository Pattern]
        Routes --> Controllers --> ServicesB --> Repos
    end

    subgraph Storage["Persistencia & Servicios Externos"]
        PG[(PostgreSQL Database)]
        Disk[(Uploads Storage / Banners)]
        SMTP[Nodemailer / SMTP Gmail]
        Expo[Expo Push Service API]
    end

    Services -->|HTTP / JSON + Bearer JWT| Routes
    Repos -->|SQL Queries| PG
    ServicesB -->|File System| Disk
    ServicesB -->|Email Tokens| SMTP
    ServicesB -->|Push Notification Requests| Expo
```

### 1. Patrón Repository en Backend
En lugar de mezclar consultas SQL en los controladores, cada módulo (`authentication`, `events`, `notifications`, `tokens`) divide sus funciones en:
- **Routes**: Exposición y enlace con middlewares de autenticación (`authMiddleware`, `adminMiddleware`).
- **Controllers**: Recepción de peticiones HTTP, validación inicial de parámetros y armado de respuestas estandarizadas.
- **Services**: Lógica de negocio (cálculo de aforo, control de estados, llamadas a correo/push).
- **Repositories**: Capa de acceso a datos directa a PostgreSQL mediante transacciones y consultas parametrizadas.

### 2. Frontend React con Arquitectura Component-Driven
- **Hooks desacoplados**: `useAuth`, `useDashboard`, `useEvents`, `useNotifications`, `useSessionExpired` encapsulan el ciclo de vida y la sincronización con la API.
- **Detección reactiva de caducidad de sesión**: Interceptor global en `api.ts` que captura códigos 401 o payloads con expiración de JWT para activar el modal de alerta y redirigir sin pérdida abrupta de contexto.
- **Generación de documentos client-side**: Uso de `jspdf` y `jspdf-autotable` para componer reportes en PDF sin sobrecargar el servidor backend.

---

## 5. 🗄️ Modelo de Datos (Diagrama Entidad-Relación)

La base de datos relacional PostgreSQL garantiza consistencia estricta, integridad referencial y alto rendimiento:

```mermaid
erDiagram
    USERS ||--o{ EVENTS : "organiza (organizer_id)"
    USERS ||--o{ REGISTRATIONS : "se inscribe (user_id)"
    USERS ||--o{ NOTIFICATIONS : "recibe (user_id)"
    USERS ||--o{ PASSWORD_RESET_CODES : "solicita (user_id)"
    USERS ||--o{ USER_PUSH_TOKENS : "asocia dispositivos (user_id)"
    EVENTS ||--o{ REGISTRATIONS : "recibe inscripciones (event_id)"

    USERS {
        int user_id PK
        string first_name
        string last_name
        string email UK
        string password
        string role
        string profile_image
        timestamp created_at
    }

    EVENTS {
        int event_id PK
        string title
        text description
        timestamp event_date
        int duration
        string status
        string location
        string event_type
        int capacity
        int organizer_id FK
        text event_image
        timestamp created_at
        timestamp updated_at
    }

    REGISTRATIONS {
        int registration_id PK
        int user_id FK
        int event_id FK
        timestamp registered_at
        string status
    }

    NOTIFICATIONS {
        int notification_id PK
        int user_id FK
        text message
        timestamp sent_at
        string status
    }

    PASSWORD_RESET_CODES {
        int reset_id PK
        int user_id FK
        string code
        timestamp expires_at
        boolean used
        timestamp created_at
    }

    USER_PUSH_TOKENS {
        int id PK
        int user_id FK
        string token
        timestamp created_at
    }
```

### Reglas de Integridad Destacadas:
- **`events.event_type`**: Restricción `CHECK (event_type IN ('academico', 'cultural', 'deportivo'))`.
- **`events.status`**: Estados controlados: `'upcoming'` (próximo), `'in_progress'` (en curso), `'completed'` (finalizado).
- **`registrations`**: Restricción `UNIQUE(user_id, event_id)` que impide que un participante se registre duplicado en el mismo evento.
- **`ON DELETE CASCADE`**: Al eliminar un evento o usuario, sus inscripciones y notificaciones asociadas se limpian automáticamente para evitar registros huérfanos.

---

## 6. 🔄 Flujos Operativos y Casos de Uso Clave

### Flujo 1: Autenticación y Recuperación Segura de Contraseña

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Frontend as Frontend (React)
    participant Backend as Backend (Express)
    participant DB as PostgreSQL
    participant SMTP as Servicio Email

    Usuario->>Frontend: Solicita recuperar clave con su email
    Frontend->>Backend: POST /api/password/forgot-password { email }
    Backend->>DB: Busca usuario y genera código de 6 dígitos
    Backend->>DB: Guarda código en password_reset_codes (expira en 15 min)
    Backend->>SMTP: Envía email con el código de seguridad
    SMTP-->>Usuario: Recibe correo con código
    Usuario->>Frontend: Introduce código de 6 dígitos
    Frontend->>Backend: POST /api/password/verify-code { email, code }
    Backend->>DB: Valida que coincida, no haya expirado y no esté usado
    Backend-->>Frontend: Código verificado exitosamente
    Usuario->>Frontend: Ingresa nueva contraseña (con medidor de seguridad)
    Frontend->>Backend: POST /api/password/reset-password { email, code, newPassword }
    Backend->>Backend: Hashea contraseña con bcrypt (10 salt rounds)
    Backend->>DB: Actualiza users.password y marca código used=TRUE
    Backend-->>Frontend: 200 OK
    Frontend-->>Usuario: Redirección al login con mensaje de éxito
```

---

### Flujo 2: Ciclo de Vida de un Evento y Control de Aforo

```mermaid
sequenceDiagram
    autonumber
    actor Org as Organizador
    actor Part as Participante
    participant API as Backend API
    participant DB as PostgreSQL
    participant Push as Expo Push Service

    Org->>API: POST /api/events (título, fecha, capacidad, categoría, póster)
    API->>DB: Inserta nuevo evento con status 'upcoming'
    API-->>Org: Evento creado exitosamente

    Part->>API: GET /api/events (aplica filtros de fecha y categoría)
    API-->>Part: Lista de eventos con conteo de inscritos actual
    Part->>API: POST /api/registrations (user_id, event_id)
    API->>DB: Verifica que registered_count < capacity
    API->>DB: Inserta registro en registrations (status 'registered')
    API->>Push: Dispara notificación push al participante
    API-->>Part: Inscripción confirmada con éxito
```

---

### Flujo 3: Exportación de Reportes PDF

1. El organizador o administrador accede a la sección de **Gestión de Inscripciones**.
2. Aplica filtros según el evento deseado, estado de los inscritos o búsqueda por nombre/correo.
3. Al hacer clic en **Exportar Reporte**, se abre el modal de opciones (formato de columnas, ordenación).
4. El generador [pdfGenerator.ts](file:///c:/Proyectos-HojaDeVida/eventconnect/frontend/src/utils/pdfGenerator.ts) instancia un documento `jsPDF`, renderiza el membrete oficial de EventConnect, añade la tabla estilizada con `jspdf-autotable` y activa la descarga automática sin latencia de red.

---

## 7. 🌟 Valor Diferencial para Portafolio

Este proyecto evidencia sólidas competencias en desarrollo de software moderno:

- **Full-Stack End-to-End**: Dominio completo desde el diseño del esquema relacional y endpoints REST tipados en backend, hasta interfaces interactivas y reactivas en frontend.
- **Tipado Estricto de Punta a Punta**: Interfaces compartidas y contratos de tipos en TypeScript para minimizar errores en tiempo de ejecución.
- **Seguridad en la Práctica**: Manejo adecuado de variables de entorno, protección de secretos, prevención de inyecciones SQL con consultas parametrizadas, encriptación bcrypt y roles RBAC.
- **UX/UI Profesional**: Modo oscuro nativo, validación reactiva de formularios, estados de carga y errores manejados con elegancia, además de visualizaciones analíticas con Chart.js.
- **Multiplataforma**: Arquitectura preparada para clientes móviles mediante tokens de Expo Push Notifications.

