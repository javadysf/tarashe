'use client'

import React from 'react'

// Conditionally import Sentry
let Sentry: any = null;
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  try {
    Sentry = require('@sentry/nextjs');
  } catch (error) {
    // Sentry not available
  }
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error }>
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Filter out known non-critical errors
    const shouldIgnore = 
      error.message.includes('خطا در اتصال به اینترنت') || 
      error.message.includes('ایمیل یا رمز عبور اشتباه است') ||
      error.message.includes('دسترسی غیرمجاز') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError')
    
    if (!shouldIgnore) {
      // Capture in Sentry if available
      try {
        if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
          Sentry.captureException(error, {
            contexts: {
              react: {
                componentStack: errorInfo.componentStack,
              },
            },
          })
        }
      } catch (sentryError) {
        // Sentry not available, continue without it
      }
      
      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
      }
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback
      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} />
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              خطایی رخ داده است
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              لطفاً صفحه را رفرش کنید یا دوباره تلاش کنید
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
            >
              رفرش صفحه
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
