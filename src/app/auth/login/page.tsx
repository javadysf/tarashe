'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import ErrorMessage from '@/components/ErrorMessage'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [redirectPath, setRedirectPath] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const redirect = searchParams.get('redirect')
    if (redirect) {
      setRedirectPath(redirect)
    }
  }, [searchParams])

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
      
      // Redirect to intended page or default based on role
      if (redirectPath) {
        window.location.href = redirectPath
      } else if (result.user.role === 'admin') {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm"
            >
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">
              ورود به حساب کاربری
            </h2>
            <p className="text-white/90 text-sm">
              لطفاً اطلاعات خود را وارد کنید
            </p>
          </div>
        
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="p-8 space-y-6"
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
          
          <div className="space-y-5">
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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                placeholder="ایمیل خود را وارد کنید"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                رمز عبور
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                  placeholder="رمز عبور خود را وارد کنید"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
            >
              {isSubmitting || isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>در حال ورود...</span>
                </div>
              ) : (
                'ورود'
              )}
            </button>
          </div>

          <div className="text-center pt-4">
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
        </div>
      </motion.div>
    </div>
  )
}