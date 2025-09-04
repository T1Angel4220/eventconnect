import React from 'react'
import { getPasswordStrength } from '../../utils/validations'

interface PasswordStrengthProps {
  password: string
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  if (!password) return null

  const { strength, score } = getPasswordStrength(password)
  
  const getStrengthColor = () => {
    switch (strength) {
      case 'weak':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'strong':
        return 'bg-green-500'
      default:
        return 'bg-gray-300'
    }
  }

  const getStrengthText = () => {
    switch (strength) {
      case 'weak':
        return 'Débil'
      case 'medium':
        return 'Media'
      case 'strong':
        return 'Fuerte'
      default:
        return ''
    }
  }

  const getStrengthTextColor = () => {
    switch (strength) {
      case 'weak':
        return 'text-red-600 dark:text-red-400'
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'strong':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-600 dark:text-gray-400">Fortaleza:</span>
        <span className={`text-xs font-medium ${getStrengthTextColor()}`}>
          {getStrengthText()}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
          style={{ width: `${(score / 6) * 100}%` }}
        />
      </div>
      
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <ul className="space-y-1">
          <li className={`flex items-center ${password.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
            <span className="mr-2">•</span>
            Mínimo 8 caracteres
          </li>
          <li className={`flex items-center ${/[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
            <span className="mr-2">•</span>
            Al menos una minúscula
          </li>
          <li className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
            <span className="mr-2">•</span>
            Al menos una mayúscula
          </li>
          <li className={`flex items-center ${/\d/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
            <span className="mr-2">•</span>
            Al menos un número
          </li>
        </ul>
      </div>
    </div>
  )
}

export default PasswordStrength
