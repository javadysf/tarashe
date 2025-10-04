'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import ErrorMessage from '@/components/ErrorMessage'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, isLoading } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    // Validation
    if (!formData.email.trim()) {
      setError('لطفاً ایمیل خود را وارد کنید')
      setIsSubmitting(false)
      return
    }

    if (!formData.password.trim()) {
      setError('لطفاً رمز عبور خود را وارد کنید')
      setIsSubmitting(false)
      return
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('لطفاً یک ایمیل معتبر وارد کنید')
      setIsSubmitting(false)
      return
    }

    try {
      const result = await login(formData.email, formData.password)
      
      setSuccess('با موفقیت وارد شدید! در حال انتقال...')
      
      // Redirect immediately after successful login
      if (result.user.role === 'admin') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/'
      }
    } catch (error: any) {
      // Only log unexpected errors, not normal validation errors
      const isNormalError = error.message && (
        error.message.includes('ایمیل یا رمز عبور اشتباه است') ||
        error.message.includes('حساب کاربری غیرفعال است') ||
        error.message.includes('اطلاعات وارد شده صحیح نیست')
      );
      
      if (!isNormalError) {
        console.error('Unexpected login error:', error);
      }
      
      // Use the error message directly since API client already handles HTTP status codes
      setError(error.message || 'خطایی رخ داده است. لطفاً دوباره تلاش کنید')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4"
          >
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </motion.div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ورود به حساب کاربری
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            لطفاً اطلاعات خود را وارد کنید
          </p>
        </div>
        
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
        >
          {/* Error Message */}
          {error && (
            <ErrorMessage
              type="error"
              message={error}
              onClose={() => setError('')}
            />
          )}
          
          {/* Success Message */}
          {success && (
            <ErrorMessage
              type="success"
              message={success}
              onClose={() => setSuccess('')}
              autoClose={false}
            />
          )}
          
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                ایمیل
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="ایمیل خود را وارد کنید"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                رمز عبور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="رمز عبور خود را وارد کنید"
              />
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              {isSubmitting || isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>در حال ورود...</span>
                </div>
              ) : (
                'ورود'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              حساب کاربری ندارید؟{' '}
              <Link 
                href="/auth/register" 
                className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                ثبت نام کنید
              </Link>
            </p>
          </div>
        </motion.form>
      </motion.div>
    </div>
  )
}