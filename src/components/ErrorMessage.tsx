'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

interface ErrorMessageProps {
  type: 'error' | 'success' | 'warning' | 'info'
  message: string
  onClose?: () => void
  autoClose?: boolean
  duration?: number
}

export default function ErrorMessage({ 
  type, 
  message, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}: ErrorMessageProps) {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5" />
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      case 'info':
        return <Info className="w-5 h-5" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20',
          border: 'border-red-200 dark:border-red-700/50',
          text: 'text-red-700 dark:text-red-300',
          icon: 'text-red-500 dark:text-red-400'
        }
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
          border: 'border-green-200 dark:border-green-700/50',
          text: 'text-green-700 dark:text-green-300',
          icon: 'text-green-500 dark:text-green-400'
        }
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20',
          border: 'border-yellow-200 dark:border-yellow-700/50',
          text: 'text-yellow-700 dark:text-yellow-300',
          icon: 'text-yellow-500 dark:text-yellow-400'
        }
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
          border: 'border-blue-200 dark:border-blue-700/50',
          text: 'text-blue-700 dark:text-blue-300',
          icon: 'text-blue-500 dark:text-blue-400'
        }
    }
  }

  const styles = getStyles()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`relative p-4 rounded-xl border backdrop-blur-sm shadow-lg ${styles.bg} ${styles.border}`}
      >
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 ${styles.icon}`}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${styles.text}`}>
              {message}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className={`flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${styles.text}`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Progress bar for auto close */}
        {autoClose && onClose && (
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: duration / 1000, ease: "linear" }}
            className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${styles.icon.replace('text-', 'from-').replace('-500', '-400')} to-transparent rounded-b-xl`}
            onAnimationComplete={onClose}
          />
        )}
      </motion.div>
    </AnimatePresence>
  )
}













