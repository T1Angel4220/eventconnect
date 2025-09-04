"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { forgotPassword } from "../services/authService"
import { useNavigate } from "react-router-dom"
import { Mail, Sun, Moon, ArrowLeft, CheckCircle } from "lucide-react"
import { useTheme } from "../hooks/useTheme"
import { validateEmail } from "../utils/validations"
import ValidationError from "../components/ui/ValidationError"

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  const [touched, setTouched] = useState(false)
  const navigate = useNavigate()
  const { toggleTheme, isDark } = useTheme()

  // Validación en tiempo real del email
  useEffect(() => {
    if (touched) {
      const emailValidation = validateEmail(email)
      setEmailError(emailValidation.message)
    }
  }, [email, touched])

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (error) setError("")
    
    if (!touched) {
      setTouched(true)
    }
  }

  const validateForm = (): boolean => {
    const emailValidation = validateEmail(email)
    setEmailError(emailValidation.message)
    setTouched(true)
    
    return emailValidation.isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setEmailError("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const data = await forgotPassword(email)
      setIsSuccess(true)
      if (data.userId) {
        setUserId(data.userId)
      }
    } catch (err: unknown) {
      let errorMessage = "Error solicitando recuperación"

      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === "object" && err !== null && "message" in err) {
        errorMessage = (err as any).message
      }

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

  const navigateToLogin = () => {
    navigate("/login")
  }

  const isFormValid = !emailError && email.length > 0

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
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black dark:bg-white rounded-2xl mb-4 shadow-lg">
            <Mail className="w-8 h-8 text-white dark:text-black" />
          </div>
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Event Connect</h1>
          <p className="text-gray-600 dark:text-gray-400 text-base">Recuperar Contraseña</p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-white rounded-2xl p-6 shadow-xl">
          {!isSuccess ? (
            <>
              <h2 className="text-xl font-bold text-black dark:text-white mb-4 text-center">
                ¿Olvidaste tu contraseña?
              </h2>

              <p className="text-gray-600 dark:text-gray-400 text-center mb-6 text-sm">
                No te preocupes, te enviaremos un código de verificación a tu email para restablecer tu contraseña.
              </p>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-4">
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    <span className="font-medium text-sm">{error}</span>
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Verifica que el correo esté correctamente escrito o{" "}
                    <button
                      onClick={() => console.log("Navigate to register")}
                      className="font-semibold underline hover:text-red-800 dark:hover:text-red-300 transition-colors duration-200 cursor-pointer"
                    >
                      regístrate
                    </button>{" "}
                    si no tienes una cuenta.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-black dark:text-white mb-2">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={handleEmailChange}
                      className={`w-full pl-10 pr-4 py-3 bg-white border rounded-lg focus:outline-none transition-all duration-200 text-black placeholder-gray-500 ${
                        emailError && touched 
                          ? 'border-red-500 dark:border-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white'
                      }`}
                      required
                    />
                  </div>
                  <ValidationError message={emailError} />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className="w-full bg-black dark:bg-white text-white dark:text-black py-3 px-4 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-black mr-2"></div>
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
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <CheckCircle className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>

              <h2 className="text-xl font-bold text-black dark:text-white mb-3">¡Código Enviado!</h2>

              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Hemos enviado un código de verificación de 6 dígitos a <strong>{email}</strong>
              </p>

              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg mb-4">
                <p className="text-xs">
                  <strong>Importante:</strong> El código expira en 15 minutos. Revisa tu bandeja de entrada y también la
                  carpeta de spam.
                </p>
              </div>

              <button
                onClick={handleContinueToCode}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-3 px-4 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all duration-200 cursor-pointer mb-3"
              >
                Ingresar Código de Verificación
              </button>

              <button
                onClick={() => {
                  setIsSuccess(false)
                  setError("")
                  setEmailError("")
                  setTouched(false)
                }}
                className="w-full text-gray-600 dark:text-gray-400 py-2 px-4 rounded-lg font-medium hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Cambiar Email
              </button>
            </div>
          )}

          {/* Login Link */}
          <div className="mt-4 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              ¿Recordaste tu contraseña?{" "}
              <button
                onClick={navigateToLogin}
                className="text-black dark:text-white font-medium hover:underline transition-colors duration-200 cursor-pointer"
              >
                Iniciar Sesión
              </button>
            </p>
          </div>
        </div>

        {/* Back to Login Button */}
        <div className="text-center mt-4">
          <button
            onClick={navigateToLogin}
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Login
          </button>
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

export default ForgotPassword
