// Funciones de validación para el proyecto Event Connect

export interface ValidationResult {
  isValid: boolean
  message: string
}

// Validación de email
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, message: "El email es requerido" }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Formato de email inválido" }
  }
  
  return { isValid: true, message: "" }
}

// Validación de contraseña
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: "La contraseña es requerida" }
  }
  
  if (password.length < 8) {
    return { isValid: false, message: "La contraseña debe tener al menos 8 caracteres" }
  }
  
  if (password.length > 128) {
    return { isValid: false, message: "La contraseña no puede exceder 128 caracteres" }
  }
  
  // Validar que contenga al menos una letra y un número
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  
  if (!hasLetter || !hasNumber) {
    return { isValid: false, message: "La contraseña debe contener al menos una letra y un número" }
  }
  
  return { isValid: true, message: "" }
}

// Validación de confirmación de contraseña
export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, message: "Confirma tu contraseña" }
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, message: "Las contraseñas no coinciden" }
  }
  
  return { isValid: true, message: "" }
}

// Validación de nombres (solo letras, sin números ni espacios)
export const validateName = (name: string, fieldName: string = "Nombre"): ValidationResult => {
  if (!name) {
    return { isValid: false, message: `El ${fieldName.toLowerCase()} es requerido` }
  }
  
  if (name.length < 2) {
    return { isValid: false, message: `El ${fieldName.toLowerCase()} debe tener al menos 2 caracteres` }
  }
  
  if (name.length > 50) {
    return { isValid: false, message: `El ${fieldName.toLowerCase()} no puede exceder 50 caracteres` }
  }
  
  // Solo letras, sin números ni espacios
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/
  if (!nameRegex.test(name)) {
    return { isValid: false, message: `El ${fieldName.toLowerCase()} solo puede contener letras` }
  }
  
  return { isValid: true, message: "" }
}

// Validación de usuario (letras, números y guiones bajos, sin espacios)
export const validateUsername = (username: string): ValidationResult => {
  if (!username) {
    return { isValid: false, message: "El usuario es requerido" }
  }
  
  if (username.length < 3) {
    return { isValid: false, message: "El usuario debe tener al menos 3 caracteres" }
  }
  
  if (username.length > 30) {
    return { isValid: false, message: "El usuario no puede exceder 30 caracteres" }
  }
  
  // Solo letras, números y guiones bajos, sin espacios
  const usernameRegex = /^[a-zA-Z0-9_]+$/
  if (!usernameRegex.test(username)) {
    return { isValid: false, message: "El usuario solo puede contener letras, números y guiones bajos" }
  }
  
  return { isValid: true, message: "" }
}

// Validación de código de verificación
export const validateVerificationCode = (code: string): ValidationResult => {
  if (!code) {
    return { isValid: false, message: "El código de verificación es requerido" }
  }
  
  if (code.length !== 6) {
    return { isValid: false, message: "El código debe tener exactamente 6 dígitos" }
  }
  
  // Solo números
  const codeRegex = /^\d{6}$/
  if (!codeRegex.test(code)) {
    return { isValid: false, message: "El código solo puede contener números" }
  }
  
  return { isValid: true, message: "" }
}

// Validación de teléfono (opcional, pero si se proporciona debe ser válido)
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: true, message: "" } // El teléfono es opcional
  }
  
  // Formato: +XX XXX XXX XXXX o XXX XXX XXXX
  const phoneRegex = /^(\+\d{1,3}\s?)?\d{3}\s?\d{3}\s?\d{4}$/
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return { isValid: false, message: "Formato de teléfono inválido" }
  }
  
  return { isValid: true, message: "" }
}

// Validación de longitud mínima y máxima
export const validateLength = (value: string, min: number, max: number, fieldName: string): ValidationResult => {
  if (!value) {
    return { isValid: false, message: `El ${fieldName.toLowerCase()} es requerido` }
  }
  
  if (value.length < min) {
    return { isValid: false, message: `El ${fieldName.toLowerCase()} debe tener al menos ${min} caracteres` }
  }
  
  if (value.length > max) {
    return { isValid: false, message: `El ${fieldName.toLowerCase()} no puede exceder ${max} caracteres` }
  }
  
  return { isValid: true, message: "" }
}

// Validación de que no contenga espacios
export const validateNoSpaces = (value: string, fieldName: string): ValidationResult => {
  if (!value) {
    return { isValid: true, message: "" }
  }
  
  if (/\s/.test(value)) {
    return { isValid: false, message: `El ${fieldName.toLowerCase()} no puede contener espacios` }
  }
  
  return { isValid: true, message: "" }
}

// Validación de que no contenga números
export const validateNoNumbers = (value: string, fieldName: string): ValidationResult => {
  if (!value) {
    return { isValid: true, message: "" }
  }
  
  if (/\d/.test(value)) {
    return { isValid: false, message: `El ${fieldName.toLowerCase()} no puede contener números` }
  }
  
  return { isValid: true, message: "" }
}

// Validación de que solo contenga letras
export const validateOnlyLetters = (value: string, fieldName: string): ValidationResult => {
  if (!value) {
    return { isValid: true, message: "" }
  }
  
  const lettersRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
  if (!lettersRegex.test(value)) {
    return { isValid: false, message: `El ${fieldName.toLowerCase()} solo puede contener letras` }
  }
  
  return { isValid: true, message: "" }
}

// Validación de contraseña fuerte
export const validateStrongPassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: "La contraseña es requerida" }
  }
  
  if (password.length < 8) {
    return { isValid: false, message: "La contraseña debe tener al menos 8 caracteres" }
  }
  
  if (password.length > 128) {
    return { isValid: false, message: "La contraseña no puede exceder 128 caracteres" }
  }
  
  // Validar que contenga al menos una letra mayúscula, una minúscula y un número
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  
  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return { isValid: false, message: "La contraseña debe contener al menos una mayúscula, una minúscula y un número" }
  }
  
  return { isValid: true, message: "" }
}

// Función para obtener fortaleza de contraseña
export const getPasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong', score: number } => {
  let score = 0
  
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  
  if (score <= 2) return { strength: 'weak', score }
  if (score <= 4) return { strength: 'medium', score }
  return { strength: 'strong', score }
}
