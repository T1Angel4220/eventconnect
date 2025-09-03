"use client"

import type React from "react"
import { useState } from "react"
import { resetPassword } from "../services/authService"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { Lock, Sun, Moon, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react"
import { useTheme } from "../hooks/useTheme"

const ResetPassword: React.FC = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toggleTheme, isDark } = useTheme()

  const resetId = searchParams.get('resetId')

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

    if (!resetId) {
      setError("Error: ID de reset no encontrado")
      setIsLoading(false)
      return
    }

    // Validaciones del frontend
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    if (formData.newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setIsLoading(false)
      return
    }

    try {
      await resetPassword(parseInt(resetId), formData.newPassword)
      setIsSuccess(true)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error actualizando contraseña"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoToLogin = () => {
    navigate('/login')
  }
  if (!resetId) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-4">Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">No se encontró el ID de reset</p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white cursor-pointer transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a solicitar recuperación
          </Link>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4 transition-colors duration-300">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-black border-2 border-gray-200 dark:border-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
        aria-label="Cambiar tema"
      >
        {isDark ? <Sun className="h-6 w-6 text-yellow-500" /> : <Moon className="h-6 w-6 text-black" />}
      </button>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-black dark:bg-white rounded-2xl mb-6 shadow-lg">
            <Lock className="w-10 h-10 text-white dark:text-black" />
          </div>
          <h1 className="text-4xl font-bold text-black dark:text-white mb-3">Event Connect</h1>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-8 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-3xl">
          {!isSuccess ? (
            <>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-8 text-center">
                Establecer Nueva Contraseña
              </h2>

              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              </p>

              {error && (
                <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-400 px-4 py-3 rounded-xl mb-6 flex items-center">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password Input */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-semibold text-black dark:text-white mb-3">
                    Nueva Contraseña
                  </label>
                  <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Lock className="h-5 w-5 text-gray-700 dark:text-gray-700 transition-colors duration-200" />
                  </div>
                  <input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-14 py-4 bg-white border-2 border-gray-700 dark:border-white rounded-xl focus:border-black dark:focus:border-white focus:outline-none transition-all duration-200 text-black placeholder-gray-700"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-black-700 dark:text-gray-700" />
                      ) : (
                        <Eye className="h-5 w-5 text-black-700 dark:text-gray-700" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-black dark:text-white mb-3"
                  >
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <Lock className="h-5 w-5 text-gray-700 dark:text-gray-700 transition-colors duration-200" />
                    </div>
                                        <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-14 py-4 bg-white border-2 border-gray-200 dark:border-white rounded-xl focus:border-black dark:focus:border-white focus:outline-none transition-all duration-200 text-black placeholder-gray-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-black-700 dark:text-gray-700" />
                      ) : (
                        <Eye className="h-5 w-5 text-black-700 dark:text-gray-700" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-400 font-medium mb-2">Requisitos de contraseña:</p>
                  <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Mínimo 6 caracteres</li>
                    <li>• Debe coincidir en ambos campos</li>
                    <li>• Recomendamos usar mayúsculas, minúsculas y números</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-black border-2 border-black py-4 px-6 rounded-xl font-semibold hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-black/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-[0.98] shadow-lg hover:shadow-xl cursor-pointer"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                      Actualizando...
                    </div>
                  ) : (
                    "Actualizar Contraseña"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-900/20 rounded-full mb-6">
                <CheckCircle className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>

              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">¡Contraseña Actualizada!</h2>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
              </p>

              <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-400 px-4 py-3 rounded-xl mb-6">
                <p className="text-sm">
                  <strong>Importante:</strong> Hemos enviado un email de confirmación a tu correo electrónico.
                </p>
              </div>

              <button
                onClick={handleGoToLogin}
                className="w-full bg-white text-black border-2 border-black py-4 px-6 rounded-xl font-semibold hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-black/20 transition-all duration-300 transform hover:scale-105 active:scale-[0.98] shadow-lg hover:shadow-xl cursor-pointer"
              >
                Ir al Login
              </button>
            </div>
          )}

          {/* Back to Verify Code */}
          {!isSuccess && (
            <div className="mt-6 text-center">
              <Link
                to="/verify-code"
                className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer"
              >
              </Link>
            </div>
          )}
        </div>

        {/* Back to Login Button */}
        <div className="text-center mt-6">
          <Link
            to="/login"
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Login
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-300">
            © 2024 Event Connect - Sistema de Gestión Universitaria
          </p>
        </div>
      </div>
    </div>
  )
}
export default ResetPassword
