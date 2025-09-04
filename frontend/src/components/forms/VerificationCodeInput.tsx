import React, { useState, useRef, useEffect } from 'react'
import { Shield } from 'lucide-react'

interface VerificationCodeInputProps {
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
  maxLength?: number
  className?: string
}

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
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
  maxLength = 6,
  className = ''
}) => {
  const [localValue, setLocalValue] = useState(value)
  const [showWarning, setShowWarning] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sincronizar valor local con el valor del padre
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Función para filtrar solo números
  const filterNumbersOnly = (input: string): string => {
    return input.replace(/\D/g, '').slice(0, maxLength)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const filteredValue = filterNumbersOnly(inputValue)
    
    // Mostrar advertencia si se intentó ingresar caracteres inválidos
    if (inputValue !== filteredValue) {
      setShowWarning(true)
      setTimeout(() => setShowWarning(false), 3000)
    }

    setLocalValue(filteredValue)
    
    // Crear un evento sintético con el valor filtrado
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name,
        value: filteredValue
      }
    } as React.ChangeEvent<HTMLInputElement>
    
    onChange(syntheticEvent)
  }

  // Prevenir pegado de contenido inválido
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const filteredText = filterNumbersOnly(pastedText)
    
    if (pastedText !== filteredText) {
      setShowWarning(true)
      setTimeout(() => setShowWarning(false), 3000)
    }
    
    setLocalValue(filteredText)
    
    // Crear evento sintético
    const syntheticEvent = {
      target: {
        name,
        value: filteredText
      }
    } as React.ChangeEvent<HTMLInputElement>
    
    onChange(syntheticEvent)
  }

  // Prevenir arrastrar y soltar contenido inválido
  const handleDrop = (e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault()
    const droppedText = e.dataTransfer.getData('text')
    const filteredText = filterNumbersOnly(droppedText)
    
    if (droppedText !== filteredText) {
      setShowWarning(true)
      setTimeout(() => setShowWarning(false), 3000)
    }
    
    setLocalValue(filteredText)
    
    // Crear evento sintético
    const syntheticEvent = {
      target: {
        name,
        value: filteredText
      }
    } as React.ChangeEvent<HTMLInputElement>
    
    onChange(syntheticEvent)
  }

  // Prevenir teclas no permitidas
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir teclas de navegación y edición
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', 'PageUp', 'PageDown'
    ]
    
    if (allowedKeys.includes(e.key)) {
      return
    }
    
    // Permitir números
    if (/^\d$/.test(e.key)) {
      return
    }
    
    // Bloquear cualquier otra tecla
    e.preventDefault()
    setShowWarning(true)
    setTimeout(() => setShowWarning(false), 2000)
  }

  const getBorderColor = () => {
    if (error && touched) {
      return 'border-red-500 dark:border-red-500'
    }
    if (showWarning) {
      return 'border-yellow-500 dark:border-yellow-500'
    }
    return 'border-gray-200 dark:border-white focus:border-black dark:focus:border-white'
  }

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-semibold text-black dark:text-white mb-3">
        {label} {required && '*'}
      </label>
      
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <Shield className="h-5 w-5 text-gray-600 dark:text-gray-900 transition-colors duration-200" />
        </div>
        
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          placeholder={placeholder}
          value={localValue}
          onChange={handleInputChange}
          onBlur={onBlur}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
          className={`w-full text-center text-2xl font-mono tracking-widest py-4 bg-white border-2 rounded-xl focus:outline-none transition-all duration-200 text-black placeholder-gray-400 ${getBorderColor()} ${className}`}
          required={required}
        />
        
        {/* Indicador de caracteres restantes */}
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
          <span className="text-xs text-gray-400 dark:text-gray-600">
            {localValue.length}/{maxLength}
          </span>
        </div>
      </div>
      
      {/* Mensaje de advertencia */}
      {showWarning && (
        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-xs text-yellow-700 dark:text-yellow-400">
            ⚠️ Solo se permiten números. Los caracteres no válidos han sido removidos.
          </p>
        </div>
      )}
      
      {/* Mensaje de ayuda */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
        Ingresa el código de {maxLength} dígitos que recibiste por email
      </p>
    </div>
  )
}

export default VerificationCodeInput
