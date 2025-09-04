import React from 'react'
import { AlertCircle } from 'lucide-react'

interface ValidationErrorProps {
  message: string
  className?: string
}

const ValidationError: React.FC<ValidationErrorProps> = ({ message, className = '' }) => {
  if (!message) return null

  return (
    <div className={`flex items-center text-red-600 dark:text-red-400 text-sm mt-1 ${className}`}>
      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}

export default ValidationError
