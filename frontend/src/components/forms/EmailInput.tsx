import React, { useState, useRef, useEffect } from 'react'
import { Mail } from 'lucide-react'

interface EmailInputProps {
  id: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: () => void
  placeholder: string
  label: string
  error?: string
  touched?: boolean
  required?: boolean
  className?: string
}

const EmailInput: React.FC<EmailInputProps> = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  label,
  error,
  touched = false,
  required = false,
  className = ''
}) => {
  const [localValue, setLocalValue] = useState(value)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Sincronizar valor local con el valor del padre
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Función para validar formato de email en tiempo real
  const validateEmailFormat = (email: string): { isValid: boolean; message: string } => {
    if (!email) {
      return { isValid: false, message: '' }
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Formato de email inválido' }
    }
    
    return { isValid: true, message: '' }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setLocalValue(inputValue)
    
    // Validar en tiempo real
    const validation = validateEmailFormat(inputValue)
    
    if (inputValue && !validation.isValid) {
      setShowWarning(true)
      setWarningMessage(validation.message)
      setTimeout(() => setShowWarning(false), 3000)
    } else {
      setShowWarning(false)
    }
    
    onChange(e)
  }

  // Prevenir pegado de contenido inválido
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text')
    const validation = validateEmailFormat(pastedText)
    
    if (pastedText && !validation.isValid) {
      setShowWarning(true)
      setWarningMessage('Email pegado con formato inválido')
      setTimeout(() => setShowWarning(false), 3000)
    }
  }

  // Prevenir arrastrar y soltar contenido inválido
  const handleDrop = (e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault()
    const droppedText = e.dataTransfer.getData('text')
    const validation = validateEmailFormat(droppedText)
    
    if (droppedText && !validation.isValid) {
      setShowWarning(true)
      setWarningMessage('Email arrastrado con formato inválido')
      setTimeout(() => setShowWarning(false), 3000)
    }
  }

  const getBorderColor = () => {
    if (error && touched) {
      return 'border-red-500 dark:border-red-500'
    }
    if (showWarning) {
      return 'border-yellow-500 dark:border-yellow-500'
    }
    return 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white'
  }

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-semibold text-black dark:text-white mb-3">
        {label} {required && '*'}
      </label>
      
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <Mail className="h-5 w-5 text-gray-600 dark:text-gray-900 transition-colors duration-200" />
        </div>
        
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="email"
          placeholder={placeholder}
          value={localValue}
          onChange={handleInputChange}
          onBlur={onBlur}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white border-2 rounded-xl focus:outline-none transition-colors duration-200 text-black placeholder-gray-500 dark:placeholder-gray-700 ${getBorderColor()} ${className}`}
          required={required}
        />
      </div>
      
      {/* Mensaje de advertencia */}
      {showWarning && (
        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-xs text-yellow-700 dark:text-yellow-400">
            ⚠️ {warningMessage}
          </p>
        </div>
      )}
      
      {/* Mensaje de ayuda */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Formato: usuario@dominio.com
      </p>
    </div>
  )
}

export default EmailInput
