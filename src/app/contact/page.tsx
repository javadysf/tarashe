'use client'

import { useState, useEffect } from 'react'
import { getApiUrl } from '@/lib/config'

interface ContactContent {
  heroTitle: string
  heroSubtitle: string
  contactInfo: {
    phone: string
    email: string
    address: string
    workingHours: string
    mapAddress: string
    mapEmbedCode: string
  }
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [content, setContent] = useState<ContactContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await fetch(getApiUrl('/content/contact'))
      if (response.ok) {
        const data = await response.json()
        setContent(data.content)
      }
    } catch (error) {
      console.error('Error fetching contact content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setSubmitted(true)
    setIsSubmitting(false)
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
  }

  if (loading) {
    return (
      <div className="py-4 sm:py-8 bg-white dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
            <div className="space-y-4">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const contactInfo = [
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: 'تلفن',
      info: content?.contactInfo?.phone || '021-1234-5678',
      link: `tel:+98${content?.contactInfo?.phone?.replace(/\D/g, '') || '2112345678'}`,
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'ایمیل',
      info: content?.contactInfo?.email || 'info@tarashe.com',
      link: `mailto:${content?.contactInfo?.email || 'info@tarashe.com'}`,
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'آدرس',
      info: content?.contactInfo?.address || 'تهران، خیابان ولیعصر، پلاک 123',
      link: '#',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'ساعات کاری',
      info: content?.contactInfo?.workingHours || 'شنبه تا پنجشنبه: 9-18',
      link: '#',
      color: 'from-orange-500 to-orange-600'
    }
  ]

  return (
    <div className="py-4 sm:py-6 md:py-8 bg-white dark:bg-gray-900 min-h-screen">
      {/* Hero Section - Mobile Optimized */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-3 sm:mb-4 shadow-lg">
          <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
          {content?.heroTitle || 'تماس با ما'}
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          {content?.heroSubtitle || 'ما همیشه آماده پاسخگویی به سوالات شما هستیم. با ما در تماس باشید.'}
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        {/* Mobile: Vertical Layout, Desktop: Grid */}
        <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-8">
          
          {/* Contact Info Cards - First on Mobile */}
          <div className="order-1 md:order-2">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></span>
              اطلاعات تماس
            </h2>
            
            {/* Compact Contact Cards */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
              {contactInfo.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  className={`group relative p-3 sm:p-4 bg-gradient-to-br ${item.color} rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors"></div>
                  <div className="relative z-10">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-2 text-white">
                      {item.icon}
                    </div>
                    <h3 className="text-[10px] sm:text-xs font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-[9px] sm:text-[10px] text-white/90 line-clamp-2 leading-tight">
                      {item.info}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* Map Section */}
            <div className="mt-4 sm:mt-6">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-gradient-to-b from-green-500 to-teal-600 rounded-full"></span>
                موقعیت ما
              </h3>
              {content?.contactInfo?.mapEmbedCode ? (
                <div 
                  className="w-full h-40 sm:h-48 md:h-56 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700"
                  dangerouslySetInnerHTML={{ __html: content.contactInfo.mapEmbedCode }}
                />
              ) : (
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 h-40 sm:h-48 md:h-56 rounded-xl flex items-center justify-center shadow-md border border-gray-200 dark:border-gray-700">
                  <div className="text-center px-3">
                    <div className="text-2xl sm:text-3xl mb-1">🗺️</div>
                    <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">نقشه محل شرکت</p>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-500 leading-tight">
                      {content?.contactInfo?.mapAddress || 'تهران، خیابان ولیعصر، پلاک 123'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Form - Second on Mobile */}
          <div className="order-2 md:order-1">
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></span>
                فرم تماس
              </h2>
              
              {submitted && (
                <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs sm:text-sm text-green-800 dark:text-green-300 leading-relaxed">
                    پیام شما با موفقیت ارسال شد. به زودی با شما تماس خواهیم گرفت.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {/* Name and Email - Stack on Mobile */}
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      نام و نام خانوادگی *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder="نام خود را وارد کنید"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      ایمیل *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                {/* Phone and Subject - Stack on Mobile */}
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label htmlFor="phone" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      شماره تماس
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder="09123456789"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      موضوع *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">انتخاب کنید</option>
                      <option value="general">سوال عمومی</option>
                      <option value="support">پشتیبانی فنی</option>
                      <option value="sales">فروش</option>
                      <option value="partnership">همکاری</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    پیام *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="پیام خود را بنویسید..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>در حال ارسال...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>ارسال پیام</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
