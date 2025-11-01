'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import ErrorMessage from '@/components/ErrorMessage'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { register, isLoading } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    // Validation
    if (!formData.name.trim()) {
      setError('لطفاً نام خود را وارد کنید')
      setIsSubmitting(false)
      return
    }

    if (!formData.email.trim()) {
      setError('لطفاً ایمیل خود را وارد کنید')
      setIsSubmitting(false)
      return
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('لطفاً یک ایمیل معتبر وارد کنید')
      setIsSubmitting(false)
      return
    }

    if (!formData.password.trim()) {
      setError('لطفاً رمز عبور خود را وارد کنید')
      setIsSubmitting(false)
      return
    }

    if (formData.password.length < 6) {
      setError('رمز عبور باید حداقل 6 کاراکتر باشد')
      setIsSubmitting(false)
      return
    }

    if (!formData.phone.trim()) {
      setError('لطفاً شماره تلفن خود را وارد کنید')
      setIsSubmitting(false)
      return
    }

    try {
      await register(formData)
      setSuccess('حساب کاربری شما با موفقیت ایجاد شد! در حال انتقال...')
      
      // Redirect immediately after successful registration
      window.location.href = '/'
    } catch (error: any) {
      // Only log unexpected errors, not normal validation errors
      const isNormalError = error.message && (
        error.message.includes('کاربری با این ایمیل قبلاً ثبت شده است') ||
        error.message.includes('اطلاعات وارد شده صحیح نیست') ||
        error.message.includes('نام باید حداقل 2 کاراکتر باشد') ||
        error.message.includes('رمز عبور باید حداقل 6 کاراکتر باشد') ||
        error.message.includes('ایمیل معتبر وارد کنید') ||
        error.message.includes('شماره تلفن صحیح نیست')
      );
      
      if (!isNormalError) {
        console.error('Unexpected register error:', error);
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
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm"
            >
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">
              ثبت نام
            </h2>
            <p className="text-white/90 text-sm">
              حساب کاربری جدید ایجاد کنید
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
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                نام
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                placeholder="نام خود را وارد کنید"
              />
            </div>

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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                placeholder="ایمیل خود را وارد کنید"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                شماره تلفن
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                placeholder="09123456789"
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
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
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
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
            >
              {isSubmitting || isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>در حال ثبت نام...</span>
                </div>
              ) : (
                'ثبت نام'
              )}
            </button>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              حساب کاربری دارید؟{' '}
              <Link 
                href="/auth/login" 
                className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                وارد شوید
              </Link>
            </p>
          </div>
        </motion.form>
        </div>
      </motion.div>
    </div>
  )
}