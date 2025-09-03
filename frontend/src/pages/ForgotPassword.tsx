"use client"

import type React from "react"
import { useState } from "react"
import { forgotPassword } from "../services/authService"
import { useNavigate, Link } from "react-router-dom"
import { Mail, Sun, Moon, ArrowLeft, CheckCircle } from "lucide-react"
import { useTheme } from "../hooks/useTheme"

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  const navigate = useNavigate()
  const { toggleTheme, isDark } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const data = await forgotPassword(email)
      setIsSuccess(true)
      if (data.userId) {
        setUserId(data.userId)
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error solicitando recuperación"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinueToCode = () => {
    if (userId) {
      navigate(`/verify-code?userId=${userId}`)
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 dark:from-orange-400 dark:to-red-400 rounded-2xl mb-6 shadow-lg">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-black to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
            Event Connect
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Recuperar Contraseña</p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-3xl">
          {!isSuccess ? (
            <>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-8 text-center">¿Olvidaste tu contraseña?</h2>
              
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                No te preocupes, te enviaremos un código de verificación a tu email para restablecer tu contraseña.
              </p>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
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
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-black dark:focus:border-white focus:outline-none transition-all duration-200 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Enviando...
                    </div>
                  ) : (
                    "Enviar Código de Recuperación"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-6">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">¡Código Enviado!</h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Hemos enviado un código de verificación de 6 dígitos a <strong>{email}</strong>
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-xl mb-6">
                <p className="text-sm">
                  <strong>Importante:</strong> El código expira en 15 minutos. Revisa tu bandeja de entrada y también la carpeta de spam.
                </p>
              </div>

              <button
                onClick={handleContinueToCode}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl mb-4"
              >
                Ingresar Código de Verificación
              </button>

              <button
                onClick={() => {
                  setIsSuccess(false)
                  setError("")
                }}
                className="w-full text-gray-600 dark:text-gray-400 py-2 px-4 rounded-xl font-medium hover:text-black dark:hover:text-white transition-colors duration-200"
              >
                Cambiar Email
              </button>
            </div>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              ¿Recordaste tu contraseña?{" "}
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

export default ForgotPassword
