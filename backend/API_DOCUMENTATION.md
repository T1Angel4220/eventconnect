# API Documentation - EventConnect Dashboard

## Base URL
```
http://localhost:3001/api
```

## Autenticación
Todas las rutas del dashboard y eventos requieren autenticación mediante JWT token en el header:
```
Authorization: Bearer <token>
```

## Endpoints del Dashboard

### 1. Estadísticas Generales
```http
GET /api/dashboard/stats
```
**Descripción:** Obtiene estadísticas generales del dashboard
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "total_events": 24,
    "total_participants": 5678,
    "active_events": 8,
    "upcoming_events": 12,
    "total_users": 150,
    "recent_registrations": 45
  }
}
```

### 2. Eventos Recientes
```http
GET /api/dashboard/events/recent?limit=10
```
**Descripción:** Obtiene los eventos más recientes
**Parámetros:**
- `limit` (opcional): Número de eventos a retornar (default: 10)

### 3. Eventos Próximos
```http
GET /api/dashboard/events/upcoming?limit=10
```
**Descripción:** Obtiene los eventos próximos a realizarse
**Parámetros:**
- `limit` (opcional): Número de eventos a retornar (default: 10)

### 4. Eventos Activos
```http
GET /api/dashboard/events/active
```
**Descripción:** Obtiene los eventos que están actualmente activos

### 5. Top Usuarios
```http
GET /api/dashboard/users/top?limit=10
```
**Descripción:** Obtiene los usuarios con más eventos asistidos
**Parámetros:**
- `limit` (opcional): Número de usuarios a retornar (default: 10)

### 6. Registros Recientes
```http
GET /api/dashboard/registrations/recent?limit=10
```
**Descripción:** Obtiene los registros más recientes
**Parámetros:**
- `limit` (opcional): Número de registros a retornar (default: 10)

### 7. Categorías de Eventos
```http
GET /api/dashboard/events/categories
```
**Descripción:** Obtiene estadísticas de categorías de eventos

### 8. Notificaciones de Usuario
```http
GET /api/dashboard/notifications/:userId
```
**Descripción:** Obtiene las notificaciones de un usuario específico

### 9. Contador de Notificaciones No Leídas
```http
GET /api/dashboard/notifications/:userId/unread-count
```
**Descripción:** Obtiene el número de notificaciones no leídas de un usuario

## Endpoints de Eventos

### 1. Crear Evento
```http
POST /api/events
```
**Descripción:** Crea un nuevo evento
**Body:**
```json
{
  "title": "Conferencia de Tecnología",
  "description": "Conferencia sobre las últimas tendencias tecnológicas",
  "event_date": "2025-01-15T10:00:00Z",
  "location": "Auditorio Principal",
  "event_type": "academic",
  "capacity": 200,
  "organizer_id": 1
}
```

### 2. Obtener Todos los Eventos
```http
GET /api/events
```
**Descripción:** Obtiene todos los eventos

### 3. Obtener Evento por ID
```http
GET /api/events/:id
```
**Descripción:** Obtiene un evento específico por su ID

### 4. Obtener Eventos con Organizador
```http
GET /api/events/with-organizer
```
**Descripción:** Obtiene todos los eventos con información del organizador

### 5. Obtener Eventos Próximos
```http
GET /api/events/upcoming?limit=10
```
**Descripción:** Obtiene los eventos próximos a realizarse

### 6. Obtener Eventos Activos
```http
GET /api/events/active
```
**Descripción:** Obtiene los eventos actualmente activos

### 7. Obtener Eventos por Organizador
```http
GET /api/events/organizer/:organizerId
```
**Descripción:** Obtiene todos los eventos de un organizador específico

### 8. Actualizar Evento
```http
PUT /api/events/:id
```
**Descripción:** Actualiza un evento existente
**Body:** (campos a actualizar)

### 9. Eliminar Evento
```http
DELETE /api/events/:id
```
**Descripción:** Elimina un evento

### 10. Estadísticas de Eventos
```http
GET /api/events/stats
```
**Descripción:** Obtiene estadísticas de eventos

## Códigos de Respuesta

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
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
  "error": "Detalles del error"
}
```

## Tipos de Eventos
- `academic` - Académico
- `cultural` - Cultural
- `sports` - Deportes

## Estados de Registro
- `registered` - Registrado
- `canceled` - Cancelado

## Estados de Notificación
- `sent` - Enviada
- `pending` - Pendiente
- `read` - Leída
