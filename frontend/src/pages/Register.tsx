"use client"

import type React from "react"
import { useState } from "react"
import { registerUser } from "../services/authService"
import { useNavigate, Link } from "react-router-dom"
import { Eye, EyeOff, User, Lock, Mail, Sun, Moon, ArrowLeft } from "lucide-react"
import { useTheme } from "../hooks/useTheme"

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toggleTheme, isDark } = useTheme()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validaciones del frontend
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setIsLoading(false)
      return
    }

    try {
      const data = await registerUser(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password
      )
      
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 transition-colors duration-300">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        aria-label="Cambiar tema"
      >
        {isDark ? (
          <Sun className="h-6 w-6 text-yellow-500" />
        ) : (
          <Moon className="h-6 w-6 text-gray-700" />
        )}
      </button>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-black to-gray-800 dark:from-white dark:to-gray-200 rounded-2xl mb-6 shadow-lg">
            <User className="w-10 h-10 text-white dark:text-black" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-black to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
            Event Connect
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Registro de Organizador</p>
        </div>

        {/* Register Form */}
        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-3xl">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-8 text-center">Crear Cuenta</h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Name Input */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-black dark:text-white mb-3">
                Nombre
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-black dark:group-focus-within:text-white transition-colors duration-200" />
                </div>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Tu nombre"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-black dark:focus:border-white focus:outline-none transition-all duration-200 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>
            </div>

            {/* Last Name Input */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-black dark:text-white mb-3">
                Apellido
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-black dark:group-focus-within:text-white transition-colors duration-200" />
                </div>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Tu apellido"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-black dark:focus:border-white focus:outline-none transition-all duration-200 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-black dark:text-white mb-3">
                Correo Electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-black dark:group-focus-within:text-white transition-colors duration-200" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-black dark:focus:border-white focus:outline-none transition-all duration-200 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-black dark:text-white mb-3">
                Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-black dark:group-focus-within:text-white transition-colors duration-200" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-14 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-black dark:focus:border-white focus:outline-none transition-all duration-200 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-black dark:hover:text-white transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-black dark:text-white mb-3">
                Confirmar Contraseña
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-black dark:group-focus-within:text-white transition-colors duration-200" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-14 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-black dark:focus:border-white focus:outline-none transition-all duration-200 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-black dark:hover:text-white transition-colors duration-200"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-black to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-black py-4 px-6 rounded-xl font-semibold hover:from-gray-800 hover:to-black dark:hover:from-gray-200 dark:hover:to-white focus:outline-none focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-black mr-3"></div>
                  Registrando...
                </div>
              ) : (
                "Crear Cuenta de Organizador"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/login"
                className="text-black dark:text-white font-semibold hover:underline transition-colors duration-200"
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
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Login
          </Link>
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

export default Register
