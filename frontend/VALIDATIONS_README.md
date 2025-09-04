# Validaciones del Proyecto Event Connect

Este documento describe todas las validaciones implementadas en el proyecto para garantizar la seguridad y calidad de los datos ingresados por los usuarios.

## 📁 **ESTRUCTURA DE CARPETAS REORGANIZADA** ⭐

```
frontend/src/components/
├── ui/                     ← Componentes básicos de UI
│   ├── button.tsx         ← Botones genéricos
│   └── ValidationError.tsx ← Mensajes de error
├── forms/                  ← Componentes de formularios especializados
│   ├── index.ts           ← Exportaciones centralizadas
│   ├── LetterOnlyInput.tsx ← Input solo letras
│   ├── EmailInput.tsx     ← Input de email
│   ├── VerificationCodeInput.tsx ← Input de código
│   └── PasswordStrength.tsx ← Indicador de fortaleza
└── login-Web/
    └── PrivateRoute.tsx
```

## 📋 Validaciones Implementadas

### 1. **Validaciones de Email**
- **Campo requerido**: El email no puede estar vacío
- **Formato válido**: Debe seguir el patrón estándar de email (usuario@dominio.com)
- **Validación en tiempo real**: Se valida mientras el usuario escribe
- **Prevención de entrada inválida**: Bloquea caracteres no permitidos
- **Mensaje de error**: "Formato de email inválido" si no cumple el patrón

### 2. **Validaciones de Contraseña**
- **Longitud mínima**: 8 caracteres
- **Longitud máxima**: 128 caracteres
- **Composición requerida**: 
  - Al menos una letra (mayúscula o minúscula)
  - Al menos un número
- **Validación en tiempo real**: Se valida mientras el usuario escribe
- **Indicador de fortaleza**: Muestra la fortaleza de la contraseña en tiempo real

#### Requisitos de Contraseña Fuerte (Opcional)
- Al menos una letra mayúscula
- Al menos una letra minúscula
- Al menos un número
- Al menos un carácter especial

### 3. **Validaciones de Confirmación de Contraseña**
- **Campo requerido**: Debe confirmar la contraseña
- **Coincidencia**: Debe ser idéntica a la contraseña original
- **Mensaje de error**: "Las contraseñas no coinciden" si no son iguales

### 4. **Validaciones de Nombres (Nombre y Apellido)**
- **Campo requerido**: No puede estar vacío
- **Longitud mínima**: 2 caracteres
- **Longitud máxima**: 50 caracteres
- **Solo letras**: **BLOQUEA EN TIEMPO REAL** números, símbolos y caracteres especiales
- **Caracteres especiales**: Se permiten acentos y ñ (á, é, í, ó, ú, ñ)
- **Prevención activa**: No permite escribir caracteres inválidos
- **Validación en tiempo real**: Se valida mientras el usuario escribe

### 5. **Validaciones de Código de Verificación**
- **Campo requerido**: No puede estar vacío
- **Longitud exacta**: 6 dígitos
- **Solo números**: **BLOQUEA EN TIEMPO REAL** letras y caracteres especiales
- **Prevención activa**: No permite escribir caracteres no numéricos
- **Validación en tiempo real**: Se valida mientras el usuario escribe

### 6. **Validaciones de Usuario (Username)**
- **Campo requerido**: No puede estar vacío
- **Longitud mínima**: 3 caracteres
- **Longitud máxima**: 30 caracteres
- **Caracteres permitidos**: Solo letras, números y guiones bajos, sin espacios
- **Sin espacios**: No se permiten espacios

## 🎯 Componentes de Validación

### 1. **ValidationError** (`/components/ui/`)
Componente reutilizable para mostrar errores de validación de manera consistente.

```tsx
import ValidationError from "../components/ui/ValidationError"

<ValidationError message={errors.email} />
```

### 2. **PasswordStrength** (`/components/forms/`)
Componente que muestra la fortaleza de la contraseña en tiempo real con:
- Barra de progreso visual
- Indicador de fortaleza (Débil, Media, Fuerte)
- Lista de requisitos cumplidos/no cumplidos

```tsx
import { PasswordStrength } from "../components/forms"

<PasswordStrength password={formData.password} />
```

### 3. **LetterOnlyInput** (`/components/forms/`) ⭐ NUEVO
Componente especializado que **PREVIENE** la entrada de números y caracteres especiales:
- **Bloqueo en tiempo real**: No permite escribir caracteres inválidos
- **Prevención de pegado**: Filtra contenido pegado inválido
- **Prevención de drag & drop**: Filtra contenido arrastrado inválido
- **Indicador visual**: Muestra advertencias cuando se intenta ingresar contenido inválido
- **Contador de caracteres**: Muestra caracteres restantes
- **Solo letras**: Permite letras, acentos, ñ y espacios simples
- **Capitalización automática**: ⭐ NUEVO - Primera letra de cada palabra en mayúscula
- **Permite mayúsculas**: ✅ **CORREGIDO** - El usuario puede escribir con mayúsculas
- **Conversión automática**: Las mayúsculas se convierten al formato correcto
- **Límite reducido**: ⭐ NUEVO - Máximo 20 caracteres para nombres más concisos

```tsx
import { LetterOnlyInput } from "../components/forms"

<LetterOnlyInput
  id="firstName"
  name="firstName"
  value={formData.firstName}
  onChange={handleInputChange}
  onBlur={() => handleBlur('firstName')}
  placeholder="Tu nombre"
  label="Nombre"
  error={errors.firstName}
  touched={touched.firstName}
  required={true}
  maxLength={20} // ⭐ REDUCIDO de 50 a 20 caracteres
/>
```

### 4. **EmailInput** (`/components/forms/`) ⭐ NUEVO
Componente especializado para emails con validación en tiempo real:
- **Validación inmediata**: Detecta formato inválido mientras se escribe
- **Prevención de pegado**: Advierte sobre contenido pegado inválido
- **Prevención de drag & drop**: Advierte sobre contenido arrastrado inválido
- **Feedback visual**: Bordes amarillos para advertencias

```tsx
import { EmailInput } from "../components/forms"

<EmailInput
  id="email"
  name="email"
  value={formData.email}
  onChange={handleInputChange}
  onBlur={() => handleBlur('email')}
  placeholder="tu@email.com"
  label="Correo Electrónico"
  error={errors.email}
  touched={touched.email}
  required={true}
/>
```

### 5. **VerificationCodeInput** (`/components/forms/`) ⭐ NUEVO
Componente especializado para códigos de verificación:
- **Solo números**: Bloquea letras y caracteres especiales en tiempo real
- **Prevención de pegado**: Filtra contenido pegado inválido
- **Prevención de drag & drop**: Filtra contenido arrastrado inválido
- **Formato monoespaciado**: Texto centrado con tracking amplio
- **Contador de dígitos**: Muestra dígitos ingresados vs. requeridos

```tsx
import { VerificationCodeInput } from "../components/forms"

<VerificationCodeInput
  id="code"
  name="code"
  value={code}
  onChange={handleCodeChange}
  onBlur={() => {}}
  placeholder="000000"
  label="Código de Verificación"
  error={codeError}
  touched={true}
  required={true}
  maxLength={6}
/>
```

## 🔧 Funciones de Validación

### Archivo: `src/utils/validations.ts`

#### Funciones Principales:
- `validateEmail(email: string)`: Valida formato de email
- `validatePassword(password: string)`: Valida contraseña básica
- `validateStrongPassword(password: string)`: Valida contraseña fuerte
- `validateConfirmPassword(password: string, confirmPassword: string)`: Valida confirmación
- `validateName(name: string, fieldName: string)`: Valida nombres
- `validateUsername(username: string)`: Valida nombres de usuario
- `validateVerificationCode(code: string)`: Valida códigos de verificación

#### Funciones Auxiliares:
- `validateLength(value: string, min: number, max: number, fieldName: string)`: Valida longitud
- `validateNoSpaces(value: string, fieldName: string)`: Valida que no haya espacios
- `validateNoNumbers(value: string, fieldName: string)`: Valida que no haya números
- `validateOnlyLetters(value: string, fieldName: string)`: Valida que solo haya letras
- `getPasswordStrength(password: string)`: Calcula fortaleza de contraseña

## 🎯 **CAPITALIZACIÓN AUTOMÁTICA** ⭐ NUEVO

### **Funcionalidad Implementada:**
- **Primera letra mayúscula**: Cada palabra comienza automáticamente con mayúscula
- **Resto en minúsculas**: Todas las demás letras se convierten automáticamente en minúsculas
- **Permite mayúsculas**: ✅ **CORREGIDO** - El usuario puede escribir con mayúsculas
- **Aplicación en tiempo real**: Se aplica mientras el usuario escribe

### **Ejemplos de Capitalización:**
```
Entrada del usuario → Resultado automático
"juan" → "Juan"
"JUAN" → "Juan"
"jUaN" → "Juan"
"maria jose" → "Maria Jose"
"MARIA JOSE" → "Maria Jose"
"de la rosa" → "De La Rosa"
"DE LA ROSA" → "De La Rosa"
"van der berg" → "Van Der Berg"
"VAN DER BERG" → "Van Der Berg"
```

### **Reglas de Capitalización:**
1. **Primera letra de cada palabra**: Siempre mayúscula
2. **Letras intermedias**: Siempre minúsculas
3. **Después de espacios**: Nueva palabra = nueva mayúscula
4. **Permite entrada libre**: ✅ **El usuario puede escribir como quiera**
5. **Conversión automática**: Se aplica el formato correcto automáticamente

### **Beneficios:**
- ✅ **Consistencia visual**: Todos los nombres se ven profesionales
- ✅ **Prevención de errores**: No más "jUaN" o "MARIA"
- ✅ **Experiencia mejorada**: El usuario puede escribir naturalmente
- ✅ **Formato estándar**: Cumple con las convenciones de nombres propios
- ✅ **Flexibilidad**: ✅ **CORREGIDO** - Permite mayúsculas para conversión automática

## 🛡️ **PREVENCIÓN ACTIVA DE ENTRADA INVÁLIDA** ⭐

### Características de Seguridad:
- **Bloqueo en tiempo real**: Los caracteres inválidos nunca llegan al campo
- **Prevención de pegado**: Filtra contenido del portapapeles antes de insertarlo
- **Prevención de drag & drop**: Filtra contenido arrastrado antes de soltarlo
- **Bloqueo de teclas**: Previene presionar teclas no permitidas
- **Advertencias visuales**: Muestra mensajes cuando se intenta ingresar contenido inválido

### Métodos de Prevención:
1. **`onKeyDown`** - Bloquea teclas antes de que se registren
2. **`onPaste`** - Intercepta y filtra contenido pegado
3. **`onDrop`** - Intercepta y filtra contenido arrastrado
4. **`onChange`** - Filtra cualquier entrada que haya pasado por alto
5. **`maxLength`** - Limita la longitud máxima
6. **Regex en tiempo real** - Valida formato mientras se escribe

### Ejemplos de Prevención:
- **Nombres**: Solo letras, acentos y ñ (no números, símbolos, emojis)
- **Códigos**: Solo números (no letras, símbolos, espacios)
- **Emails**: Formato válido con validación en tiempo real

## 📱 Validación en Tiempo Real

### Características:
- **Validación inmediata**: Se ejecuta mientras el usuario escribe
- **Estado "touched"**: Solo valida después de que el usuario ha interactuado con el campo
- **Feedback visual**: Bordes rojos y mensajes de error en tiempo real
- **Botón deshabilitado**: El botón de envío se deshabilita si hay errores
- **Prevención activa**: Bloquea entrada inválida antes de que ocurra

### Implementación:
```tsx
useEffect(() => {
  if (touched.email) {
    const emailValidation = validateEmail(formData.email)
    setErrors(prev => ({ ...prev, email: emailValidation.message }))
  }
}, [formData.email, touched.email])
```

## 🎨 Estilos de Validación

### Estados Visuales:
- **Normal**: Borde gris
- **Focus**: Borde negro/blanco según tema
- **Error**: Borde rojo con mensaje de error
- **Advertencia**: Borde amarillo con mensaje de advertencia
- **Válido**: Borde verde (opcional)

### Clases CSS:
```css
/* Campo con error */
border-red-500 dark:border-red-500

/* Campo con advertencia */
border-yellow-500 dark:border-yellow-500

/* Campo normal */
border-gray-200 dark:border-gray-300

/* Campo en focus */
focus:border-black dark:focus:border-gray-600
```

## 🚀 Uso en Componentes

### 1. **Login**
- Validación de email/username
- Validación de contraseña
- Botón deshabilitado hasta que ambos campos sean válidos

### 2. **Register** ⭐ MEJORADO
- **LetterOnlyInput** para nombre y apellido (solo letras)
- **EmailInput** para correo electrónico
- Validación de contraseña con indicador de fortaleza
- Validación de confirmación de contraseña
- Botón deshabilitado hasta que todos los campos sean válidos

### 3. **ForgotPassword**
- Validación de email
- Botón deshabilitado hasta que el email sea válido

### 4. **VerifyCode** ⭐ MEJORADO
- **VerificationCodeInput** para código de 6 dígitos (solo números)
- Botón deshabilitado hasta que el código sea válido

### 5. **ResetPassword**
- Validación de nueva contraseña con indicador de fortaleza
- Validación de confirmación de contraseña
- Botón deshabilitado hasta que ambas contraseñas sean válidas

## 🔒 Seguridad

### Validaciones del Frontend:
- **Prevención activa**: Bloquea entrada inválida en tiempo real
- **Sanitización de entrada**: Elimina caracteres no permitidos
- **Validación de longitud**: Previene ataques de buffer overflow
- **Filtrado de contenido**: Previene inyección de código malicioso

### Validaciones del Backend:
- **IMPORTANTE**: Las validaciones del frontend son solo para UX
- **SIEMPRE** validar en el backend para seguridad real
- Implementar rate limiting para prevenir spam
- Validar tokens y sesiones

## 📝 Mejoras Futuras

### Validaciones Adicionales:
- [ ] Validación de teléfono con formato internacional
- [ ] Validación de fecha de nacimiento
- [ ] Validación de DNI/pasaporte
- [ ] Validación de dirección postal
- [ ] Validación de archivos (tamaño, tipo, etc.)

### Funcionalidades:
- [ ] Guardado automático de formularios
- [ ] Validación de contraseñas contra diccionarios comunes
- [ ] Integración con servicios de verificación de email
- [ ] Validación de números de teléfono con SMS

## 🐛 Solución de Problemas

### Errores Comunes:
1. **Validación no se ejecuta**: Verificar que el campo esté marcado como "touched"
2. **Mensajes de error no aparecen**: Verificar que ValidationError esté importado
3. **Estilos no se aplican**: Verificar clases CSS de Tailwind
4. **Validación en tiempo real no funciona**: Verificar useEffect y dependencias
5. **Prevención no funciona**: Verificar que se use el componente correcto (LetterOnlyInput, etc.)

### Debugging:
```tsx
console.log('Form Data:', formData)
console.log('Errors:', errors)
console.log('Touched:', touched)
console.log('Is Form Valid:', isFormValid)
```

## 📚 Recursos

- [Documentación de React](https://reactjs.org/docs/forms.html)
- [Validación de Formularios](https://formik.org/docs/guides/validation)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)

---

**Nota**: Este sistema de validaciones está diseñado para mejorar la experiencia del usuario y prevenir errores comunes. Sin embargo, la seguridad real debe implementarse en el backend con validaciones más estrictas y medidas de seguridad adicionales.

## 🎯 **Resumen de Prevención Activa**

| Campo | Componente | Prevención | Características |
|-------|------------|------------|-----------------|
| **Nombres** | `LetterOnlyInput` | Solo letras, acentos, ñ | Bloquea números, símbolos, emojis + **Capitalización automática** + **Máx. 20 chars** |
| **Apellidos** | `LetterOnlyInput` | Solo letras, acentos, ñ | Bloquea números, símbolos, emojis + **Capitalización automática** + **Máx. 20 chars** |
| **Email** | `EmailInput` | Formato válido | Valida en tiempo real, advierte formato inválido |
| **Código** | `VerificationCodeInput` | Solo números | Bloquea letras, símbolos, espacios |
| **Contraseña** | `input[type="password"]` | Longitud y composición | Valida en tiempo real con indicador de fortaleza |

## 🗂️ **IMPORTACIONES RECOMENDADAS**

### **Para componentes básicos de UI:**
```tsx
import ValidationError from "../components/ui/ValidationError"
import { Button } from "../components/ui"
```

### **Para componentes de formularios:**
```tsx
import { 
  LetterOnlyInput, 
  EmailInput, 
  VerificationCodeInput, 
  PasswordStrength 
} from "../components/forms"
```

### **Para importaciones individuales:**
```tsx
import LetterOnlyInput from "../components/forms/LetterOnlyInput"
import EmailInput from "../components/forms/EmailInput"
```
