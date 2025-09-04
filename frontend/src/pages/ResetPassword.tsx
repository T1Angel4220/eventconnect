"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { resetPassword } from "../services/authService"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Lock, Sun, Moon, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react"
import { useTheme } from "../hooks/useTheme"
import { validatePassword, validateConfirmPassword } from "../utils/validations"
import ValidationError from "../components/ui/ValidationError"
import PasswordStrength from "../components/forms/PasswordStrength"
import ConfirmModal from "../components/ui/ConfirmModal"

const ResetPassword: React.FC = () => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  })
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: ""
  })
  const [touched, setTouched] = useState({
    newPassword: false,
    confirmPassword: false
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toggleTheme, isDark } = useTheme()

  const resetId = searchParams.get('resetId')

  // Guard: requerir permiso desde VerifyCode
  useEffect(() => {
    const canReset = sessionStorage.getItem('fp:canReset')
    const storedResetId = sessionStorage.getItem('fp:resetId')
    if (!canReset || canReset !== '1' || !storedResetId) {
      navigate('/forgot-password', { replace: true })
    }
  }, [navigate])

  // Validación en tiempo real
  useEffect(() => {
    if (touched.newPassword) {
      const passwordValidation = validatePassword(formData.newPassword)
      setErrors(prev => ({ ...prev, newPassword: passwordValidation.message }))
    }
  }, [formData.newPassword, touched.newPassword])

  useEffect(() => {
    if (touched.confirmPassword) {
      const confirmPasswordValidation = validateConfirmPassword(formData.newPassword, formData.confirmPassword)
      setErrors(prev => ({ ...prev, confirmPassword: confirmPasswordValidation.message }))
    }
  }, [formData.newPassword, formData.confirmPassword, touched.confirmPassword])

  // Manejar navegación hacia atrás con confirmación
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSuccess) {
        e.preventDefault()
        e.returnValue = 'Se cancelará el cambio de contraseña. ¿Deseas salir?'
        return e.returnValue
      }
    }

    const handlePopState = (e: PopStateEvent) => {
      if (!isSuccess) {
        e.preventDefault()
        setShowConfirmModal(true)
        // Empujar el estado actual de vuelta al historial
        window.history.pushState(null, '', window.location.href)
      }
    }

    // Agregar el estado actual al historial para poder detectar navegación hacia atrás
    window.history.pushState(null, '', window.location.href)

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isSuccess])

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
      newPassword: "",
      confirmPassword: ""
    }

    // Validar nueva contraseña
    const passwordValidation = validatePassword(formData.newPassword)
    newErrors.newPassword = passwordValidation.message

    // Validar confirmación de contraseña
    const confirmPasswordValidation = validateConfirmPassword(formData.newPassword, formData.confirmPassword)
    newErrors.confirmPassword = confirmPasswordValidation.message

    setErrors(newErrors)
    setTouched({ newPassword: true, confirmPassword: true })

    return !newErrors.newPassword && !newErrors.confirmPassword
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!resetId) {
      setError("Error: ID de reset no encontrado")
      return
    }

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

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
    navigate('/login', { replace: true })
  }

  const isFormValid = !errors.newPassword && !errors.confirmPassword && 
                     formData.newPassword && formData.confirmPassword

  if (!resetId) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-4">Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">No se encontró el ID de reset</p>
          <button
            onClick={() => navigate('/forgot-password', { replace: true })}
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white cursor-pointer transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a solicitar recuperación
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

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
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
                      onBlur={() => handleBlur('newPassword')}
                      className={`w-full pl-12 pr-14 py-4 bg-white border-2 rounded-xl focus:outline-none transition-all duration-200 text-black placeholder-gray-700 ${
                        errors.newPassword && touched.newPassword 
                          ? 'border-red-500 dark:border-red-500' 
                          : 'border-gray-700 dark:border-white focus:border-black dark:focus:border-white'
                      }`}
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
                  <ValidationError message={errors.newPassword} />
                  <PasswordStrength password={formData.newPassword} />
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
                      onBlur={() => handleBlur('confirmPassword')}
                      className={`w-full pl-12 pr-14 py-4 bg-white border-2 rounded-xl focus:outline-none transition-all duration-200 text-black placeholder-gray-500 ${
                        errors.confirmPassword && touched.confirmPassword 
                          ? 'border-red-500 dark:border-red-500' 
                          : 'border-gray-200 dark:border-white focus:border-black dark:focus:border-white'
                      }`}
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
                  <ValidationError message={errors.confirmPassword} />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !isFormValid}
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

        </div>

        {/* Back to Login Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => setShowConfirmModal(true)}
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Login
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-300">
            © 2025 Event Connect - Sistema de Gestión Universitaria
          </p>
        </div>
      </div>

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          // Limpiar estado de flujo y volver al login
          sessionStorage.removeItem('fp:canVerify')
          sessionStorage.removeItem('fp:userId')
          sessionStorage.removeItem('fp:email')
          sessionStorage.removeItem('fp:canReset')
          sessionStorage.removeItem('fp:resetId')
          navigate('/login', { replace: true })
        }}
        title="Cancelar cambio de contraseña"
        message="Se cancelará el cambio de contraseña y volverás al login. ¿Estás seguro?"
        confirmText="Sí, cancelar"
        cancelText="No, continuar"
        isDark={isDark}
      />
    </div>
  )
}

export default ResetPassword
