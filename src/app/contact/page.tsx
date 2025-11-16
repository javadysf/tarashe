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
      const response = await fetch('http://localhost:3002/api/content/contact')
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
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-6"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto mb-16"></div>
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const contactInfo = [
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: 'تلفن',
      info: content?.contactInfo?.phone || '021-1234-5678',
      link: `tel:+98${content?.contactInfo?.phone?.replace(/\D/g, '') || '2112345678'}`
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'ایمیل',
      info: content?.contactInfo?.email || 'info@tarashe.com',
      link: `mailto:${content?.contactInfo?.email || 'info@tarashe.com'}`
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'آدرس',
      info: content?.contactInfo?.address || 'تهران، خیابان ولیعصر، پلاک 123',
      link: '#'
    },
    {
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'ساعات کاری',
      info: content?.contactInfo?.workingHours || 'شنبه تا پنجشنبه: 9-18',
      link: '#'
    }
  ]

  return (
    <div className="py-16 bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
          {content?.heroTitle || 'تماس با ما'}
        </h1>
        <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          {content?.heroSubtitle || 'ما همیشه آماده پاسخگویی به سوالات شما هستیم. با ما در تماس باشید.'}
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-12">
          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-lg shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">فرم تماس</h2>
            
            {submitted && (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 px-4 py-3 rounded-lg mb-6">
                پیام شما با موفقیت ارسال شد. به زودی با شما تماس خواهیم گرفت.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    نام و نام خانوادگی *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="نام خود را وارد کنید"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ایمیل *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    شماره تماس
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="09123456789"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    موضوع *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">انتخاب کنید</option>
                    <option value="general">سوال عمومی</option>
                    <option value="support">پشتیبانی فنی</option>
                    <option value="sales">فروش</option>
                    <option value="partnership">همکاری</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  پیام *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="پیام خود را بنویسید..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 px-6 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'در حال ارسال...' : 'ارسال پیام'}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">اطلاعات تماس</h2>
            <div className="space-y-4 sm:space-y-6">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-blue-600 dark:text-blue-400 mt-1">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm sm:text-base">{item.title}</h3>
                    {item.link.startsWith('#') ? (
                      <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{item.info}</p>
                    ) : (
                      <a href={item.link} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm sm:text-base">
                        {item.info}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Map Section */}
            <div className="mt-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">موقعیت ما</h3>
              {content?.contactInfo?.mapEmbedCode ? (
                <div 
                  className="w-full h-64 rounded-lg overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: content.contactInfo.mapEmbedCode }}
                />
              ) : (
                <div className="bg-gray-200 dark:bg-gray-700 h-48 sm:h-64 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🗺️</div>
                    <p className="text-gray-500 dark:text-gray-400 mb-2 text-sm sm:text-base">نقشه محل شرکت</p>
                    <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">
                      {content?.contactInfo?.mapAddress || 'آدرس: تهران، خیابان ولیعصر، پلاک 123'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}