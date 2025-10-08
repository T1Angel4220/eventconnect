# API Documentation - Admin Panel EventConnect

## Base URL
```
http://localhost:3001/api/admin
```

## Autenticación
Todas las rutas requieren autenticación mediante JWT token en el header:
```
Authorization: Bearer <token>
```

**IMPORTANTE:** Estas rutas son exclusivas para usuarios con rol `admin`.

## Endpoints del Panel de Administración

### 1. Gestión de Usuarios

#### Obtener Todos los Usuarios
```http
GET /api/admin/users
```
**Descripción:** Obtiene todos los usuarios del sistema (solo admin)
**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "user_id": 1,
      "first_name": "Admin",
      "last_name": "Johnson",
      "email": "admin@eventconnect.com",
      "role": "admin",
      "profile_image": "/uploads/profiles/profile-123.jpg",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "message": "Usuarios obtenidos exitosamente"
}
```

#### Eliminar Usuario
```http
DELETE /api/admin/users/:userId
```
**Descripción:** Elimina cualquier usuario del sistema (solo admin)
**Parámetros:**
- `userId` (path): ID del usuario a eliminar

**Restricciones:**
- No se puede eliminar a sí mismo

#### Cambiar Rol de Usuario
```http
PATCH /api/admin/users/:userId/role
```
**Descripción:** Cambia el rol de cualquier usuario (solo admin)
**Body:**
```json
{
  "newRole": "organizer"
}
```
**Roles válidos:** `participant`, `organizer`, `admin`

**Restricciones:**
- No se puede cambiar su propio rol

### 2. Gestión de Eventos

#### Obtener Todos los Eventos
```http
GET /api/admin/events
```
**Descripción:** Obtiene todos los eventos del sistema con información del organizador
**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "event_id": 1,
      "title": "Conferencia de Tecnología",
      "description": "Conferencia sobre IA",
      "event_date": "2025-02-15T10:00:00Z",
      "duration": 120,
      "location": "Auditorio Principal",
      "event_type": "academic",
      "capacity": 200,
      "organizer_id": 2,
      "organizer_first_name": "Juan",
      "organizer_last_name": "Pérez",
      "organizer_email": "juan@university.edu",
      "registered_count": 45
    }
  ],
  "message": "Eventos obtenidos exitosamente"
}
```

#### Eliminar Evento
```http
DELETE /api/admin/events/:eventId
```
**Descripción:** Elimina cualquier evento del sistema (solo admin)
**Parámetros:**
- `eventId` (path): ID del evento a eliminar

### 3. Estadísticas del Sistema

#### Estadísticas Globales
```http
GET /api/admin/stats/system
```
**Descripción:** Obtiene estadísticas completas del sistema
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalEvents": 25,
    "totalRegistrations": 450,
    "usersByRole": {
      "participant": 120,
      "organizer": 25,
      "admin": 5
    },
    "eventsByType": {
      "academic": 15,
      "cultural": 6,
      "sports": 4
    }
  },
  "message": "Estadísticas del sistema obtenidas exitosamente"
}
```

### 4. Notificaciones Globales

#### Enviar Notificación Global
```http
POST /api/admin/notifications/global
```
**Descripción:** Envía una notificación a todos los usuarios del sistema
**Body:**
```json
{
  "message": "Mantenimiento programado el próximo domingo de 2:00 a 4:00 AM"
}
```
**Respuesta:**
```json
{
  "success": true,
  "message": "Notificación enviada a 150 usuarios exitosamente"
}
```

## Códigos de Respuesta

- `200` - OK
- `400` - Bad Request (datos inválidos, restricciones de negocio)
- `401` - Unauthorized (no autenticado)
- `403` - Forbidden (no es admin)
- `404` - Not Found (recurso no encontrado)
- `500` - Internal Server Error

## Estructura de Respuesta

### Respuesta Exitosa
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa"
}
```

### Respuesta de Error
```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "Detalles del error",
  "code": "ERROR_CODE" // Solo en algunos casos
}
```

## Usuario de Prueba Admin

**Email:** `admin@eventconnect.com`
**Contraseña:** `Admin123`
**Rol:** `admin`

## Seguridad

1. **Autenticación requerida:** Todas las rutas requieren JWT válido
2. **Autorización:** Solo usuarios con rol `admin` pueden acceder
3. **Protección contra auto-eliminación:** Los admins no pueden eliminarse a sí mismos
4. **Protección contra auto-modificación:** Los admins no pueden cambiar su propio rol
5. **Validación de datos:** Todos los inputs son validados antes del procesamiento

## Funcionalidades Exclusivas del Admin

1. **Gestión completa de usuarios:**
   - Ver todos los usuarios
   - Eliminar cualquier usuario
   - Cambiar roles de usuarios

2. **Gestión completa de eventos:**
   - Ver todos los eventos del sistema
   - Eliminar cualquier evento

3. **Estadísticas globales:**
   - Métricas completas del sistema
   - Distribución por roles y tipos

4. **Notificaciones masivas:**
   - Enviar mensajes a todos los usuarios

5. **Control total del sistema:**
   - Supervisión completa de la plataforma
   - Capacidad de moderación y gestión
