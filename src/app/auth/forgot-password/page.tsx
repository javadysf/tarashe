'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import ErrorMessage from '@/components/ErrorMessage'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Smartphone, Key } from 'lucide-react'
import PasswordInput from '@/components/PasswordInput'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'verification' | 'reset'>('email')
  const [phone, setPhone] = useState('')
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [maskedPhone, setMaskedPhone] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    if (!phone.trim()) {
      setError('لطفاً شماره تلفن خود را وارد کنید')
      setIsSubmitting(false)
      return
    }

    if (!/^09\d{9}$/.test(phone)) {
      setError('شماره تلفن باید به فرمت 09123456789 باشد')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await api.forgotPassword(phone)
      setMaskedPhone(response.phone)
      setSuccess('کد تایید به شماره تلفن شما ارسال شد')
      setStep('verification')
    } catch (error: any) {
      setError(error.message || 'خطایی رخ داده است')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return
    
    const newCode = [...verificationCode]
    newCode[index] = value.replace(/[^0-9]/g, '')
    setVerificationCode(newCode)

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
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
      const response = await api.verifyResetCode(phone, code)
      setResetToken(response.resetToken)
      setSuccess('کد تایید صحیح است')
      setStep('reset')
    } catch (error: any) {
      setError(error.message || 'کد تایید اشتباه است')
      setVerificationCode(['', '', '', '', '', ''])
      document.getElementById('code-0')?.focus()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    if (!newPassword.trim()) {
      setError('لطفاً رمز عبور جدید را وارد کنید')
      setIsSubmitting(false)
      return
    }

    if (newPassword.length < 6) {
      setError('رمز عبور باید حداقل 6 کاراکتر باشد')
      setIsSubmitting(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('رمز عبور و تکرار آن یکسان نیستند')
      setIsSubmitting(false)
      return
    }

    try {
      await api.resetPassword(resetToken, newPassword)
      setSuccess('رمز عبور با موفقیت تغییر یافت! در حال انتقال...')
      
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } catch (error: any) {
      setError(error.message || 'خطا در تغییر رمز عبور')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm"
            >
              {step === 'email' && <Key className="h-8 w-8 text-white" />}
              {step === 'verification' && <Smartphone className="h-8 w-8 text-white" />}
              {step === 'reset' && <Key className="h-8 w-8 text-white" />}
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {step === 'email' && 'بازیابی رمز عبور'}
              {step === 'verification' && 'تایید شماره تلفن'}
              {step === 'reset' && 'رمز عبور جدید'}
            </h2>
            <p className="text-white/90 text-sm">
              {step === 'email' && 'شماره تلفن خود را وارد کنید'}
              {step === 'verification' && 'کد تایید را وارد کنید'}
              {step === 'reset' && 'رمز عبور جدید را تنظیم کنید'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'email' && (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-8 space-y-6"
                onSubmit={handleEmailSubmit}
              >
                {error && <ErrorMessage type="error" message={error} onClose={() => setError('')} />}
                {success && <ErrorMessage type="success" message={success} onClose={() => setSuccess('')} />}
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    شماره تلفن
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-400"
                    placeholder="09123456789"
                    maxLength={11}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>در حال ارسال...</span>
                    </div>
                  ) : (
                    <>
                      <span>ارسال کد تایید</span>
                      <ArrowLeft className="w-5 h-5 mr-2" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <Link 
                    href="/auth/login" 
                    className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    بازگشت به ورود
                  </Link>
                </div>
              </motion.form>
            )}

            {step === 'verification' && (
              <motion.form
                key="verification"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 space-y-6"
                onSubmit={handleVerifyCode}
              >
                {error && <ErrorMessage type="error" message={error} onClose={() => setError('')} />}
                {success && <ErrorMessage type="success" message={success} onClose={() => setSuccess('')} />}

                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600 mb-2">
                    کد تایید به شماره <span className="font-semibold text-gray-900">{maskedPhone}</span> ارسال شد
                  </p>
                </div>

                <div className="flex flex-row-reverse justify-center gap-3 mb-6">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 text-gray-900"
                      style={{ direction: 'ltr' }}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || verificationCode.join('').length !== 6}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>در حال تایید...</span>
                    </div>
                  ) : (
                    <>
                      <span>تایید کد</span>
                      <ArrowLeft className="w-5 h-5 mr-2" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 text-base font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
                >
                  <ArrowRight className="w-4 h-4 ml-2" />
                  بازگشت
                </button>
              </motion.form>
            )}

            {step === 'reset' && (
              <motion.form
                key="reset"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 space-y-6"
                onSubmit={handleResetPassword}
              >
                {error && <ErrorMessage type="error" message={error} onClose={() => setError('')} />}
                {success && <ErrorMessage type="success" message={success} onClose={() => setSuccess('')} />}

                <PasswordInput
                  id="newPassword"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="رمز عبور جدید را وارد کنید"
                  required
                  label="رمز عبور جدید"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-400"
                />

                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="رمز عبور را دوباره وارد کنید"
                  required
                  label="تکرار رمز عبور"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-400"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>در حال تغییر...</span>
                    </div>
                  ) : (
                    <>
                      <span>تغییر رمز عبور</span>
                      <ArrowLeft className="w-5 h-5 mr-2" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}