"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { loginUser } from "../services/authService"
import { useNavigate, Link } from "react-router-dom"
import { Eye, EyeOff, User, Lock, Sun, Moon } from "lucide-react"
import { useTheme } from "../hooks/useTheme"
import { validateEmail } from "../utils/validations"
import ValidationError from "../components/ui/ValidationError"

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [errors, setErrors] = useState({
    email: "",
    password: ""
  })
  const [touched, setTouched] = useState({
    email: false,
    password: false
  })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toggleTheme, isDark } = useTheme()

  // Validación en tiempo real
  useEffect(() => {
    if (touched.email) {
      const emailValidation = validateEmail(formData.email)
      setErrors(prev => ({ ...prev, email: emailValidation.message }))
    }
  }, [formData.email, touched.email])

  useEffect(() => {
    if (touched.password) {
      if (!formData.password) {
        setErrors(prev => ({ ...prev, password: "La contraseña es requerida" }))
      } else {
        setErrors(prev => ({ ...prev, password: "" }))
      }
    }
  }, [formData.password, touched.password])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      email: "",
      password: ""
    }

    // Validar email
    const emailValidation = validateEmail(formData.email)
    newErrors.email = emailValidation.message

    // Validar password
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    }

    setErrors(newErrors)
    setTouched({ email: true, password: true })

    return !newErrors.email && !newErrors.password
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const data = await loginUser(formData.email, formData.password)
      localStorage.setItem("token", data.token)
      localStorage.setItem("role", data.role)
      navigate("/dashboard")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error en el login"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = !errors.email && !errors.password && formData.email && formData.password

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4 transition-colors duration-300">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        aria-label="Cambiar tema"
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-gray-700 dark:text-yellow-400" />
        ) : (
          <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-black dark:bg-white rounded-2xl mb-6 shadow-lg">
            <User className="w-10 h-10 text-white dark:text-black" />
          </div>
          <h1 className="text-4xl font-bold text-black dark:text-white mb-3">Event Connect</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Panel de Administración</p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-8 shadow-2xl backdrop-blur-sm transition-all duration-300">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-8 text-center">Iniciar Sesión</h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email/Username Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-black dark:text-white mb-3">
                Usuario o Correo Electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 dark:text-gray-600 group-focus-within:text-black dark:group-focus-within:text-black transition-colors duration-200" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  placeholder="usuario@ejemplo.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('email')}
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white border-2 rounded-xl focus:outline-none transition-all duration-200 text-black dark:text-black placeholder-gray-500 dark:placeholder-gray-600 ${
                    errors.email && touched.email 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-200 dark:border-gray-300 focus:border-black dark:focus:border-gray-600'
                  }`}
                  required
                />
              </div>
              <ValidationError message={errors.email} />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-black dark:text-white mb-3">
                Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-600 group-focus-within:text-black dark:group-focus-within:text-black transition-colors duration-200" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('password')}
                  className={`w-full pl-12 pr-14 py-4 bg-gray-50 dark:bg-white border-2 rounded-xl focus:outline-none transition-all duration-200 text-black dark:text-black placeholder-gray-500 dark:placeholder-gray-600 ${
                    errors.password && touched.password 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-200 dark:border-gray-300 focus:border-black dark:focus:border-gray-600'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-black dark:hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                  )}
                </button>
              </div>
              <ValidationError message={errors.password} />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-4 px-6 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-black mr-3"></div>
                  Ingresando...
                </div>
              ) : (
                "Ingresar al Panel"
              )}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-4 text-center">
            <Link
              to="/forgot-password"
              className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-gray-600 transition-colors duration-200 text-sm"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              ¿No tienes una cuenta?{" "}
              <Link
                to="/register"
                className="text-black dark:text-white font-semibold hover:underline transition-colors duration-200"
              >
                Regístrate
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 Event Connect - Sistema de Gestión Universitaria
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
