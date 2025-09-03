"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { verifyResetCode } from "../services/authService"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { Shield, Sun, Moon, ArrowLeft, CheckCircle, Clock } from "lucide-react"
import { useTheme } from "../hooks/useTheme"

const VerifyCode: React.FC = () => {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [resetId, setResetId] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutos en segundos
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toggleTheme, isDark } = useTheme()

  const userId = searchParams.get('userId')

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!userId) {
      setError("Error: ID de usuario no encontrado")
      setIsLoading(false)
      return
    }

    if (code.length !== 6) {
      setError("Por favor ingresa el código completo de 6 dígitos")
      setIsLoading(false)
      return
    }

    try {
      const data = await verifyResetCode(parseInt(userId), code)
      setResetId(data.resetId)
      setIsSuccess(true)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error verificando código"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinueToReset = () => {
    if (resetId) {
      navigate(`/reset-password?resetId=${resetId}`)
    }
  }

  const handleResendCode = () => {
    navigate('/forgot-password')
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-black dark:via-gray-900 dark:to-black flex items-center justify-center px-4">
        <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-4">Error</h2>          <p className="text-gray-600 dark:text-gray-300 mb-6">No se encontró el ID de usuario</p>
        <button
            onClick={handleResendCode}
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white cursor-pointer transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a solicitar código
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4 transition-colors duration-300">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-black border-2 border-gray-200 dark:border-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        aria-label="Cambiar tema"
      >
        {isDark ? <Sun className="h-6 w-6 text-yellow-500" /> : <Moon className="h-6 w-6 text-black" />}
      </button>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-black dark:bg-white rounded-2xl mb-6 shadow-lg">
            <Shield className="w-10 h-10 text-white dark:text-black" />
          </div>
          <h1 className="text-4xl font-bold text-black dark:text-white mb-3">Event Connect</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Verificar Código</p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-white rounded-2xl p-8 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-3xl">
          {!isSuccess ? (
            <>
              <h2 className="text-2xl font-bold text-black dark:text-white mb-8 text-center">Ingresa el Código</h2>

              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Hemos enviado un código de 6 dígitos a tu email. Ingresa el código para continuar.
              </p>

              {/* Timer */}
              <div className="flex items-center justify-center mb-6">
                <Clock className="h-5 w-5 text-orange-500 mr-2" />
                <span
                  className={`text-sm font-medium ${timeLeft < 300 ? "text-red-500" : "text-gray-600 dark:text-gray-300"}`}
                >
                  Tiempo restante: {formatTime(timeLeft)}
                </span>
              </div>

              {error && (
                <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-400 px-4 py-3 rounded-xl mb-6 flex items-center">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Code Input */}
                <div>
                  <label htmlFor="code" className="block text-sm font-semibold text-black dark:text-white mb-3">
                    Código de Verificación
                  </label>
                  <div className="relative group">
                    <input
                      id="code"
                      type="text"
                      placeholder="000000"
                      value={code}
                      onChange={handleCodeChange}
                      className="w-full text-center text-2xl font-mono tracking-widest py-4 bg-white border-2 border-gray-200 dark:border-white rounded-xl focus:border-black dark:focus:border-white focus:outline-none transition-all duration-200 text-black placeholder-gray-400"
                      maxLength={6}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-300 mt-2 text-center">
                    Ingresa el código de 6 dígitos que recibiste por email
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || code.length !== 6 || timeLeft === 0}
                  className="w-full bg-white text-black border-2 border-black py-4 px-6 rounded-xl font-semibold hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-black/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                      Verificando...
                    </div>
                  ) : (
                    "Verificar Código"
                  )}
                </button>
              </form>

              {/* Resend Code */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">¿No recibiste el código?</p>
                <button
                  onClick={handleResendCode}
                  className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-semibold hover:underline transition-colors duration-200 cursor-pointer"
                >
                  Solicitar nuevo código
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-900/20 rounded-full mb-6">
                <CheckCircle className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>

              <h2 className="text-2xl font-bold text-black dark:text-white mb-4">¡Código Verificado!</h2>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Tu código ha sido verificado correctamente. Ahora puedes establecer una nueva contraseña.
              </p>

              <button
                onClick={handleContinueToReset}
                className="w-full bg-white text-black border-2 border-black py-4 px-6 rounded-xl font-semibold hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-black/20 transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl"
              >
                Establecer Nueva Contraseña
              </button>
            </div>
          )}

          {/* Back to Forgot Password */}
          <div className="mt-6 text-center">

          </div>
        </div>


        {/* Back to Login Button */}
        <div className="text-center mt-6">
          <Link
            to="/login"
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-200"
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

export default VerifyCode
