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
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toggleTheme, isDark } = useTheme()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-xl mb-6 flex items-center">
      <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full mr-3"></div>
      {error}
    </div>
  )}

  <form onSubmit={handleSubmit} className="space-y-6">
    {/* First Name y Last Name */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* First Name */}
      <div>
        <label htmlFor="firstName" className="block text-sm font-semibold text-black dark:text-white mb-3">
          Nombre
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <User className="h-5 w-5 text-gray-600 dark:text-gray-900 transition-colors duration-200" />
          </div>
          <input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="Tu nombre"
            value={formData.firstName}
            onChange={handleInputChange}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-black dark:focus:border-black focus:outline-none transition-colors duration-200 text-black placeholder-gray-500 dark:placeholder-gray-700"
            required
          />
        </div>
      </div>

      {/* Last Name */}
      <div>
        <label htmlFor="lastName" className="block text-sm font-semibold text-black dark:text-white mb-3">
          Apellido
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <User className="h-5 w-5 text-gray-600 dark:text-gray-900 transition-colors duration-200" />
          </div>
          <input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Tu apellido"
            value={formData.lastName}
            onChange={handleInputChange}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-black dark:focus:border-black focus:outline-none transition-colors duration-200 text-black placeholder-gray-500 dark:placeholder-gray-900"
            required
          />
        </div>
      </div>
    </div>

    {/* Email */}
    <div>
      <label htmlFor="email" className="block text-sm font-semibold text-black dark:text-white mb-3">
        Correo Electrónico
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <Mail className="h-5 w-5 text-gray-600 dark:text-gray-900 transition-colors duration-200" />
        </div>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-black dark:focus:border-white focus:outline-none transition-colors duration-200 text-black placeholder-gray-500 dark:placeholder-gray-900"
          required
        />
      </div>
    </div>

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
          className="w-full pl-12 pr-14 py-4 bg-gray-50 dark:bg-white-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-black dark:focus:border-white focus:outline-none transition-colors duration-200 text-black  placeholder-gray-500 dark:placeholder-gray-900"
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
          className="w-full pl-12 pr-14 py-4 bg-gray-50 dark:bg-white-900 border-2 border-black-900 dark:border-gray-700 rounded-xl focus:border-black dark:focus:border-white focus:outline-none transition-colors duration-200 text-black placeholder-gray-500 dark:placeholder-gray-900"
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
    </div>

    {/* Submit Button */}
    <button
      type="submit"
      disabled={isLoading}
      className="w-full bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl cursor-pointer"
    >
      {isLoading ? "Registrando..." : "Crear Cuenta"}
    </button>
  </form>


          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
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
          <p className="text-sm text-gray-500">© 2024 Event Connect - Sistema de Gestión Universitaria</p>
        </div>
      </div>
    </div>
  )
}

export default Register
