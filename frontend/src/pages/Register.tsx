"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { registerUser } from "../services/authService"
import { useNavigate, Link } from "react-router-dom"
import { Eye, EyeOff, User, Lock, Sun, Moon, ArrowLeft } from "lucide-react"
import { useTheme } from "../hooks/useTheme"
import { validateEmail, validatePassword, validateConfirmPassword, validateName } from "../utils/validations"
import ValidationError from "../components/ui/ValidationError"
import { PasswordStrength, LetterOnlyInput, EmailInput } from "../components/forms"

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
  })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toggleTheme, isDark } = useTheme()

  // Validación en tiempo real
  useEffect(() => {
    if (touched.firstName) {
      const firstNameValidation = validateName(formData.firstName, "Nombre")
      setErrors(prev => ({ ...prev, firstName: firstNameValidation.message }))
    }
  }, [formData.firstName, touched.firstName])

  useEffect(() => {
    if (touched.lastName) {
      const lastNameValidation = validateName(formData.lastName, "Apellido")
      setErrors(prev => ({ ...prev, lastName: lastNameValidation.message }))
    }
  }, [formData.lastName, touched.lastName])

  useEffect(() => {
    if (touched.email) {
      const emailValidation = validateEmail(formData.email)
      setErrors(prev => ({ ...prev, email: emailValidation.message }))
    }
  }, [formData.email, touched.email])

  useEffect(() => {
    if (touched.password) {
      const passwordValidation = validatePassword(formData.password)
      setErrors(prev => ({ ...prev, password: passwordValidation.message }))
    }
  }, [formData.password, touched.password])

  useEffect(() => {
    if (touched.confirmPassword) {
      const confirmPasswordValidation = validateConfirmPassword(formData.password, formData.confirmPassword)
      setErrors(prev => ({ ...prev, confirmPassword: confirmPasswordValidation.message }))
    }
  }, [formData.password, formData.confirmPassword, touched.confirmPassword])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    // Marcar como tocado para activar validaciones
    if (!touched[name as keyof typeof touched]) {
      setTouched(prev => ({ ...prev, [name]: true }))
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const validateForm = (): boolean => {
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    }

    // Validar nombre
    const firstNameValidation = validateName(formData.firstName, "Nombre")
    newErrors.firstName = firstNameValidation.message

    // Validar apellido
    const lastNameValidation = validateName(formData.lastName, "Apellido")
    newErrors.lastName = lastNameValidation.message

    // Validar email
    const emailValidation = validateEmail(formData.email)
    newErrors.email = emailValidation.message

    // Validar contraseña
    const passwordValidation = validatePassword(formData.password)
    newErrors.password = passwordValidation.message

    // Validar confirmación de contraseña
    const confirmPasswordValidation = validateConfirmPassword(formData.password, formData.confirmPassword)
    newErrors.confirmPassword = confirmPasswordValidation.message

    setErrors(newErrors)
    setTouched({ firstName: true, lastName: true, email: true, password: true, confirmPassword: true })

    return !Object.values(newErrors).some(error => error !== "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const data = await registerUser(formData.firstName, formData.lastName, formData.email, formData.password)

      localStorage.setItem("token", data.token)
      localStorage.setItem("role", data.role)
      navigate("/dashboard")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error en el registro"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = !Object.values(errors).some(error => error !== "") && 
                     Object.values(formData).every(value => value !== "")

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4 transition-colors duration-300">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
        aria-label="Cambiar tema"
      >
        {isDark ? <Sun className="h-6 w-6 text-yellow-500" /> : <Moon className="h-6 w-6 text-gray-700" />}
      </button>

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-black dark:bg-white rounded-2xl mb-6 shadow-lg">
            <User className="w-10 h-10 text-white dark:text-black" />
          </div>
          <h1 className="text-4xl font-bold text-black dark:text-white mb-3">Event Connect</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Registro de Organizador</p>
        </div>

      {/* Register Form */}
<div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-8 shadow-lg backdrop-blur-sm transition-colors duration-300">
  <h2 className="text-2xl font-bold text-black dark:text-white mb-8 text-center">Crear Cuenta</h2>
  {error && (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center">
      <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
      {error}
    </div>
  )}

  <form onSubmit={handleSubmit} className="space-y-6">
    {/* First Name y Last Name */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* First Name */}
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
        maxLength={15}
      />

      {/* Last Name */}
      <LetterOnlyInput
        id="lastName"
        name="lastName"
        value={formData.lastName}
        onChange={handleInputChange}
        onBlur={() => handleBlur('lastName')}
        placeholder="Tu apellido"
        label="Apellido"
        error={errors.lastName}
        touched={touched.lastName}
        required={true}
        maxLength={15}
      />
    </div>

    {/* Email */}
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

    {/* Password */}
    <div>
      <label htmlFor="password" className="block text-sm font-semibold text-black dark:text-white mb-3">
        Contraseña
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <Lock className="h-5 w-5 text-gray-600 dark:text-gray-900 transition-colors duration-200" />
        </div>
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={formData.password}
          onChange={handleInputChange}
          onBlur={() => handleBlur('password')}
          className={`w-full pl-12 pr-14 py-4 bg-gray-50 dark:bg-white border-2 rounded-xl focus:outline-none transition-colors duration-200 text-black placeholder-gray-500 dark:placeholder-gray-900 ${
            errors.password && touched.password 
              ? 'border-red-500 dark:border-red-500' 
              : 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white'
          }`}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-gray-600 dark:text-gray-900" />
          ) : (
            <Eye className="h-5 w-5 text-gray-600 dark:text-gray-900" />
          )}
        </button>
      </div>
      <ValidationError message={errors.password} />
      <PasswordStrength password={formData.password} />
    </div>

    {/* Confirm Password */}
    <div>
      <label htmlFor="confirmPassword" className="block text-sm font-semibold text-black dark:text-white mb-3">
        Confirmar Contraseña
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <Lock className="h-5 w-5 text-gray-600 dark:text-gray-900 transition-colors duration-200" />
        </div>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          onBlur={() => handleBlur('confirmPassword')}
          className={`w-full pl-12 pr-14 py-4 bg-gray-50 dark:bg-white border-2 rounded-xl focus:outline-none transition-colors duration-200 text-black placeholder-gray-500 dark:placeholder-gray-900 ${
            errors.confirmPassword && touched.confirmPassword 
              ? 'border-red-500 dark:border-red-500' 
              : 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white'
          }`}
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer"
        >
          {showConfirmPassword ? (
            <EyeOff className="h-5 w-5 text-gray-600 dark:text-gray-900" />
          ) : (
            <Eye className="h-5 w-5 text-gray-600 dark:text-gray-900" />
          )}
        </button>
      </div>
      <ValidationError message={errors.confirmPassword} />
    </div>

    {/* Submit Button */}
    <button
      type="submit"
      disabled={isLoading || !isFormValid}
      className="w-full bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl cursor-pointer"
    >
      {isLoading ? "Registrando..." : "Crear Cuenta"}
    </button>
  </form>


          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/login"
                className="text-black font-semibold dark:text-white hover:underline transition-colors duration-200 cursor-pointer"
              >
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Login Button */}
        <div className="text-center mt-6">
          <Link
            to="/login"
            className="inline-flex items-center text-gray-600 hover:text-black dark:text-white-700 dark:hover:text-white transition-colors duration-200 cursor-pointer"            >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Login
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">© 2024 Event Connect - Sistema de Gestión Universitaria</p>
        </div>
      </div>
    </div>
  )
}

export default Register
