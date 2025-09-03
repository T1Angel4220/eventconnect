"use client"

import type React from "react"
import { useState } from "react"
import { loginUser } from "../services/authService"
import { useNavigate, Link } from "react-router-dom"
import { Eye, EyeOff, User, Lock, Sun, Moon } from "lucide-react"
import { useTheme } from "../hooks/useTheme"

const Login: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toggleTheme, isDark } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const data = await loginUser(email, password)
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
                  type="text"
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white border-2 border-gray-200 dark:border-gray-300 rounded-xl focus:border-black dark:focus:border-gray-600 focus:outline-none transition-all duration-200 text-black dark:text-black placeholder-gray-500 dark:placeholder-gray-600"
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
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-600 group-focus-within:text-black dark:group-focus-within:text-black transition-colors duration-200" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-14 py-4 bg-gray-50 dark:bg-white border-2 border-gray-200 dark:border-gray-300 rounded-xl focus:border-black dark:focus:border-gray-600 focus:outline-none transition-all duration-200 text-black dark:text-black placeholder-gray-500 dark:placeholder-gray-600"
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
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
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
