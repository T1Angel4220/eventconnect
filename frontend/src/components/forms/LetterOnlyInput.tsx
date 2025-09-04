import React, { useState, useRef, useEffect } from 'react'
import { User } from 'lucide-react'

interface LetterOnlyInputProps {
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

const LetterOnlyInput: React.FC<LetterOnlyInputProps> = ({
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
  maxLength = 15, // Reducido de 50 a 20 caracteres
  className = ''
}) => {
  const [localValue, setLocalValue] = useState(value)
  const [showWarning, setShowWarning] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sincronizar valor local con el valor del padre
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Función para filtrar solo letras, acentos, ñ y espacios
  const filterLettersOnly = (input: string): string => {
    return input
      .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') // Solo letras, acentos, ñ y espacios
      .replace(/\s+/g, ' ') // Reemplaza múltiples espacios con uno solo
      .trim() // Elimina espacios al inicio y final
  }

  // Función para aplicar capitalización automática
  const applyAutoCapitalization = (input: string): string => {
    if (!input) return input
    
    // Dividir por espacios para manejar múltiples palabras
    return input
      .split(' ')
      .map(word => {
        if (word.length === 0) return word
        
        // Primera letra mayúscula, resto minúsculas
        const firstChar = word.charAt(0).toUpperCase()
        const restOfWord = word.slice(1).toLowerCase()
        return firstChar + restOfWord
      })
      .join(' ')
      .trim() // Eliminar espacios extra al inicio y final
  }

  // Función para validar si el input contiene caracteres no permitidos
  const hasInvalidCharacters = (input: string): boolean => {
    return /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(input)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const filteredValue = filterLettersOnly(inputValue)
    
    // Mostrar advertencia si se intentó ingresar caracteres inválidos
    if (inputValue !== filteredValue) {
      setShowWarning(true)
      setTimeout(() => setShowWarning(false), 3000) // Ocultar después de 3 segundos
    }

    // Aplicar capitalización automática
    const capitalizedValue = applyAutoCapitalization(filteredValue)
    
    setLocalValue(capitalizedValue)
    
    // Crear un evento sintético con el valor filtrado y capitalizado
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name,
        value: capitalizedValue
      }
    } as React.ChangeEvent<HTMLInputElement>
    
    onChange(syntheticEvent)
  }

  // Prevenir pegado de contenido inválido
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const filteredText = filterLettersOnly(pastedText)
    const capitalizedText = applyAutoCapitalization(filteredText)
    
    if (pastedText !== filteredText) {
      setShowWarning(true)
      setTimeout(() => setShowWarning(false), 5000)
    }
    
    setLocalValue(capitalizedText)
    
    // Crear evento sintético
    const syntheticEvent = {
      target: {
        name,
        value: capitalizedText
      }
    } as React.ChangeEvent<HTMLInputElement>
    
    onChange(syntheticEvent)
  }

  // Prevenir arrastrar y soltar contenido inválido
  const handleDrop = (e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault()
    const droppedText = e.dataTransfer.getData('text')
    const filteredText = filterLettersOnly(droppedText)
    const capitalizedText = applyAutoCapitalization(filteredText)
    
    if (droppedText !== filteredText) {
      setShowWarning(true)
      setTimeout(() => setShowWarning(false), 3000)
    }
    
    setLocalValue(capitalizedText)
    
    // Crear evento sintético
    const syntheticEvent = {
      target: {
        name,
        value: capitalizedText
      }
    } as React.ChangeEvent<HTMLInputElement>
    
    onChange(syntheticEvent)
  }

  // Prevenir teclas no permitidas - PERMITIR mayúsculas para conversión automática
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
    
    // Permitir espacios
    if (e.key === ' ') {
      return
    }
    
    // ✅ PERMITIR TODAS las letras (mayúsculas y minúsculas), acentos y ñ
    // La conversión a formato correcto se hará automáticamente en handleInputChange
    if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]$/.test(e.key)) {
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
    return 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-black'
  }

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-semibold text-black dark:text-white mb-3">
        {label} {required && '*'}
      </label>
      
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <User className="h-5 w-5 text-gray-600 dark:text-gray-900 transition-colors duration-200" />
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
          className={`w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white border-2 rounded-xl focus:outline-none transition-all duration-200 text-black placeholder-gray-500 dark:placeholder-gray-700 ${getBorderColor()} ${className}`}
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
            ⚠️ Solo se permiten letras, acentos y ñ. Los caracteres no válidos han sido removidos.
          </p>
        </div>
      )}
      
      {/* Mensaje de ayuda */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Solo letras (máximo {maxLength} caracteres).
      </p>
    </div>
  )
}

export default LetterOnlyInput
