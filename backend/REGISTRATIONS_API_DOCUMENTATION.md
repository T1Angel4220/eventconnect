# API de Inscripciones (Registrations) - EventConnect

## Descripción
Esta documentación describe las APIs disponibles para el manejo de inscripciones a eventos en el sistema EventConnect.

## Base URL
```
http://localhost:3001/api/registrations
```

## Autenticación
Todas las rutas requieren autenticación mediante Bearer Token en el header:
```
Authorization: Bearer <token>
```

## Endpoints Disponibles

### 1. Crear Nueva Inscripción
**POST** `/api/registrations`

Crea una nueva inscripción para el usuario autenticado en un evento específico.

**Body:**
```json
{
  "event_id": 1
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "data": {
    "registration_id": 1,
    "user_id": 2,
    "event_id": 1,
    "registered_at": "2025-01-15T10:30:00Z",
    "status": "registered"
  },
  "message": "Inscripción creada exitosamente"
}
```

**Errores Posibles:**
- `400`: Usuario ya inscrito en el evento
- `400`: Evento ha alcanzado su capacidad máxima
- `401`: Usuario no autenticado

---

### 2. Obtener Inscripciones del Usuario
**GET** `/api/registrations/my`

Obtiene todas las inscripciones del usuario autenticado con detalles completos.

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "registration_id": 1,
      "user_id": 2,
      "event_id": 1,
      "registered_at": "2025-01-15T10:30:00Z",
      "status": "registered",
      "user_first_name": "Juan",
      "user_last_name": "Pérez",
      "user_email": "juan@email.com",
      "user_role": "participant",
      "event_title": "Conferencia de Tecnología",
      "event_date": "2025-01-20T09:00:00Z",
      "event_location": "Centro de Convenciones",
      "event_type": "academic",
      "event_capacity": 100,
      "organizer_id": 1,
      "organizer_name": "Admin Johnson"
    }
  ]
}
```

---

### 3. Obtener Todas las Inscripciones
**GET** `/api/registrations/all`

Obtiene todas las inscripciones del sistema. Solo disponible para administradores y organizadores.

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": [
    // Array de inscripciones con detalles completos
  ]
}
```

**Errores Posibles:**
- `403`: Sin permisos (solo admin/organizer)

---

### 4. Obtener Inscripciones de un Evento
**GET** `/api/registrations/event/:eventId`

Obtiene todas las inscripciones de un evento específico.

**Parámetros:**
- `eventId`: ID del evento

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": [
    // Array de inscripciones del evento con detalles completos
  ]
}
```

---

### 5. Obtener Información de Capacidad de Evento
**GET** `/api/registrations/event/:eventId/capacity`

Obtiene información sobre la capacidad actual y disponible de un evento.

**Parámetros:**
- `eventId`: ID del evento

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "current": 25,
    "capacity": 100,
    "available": 75
  }
}
```

---

### 6. Obtener Inscripción por ID
**GET** `/api/registrations/:id`

Obtiene una inscripción específica por su ID.

**Parámetros:**
- `id`: ID de la inscripción

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "registration_id": 1,
    "user_id": 2,
    "event_id": 1,
    "registered_at": "2025-01-15T10:30:00Z",
    "status": "registered"
  }
}
```

---

### 7. Actualizar Estado de Inscripción
**PUT** `/api/registrations/:id/status`

Actualiza el estado de una inscripción (registered/canceled).

**Parámetros:**
- `id`: ID de la inscripción

**Body:**
```json
{
  "status": "canceled"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "registration_id": 1,
    "user_id": 2,
    "event_id": 1,
    "registered_at": "2025-01-15T10:30:00Z",
    "status": "canceled"
  },
  "message": "Estado de inscripción actualizado exitosamente"
}
```

---

### 8. Cancelar Inscripción
**PUT** `/api/registrations/:id/cancel`

Cancela una inscripción específica.

**Parámetros:**
- `id`: ID de la inscripción

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "registration_id": 1,
    "user_id": 2,
    "event_id": 1,
    "registered_at": "2025-01-15T10:30:00Z",
    "status": "canceled"
  },
  "message": "Inscripción cancelada exitosamente"
}
```

---

### 9. Eliminar Inscripción
**DELETE** `/api/registrations/:id`

Elimina completamente una inscripción del sistema. Solo disponible para administradores.

**Parámetros:**
- `id`: ID de la inscripción

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Inscripción eliminada exitosamente"
}
```

**Errores Posibles:**
- `403`: Solo administradores pueden eliminar inscripciones

---

### 10. Obtener Estadísticas de Inscripciones
**GET** `/api/registrations/stats`

Obtiene estadísticas generales de inscripciones. Solo disponible para administradores y organizadores.

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "total_registrations": 150,
    "active_registrations": 120,
    "canceled_registrations": 30,
    "registrations_by_event": [
      {
        "event_id": 1,
        "event_title": "Conferencia de Tecnología",
        "registration_count": 45
      }
    ],
    "registrations_by_user": [
      {
        "user_id": 2,
        "user_name": "Juan Pérez",
        "registration_count": 3
      }
    ]
  }
}
```

---

### 11. Buscar Inscripciones
**GET** `/api/registrations/search`

Busca inscripciones por criterios específicos. Solo disponible para administradores y organizadores.

**Query Parameters:**
- `userId`: ID del usuario (opcional)
- `eventId`: ID del evento (opcional)
- `status`: Estado de la inscripción (registered/canceled) (opcional)
- `eventTitle`: Título del evento (opcional)
- `userName`: Nombre del usuario (opcional)

**Ejemplo:**
```
GET /api/registrations/search?status=registered&eventTitle=tecnología
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": [
    // Array de inscripciones que coinciden con los criterios
  ]
}
```

---

## Códigos de Estado HTTP

- `200`: Operación exitosa
- `201`: Recurso creado exitosamente
- `400`: Error en la solicitud (datos inválidos)
- `401`: No autenticado
- `403`: Sin permisos
- `404`: Recurso no encontrado
- `500`: Error interno del servidor

## Notas Importantes

1. **Autenticación**: Todas las rutas requieren autenticación válida
2. **Permisos**: Algunas rutas están restringidas por rol (admin/organizer)
3. **Validación**: Se valida la capacidad del evento antes de permitir nuevas inscripciones
4. **Duplicados**: No se permiten inscripciones duplicadas (mismo usuario en mismo evento)
5. **Estados**: Los estados válidos son `registered` y `canceled`

## Ejemplos de Uso

### Inscribirse a un Evento
```javascript
const response = await fetch('/api/registrations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    event_id: 1
  })
});

const result = await response.json();
```

### Obtener Mis Inscripciones
```javascript
const response = await fetch('/api/registrations/my', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

const result = await response.json();
```

### Cancelar Inscripción
```javascript
const response = await fetch('/api/registrations/1/cancel', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

const result = await response.json();
```
