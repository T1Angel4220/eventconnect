# 🔄 Migración de Categorías de Eventos a Español

## 📋 Resumen
Esta migración cambia las categorías de eventos de inglés a español en toda la aplicación:

- `academic` → `academico`
- `cultural` → `cultural` (sin cambios)
- `sports` → `deportivo`

## ⚠️ IMPORTANTE
**Ejecuta esta migración solo UNA vez**. Si ya tienes datos en la base de datos con valores en inglés, esta migración los convertirá automáticamente a español.

---

## 🚀 Pasos para Ejecutar la Migración

### Opción 1: Usando psql (Recomendado)

```bash
# 1. Navega a la carpeta de migraciones
cd eventconnect/backend/migrations

# 2. Ejecuta el script SQL
psql -U postgres -d eventconnect -f change_event_types_to_spanish.sql
```

### Opción 2: Usando pgAdmin

1. Abre pgAdmin
2. Conéctate a tu base de datos `eventconnect`
3. Abre el Query Tool
4. Copia y pega el contenido de `change_event_types_to_spanish.sql`
5. Ejecuta (F5 o botón ▶️)

### Opción 3: Ejecutar línea por línea (Manual)

Si prefieres hacerlo paso a paso, abre un cliente SQL y ejecuta:

```sql
-- Conéctate a la base de datos
\c eventconnect;

-- Paso 1: Actualizar eventos existentes
UPDATE events 
SET event_type = CASE 
    WHEN event_type = 'academic' THEN 'academico'
    WHEN event_type = 'sports' THEN 'deportivo'
    ELSE event_type
END
WHERE event_type IN ('academic', 'sports');

-- Paso 2: Ver cuántos se actualizaron
SELECT event_type, COUNT(*) as cantidad 
FROM events 
GROUP BY event_type;

-- Paso 3: Eliminar constraint viejo
ALTER TABLE events 
DROP CONSTRAINT IF EXISTS events_event_type_check;

-- Paso 4: Agregar nuevo constraint
ALTER TABLE events 
ADD CONSTRAINT events_event_type_check 
CHECK (event_type IN ('academico', 'cultural', 'deportivo'));
```

---

## ✅ Verificación

Después de ejecutar la migración, verifica que todo salió bien:

```sql
-- Ver distribución de tipos de eventos
SELECT 
    event_type,
    COUNT(*) as cantidad
FROM events
GROUP BY event_type;
```

**Resultado esperado:**
```
 event_type | cantidad 
------------+----------
 academico  |    XX
 cultural   |    XX
 deportivo  |    XX
```

**NO deberías ver:** `academic` ni `sports`

---

## 🔧 Archivos Actualizados

### Backend
✅ `authentication/models/event.interface.ts` - Interfaces actualizadas  
✅ `events/models/event.interface.ts` - DTOs actualizados  
✅ `sql.txt` - Schema actualizado para nuevas instalaciones  

### App Móvil
✅ `src/types/event.types.ts` - Ya estaba en español  
✅ `src/constants/config.ts` - Ya estaba en español  

---

## 🐛 Solución de Problemas

### Error: "violates check constraint"
**Causa:** Intentaste insertar un evento con valor en inglés después de la migración.

**Solución:** Usa los valores en español:
```typescript
event_type: 'academico'  // ✅ Correcto
event_type: 'academic'   // ❌ Error
```

### Error: "constraint does not exist"
**Causa:** El constraint ya fue eliminado o tiene otro nombre.

**Solución:** Verifica el nombre del constraint:
```sql
SELECT conname 
FROM pg_constraint 
WHERE conrelid = 'events'::regclass 
  AND contype = 'c';
```

### Eventos no se actualizaron
**Causa:** La condición WHERE no coincidió.

**Solución:** Verifica qué valores tienes:
```sql
SELECT DISTINCT event_type FROM events;
```

---

## 📝 Notas Adicionales

- Esta migración es **retrocompatible** - actualiza datos existentes
- Si ya tenías eventos en español, no se verán afectados
- El backend ahora solo acepta: `academico`, `cultural`, `deportivo`
- El frontend móvil ya estaba usando español, ahora está sincronizado

---

## 🔙 Rollback (Reversión)

Si necesitas revertir la migración (volver a inglés):

```sql
\c eventconnect;

UPDATE events 
SET event_type = CASE 
    WHEN event_type = 'academico' THEN 'academic'
    WHEN event_type = 'deportivo' THEN 'sports'
    ELSE event_type
END
WHERE event_type IN ('academico', 'deportivo');

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_event_type_check;
ALTER TABLE events ADD CONSTRAINT events_event_type_check 
CHECK (event_type IN ('academic', 'cultural', 'sports'));
```

---

## 📞 Soporte

Si encuentras algún problema durante la migración, verifica:

1. ✅ Que el backend esté detenido durante la migración
2. ✅ Que tengas permisos de administrador en PostgreSQL
3. ✅ Que hayas hecho un backup de la base de datos antes

**¡Migración completada!** 🎉



