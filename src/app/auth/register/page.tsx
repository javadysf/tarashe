'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import ErrorMessage from '@/components/ErrorMessage'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Smartphone } from 'lucide-react'
import PasswordInput from '@/components/PasswordInput'

export default function RegisterPage() {
  const [step, setStep] = useState<'form' | 'verification'>('form')
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    phone: ''
  })
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const { sendSmsCode, verifySmsCode, resendSmsCode, isLoading } = useAuthStore()
  const router = useRouter()

  // Countdown timer for resend SMS
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleFormSubmit = async (e: React.FormEvent) => {
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

    if (!formData.lastName.trim()) {
      setError('لطفاً نام خانوادگی خود را وارد کنید')
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

    if (formData.password !== formData.confirmPassword) {
      setError('رمز عبور و تکرار آن یکسان نیستند')
      setIsSubmitting(false)
      return
    }

    if (!formData.phone.trim()) {
      setError('لطفاً شماره تلفن خود را وارد کنید')
      setIsSubmitting(false)
      return
    }

    if (!/^09\d{9}$/.test(formData.phone)) {
      setError('شماره تلفن باید به فرمت 09123456789 باشد')
      setIsSubmitting(false)
      return
    }

    try {
      // Only send required fields to the API (exclude confirmPassword)
      const { confirmPassword, ...userData } = formData
      await sendSmsCode(userData)
      setSuccess('کد تایید به شماره تلفن شما ارسال شد')
      setStep('verification')
      setCountdown(120) // 2 minutes countdown
    } catch (error: any) {
      console.error('Send SMS code error:', error)
      setError(error.message || 'خطایی رخ داده است. لطفاً دوباره تلاش کنید')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return // Only allow single digit
    
    const newCode = [...verificationCode]
    newCode[index] = value.replace(/[^0-9]/g, '')
    setVerificationCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6)
    const newCode = [...verificationCode]
    for (let i = 0; i < 6; i++) {
      newCode[i] = pastedData[i] || ''
    }
    setVerificationCode(newCode)
    
    // Focus last input
    const lastInput = document.getElementById(`code-${5}`)
    lastInput?.focus()
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    const code = verificationCode.join('')
    if (code.length !== 6) {
      setError('لطفاً کد تایید 6 رقمی را وارد کنید')
      setIsSubmitting(false)
      return
    }

    try {
      await verifySmsCode(formData.phone, code)
      setSuccess('ثبت نام با موفقیت انجام شد! در حال انتقال...')
      
      // Redirect after successful registration
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
    } catch (error: any) {
      setError(error.message || 'کد تایید اشتباه است')
      // Clear code on error
      setVerificationCode(['', '', '', '', '', ''])
      document.getElementById('code-0')?.focus()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    if (countdown > 0) return

    setError('')
    setIsSubmitting(true)
    try {
      await resendSmsCode(formData.phone)
      setSuccess('کد تایید مجدداً ارسال شد')
      setCountdown(120)
      setVerificationCode(['', '', '', '', '', ''])
    } catch (error: any) {
      setError(error.message || 'خطا در ارسال مجدد کد')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-4 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mb-2 backdrop-blur-sm"
            >
              {step === 'form' ? (
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              ) : (
                <Smartphone className="h-8 w-8 text-white" />
              )}
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {step === 'form' ? 'ثبت نام' : 'تایید شماره تلفن'}
            </h2>
            <p className="text-white/90 text-sm">
              {step === 'form' ? 'حساب کاربری جدید ایجاد کنید' : 'کد تایید را وارد کنید'}
            </p>
          </div>
        
        <AnimatePresence mode="wait">
          {step === 'form' ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="p-8 space-y-6"
              onSubmit={handleFormSubmit}
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
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
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
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                      placeholder="نام"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      نام خانوادگی
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                      placeholder="نام خانوادگی"
                    />
                  </div>
                </div>



                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    شماره تلفن
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/[^0-9]/g, '')})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                    placeholder="09123456789"
                    maxLength={11}
                  />
                </div>
                
                <PasswordInput
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="رمز عبور"
                  required
                  label="رمز عبور"
                  autoComplete="new-password"
                />

                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="تکرار رمز عبور"
                  required
                  label="تکرار رمز عبور"
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
                >
                  {isSubmitting || isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>در حال ارسال کد...</span>
                    </div>
                  ) : (
                    <>
                      <span>ارسال کد تایید</span>
                      <ArrowLeft className="w-5 h-5 mr-2" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
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
          ) : (
            <motion.form
              key="verification"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-8 space-y-6"
              onSubmit={handleVerifyCode}
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

              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  کد تایید به شماره <span className="font-semibold text-gray-900 dark:text-gray-100">{formData.phone}</span> ارسال شد
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  لطفاً کد 6 رقمی را وارد کنید
                </p>
              </div>

              <div className="flex flex-row-reverse justify-center gap-3 mb-4">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading || verificationCode.join('').length !== 6}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
                >
                  {isSubmitting || isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>در حال تایید...</span>
                    </div>
                  ) : (
                    <>
                      <span>تایید و ثبت نام</span>
                      <ArrowRight className="w-5 h-5 mr-2" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-base font-semibold rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  <ArrowRight className="w-4 h-4 ml-2" />
                  بازگشت
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={countdown > 0}
                    className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {countdown > 0 ? (
                      `ارسال مجدد کد (${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')})`
                    ) : (
                      'ارسال مجدد کد تایید'
                    )}
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
