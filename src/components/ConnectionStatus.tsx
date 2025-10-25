'use client'

import { useAuthStore } from '@/store/authStore'
import { useEffect, useState } from 'react'

export default function ConnectionStatus() {
  const { authRetryCount, isCheckingAuth } = useAuthStore()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (authRetryCount > 0 || isCheckingAuth) {
      setIsVisible(true)
    } else {
      // Hide after a delay
      const timer = setTimeout(() => setIsVisible(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [authRetryCount, isCheckingAuth])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 left-4 z-50 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg px-4 py-2 shadow-lg">
      <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
        {isCheckingAuth && (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
            <span>در حال بررسی احراز هویت...</span>
          </>
        )}
        {authRetryCount > 0 && !isCheckingAuth && (
          <>
            <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
            <span>تلاش مجدد اتصال ({authRetryCount}/3)</span>
          </>
        )}
      </div>
    </div>
  )
}