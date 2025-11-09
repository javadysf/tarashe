'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps {
  id?: string
  name?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  className?: string
  label?: string
  disabled?: boolean
  autoComplete?: string
}

export default function PasswordInput({
  id,
  name = 'password',
  value,
  onChange,
  placeholder = 'رمز عبور خود را وارد کنید',
  required = false,
  className = '',
  label,
  disabled = false,
  autoComplete = 'current-password'
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  const defaultClassName = "w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
  const combinedClassName = className || defaultClassName

  return (
    <div>
      {label && (
        <label htmlFor={id || name} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id || name}
          name={name}
          type={showPassword ? 'text' : 'password'}
          required={required}
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoComplete={autoComplete}
          className={combinedClassName}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={showPassword ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  )
}

