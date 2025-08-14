'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, X } from 'lucide-react'

interface PasswordStrength {
  score: number
  feedback: string[]
}

interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
}

export function PasswordStrengthIndicator({ 
  password, 
  className = '' 
}: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState<PasswordStrength>({ score: 0, feedback: [] })

  useEffect(() => {
    const calculateStrength = (pass: string): PasswordStrength => {
      if (!pass) return { score: 0, feedback: [] }

      let score = 0
      const feedback: string[] = []

      // Length check
      if (pass.length >= 8) {
        score += 1
      } else {
        feedback.push('At least 8 characters')
      }

      // Lowercase check
      if (/[a-z]/.test(pass)) {
        score += 1
      } else {
        feedback.push('One lowercase letter')
      }

      // Uppercase check
      if (/[A-Z]/.test(pass)) {
        score += 1
      } else {
        feedback.push('One uppercase letter')
      }

      // Number check
      if (/\d/.test(pass)) {
        score += 1
      } else {
        feedback.push('One number')
      }

      // Special character check
      if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) {
        score += 1
      } else {
        feedback.push('One special character')
      }

      return { score, feedback }
    }

    setStrength(calculateStrength(password))
  }, [password])

  if (!password) return null

  const getStrengthLabel = (score: number) => {
    if (score < 2) return 'Weak'
    if (score < 4) return 'Fair'
    if (score < 5) return 'Good'
    return 'Strong'
  }

  const getStrengthColor = (score: number) => {
    if (score < 2) return 'bg-red-500'
    if (score < 4) return 'bg-amber-500'
    if (score < 5) return 'bg-blue-500'
    return 'bg-emerald-500'
  }

  return (
    <div className={`mt-3 ${className}`}>
      {/* Strength Bar */}
      <div className="flex items-center space-x-2 mb-2">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor(strength.score)}`}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {getStrengthLabel(strength.score)}
        </span>
      </div>

      {/* Requirements */}
      {strength.feedback.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Password must include:
          </p>
          {strength.feedback.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 text-xs text-muted-foreground">
              <X className="w-3 h-3 text-muted-foreground" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}

      {/* All requirements met */}
      {strength.score === 5 && (
        <div className="flex items-center space-x-2 text-xs text-emerald-600">
          <CheckCircle className="w-3 h-3" />
          <span>Password meets all requirements</span>
        </div>
      )}
    </div>
  )
}
