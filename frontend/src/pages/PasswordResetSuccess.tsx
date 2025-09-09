"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle, Sun, Moon, Lock } from "lucide-react"
import { useTheme } from "../hooks/useTheme"

const PasswordResetSuccess: React.FC = () => {
  const navigate = useNavigate()
  const { toggleTheme, isDark } = useTheme()

  // Obtener el email del usuario del sessionStorage si está disponible
  const email = sessionStorage.getItem('fp:email') || 'tu email'

  const handleGoToLogin = () => {
    // Limpiar datos temporales del flujo de recuperación
    sessionStorage.removeItem('fp:email')
    sessionStorage.removeItem('fp:userId')
    sessionStorage.removeItem('fp:canVerify')
    sessionStorage.removeItem('fp:canReset')
    sessionStorage.removeItem('fp:resetId')
    sessionStorage.removeItem('fp:transition')
    sessionStorage.removeItem('fp:backFromVerify')
    navigate('/login', { replace: true })
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

        {/* Success Message */}
        <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-8 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-3xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-6">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>

            <h2 className="text-2xl font-bold text-black dark:text-white mb-4">¡Contraseña Actualizada!</h2>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>

            <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-400 px-4 py-3 rounded-xl mb-6">
              <p className="text-sm">
                <strong>Confirmación enviada:</strong> Hemos enviado un email de confirmación a <strong>{email}</strong>.
              </p>
            </div>

            <button
              onClick={handleGoToLogin}
              className="w-full bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20 transition-all duration-300 transform hover:scale-105 active:scale-[0.98] shadow-lg hover:shadow-xl cursor-pointer"
            >
              Ir al Login
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2025 Event Connect - Sistema de Gestión Universitaria
          </p>
        </div>
      </div>
    </div>
  )
}

export default PasswordResetSuccess
