'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getApiUrl } from '@/lib/config'

interface AboutContent {
  heroTitle: string
  heroSubtitle: string
  aboutInfo: {
    title: string
    subtitle: string
    mission: string
    vision: string
    stats: Array<{ number: string; label: string }>
    team: Array<{ name: string; role: string; description: string }>
  }
}

export default function About() {
  const [content, setContent] = useState<AboutContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await fetch(getApiUrl('/content/about'))
      if (response.ok) {
        const data = await response.json()
        setContent(data.content)
      }
    } catch (error) {
      console.error('Error fetching about content:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-6 sm:py-10 md:py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 sm:h-10 md:h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/2 sm:w-1/3 mx-auto mb-4 sm:mb-6"></div>
            <div className="h-4 sm:h-5 md:h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 sm:w-2/3 mx-auto mb-6 sm:mb-10 md:mb-16"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-10 md:mb-16">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 sm:h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-12 mb-6 sm:mb-10 md:mb-16">
              <div className="h-32 sm:h-40 md:h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div className="h-32 sm:h-40 md:h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 sm:h-56 md:h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const stats = content?.aboutInfo?.stats || [
    { number: '10+', label: 'سال تجربه' },
    { number: '500+', label: 'پروژه موفق' },
    { number: '100+', label: 'مشتری راضی' },
    { number: '24/7', label: 'پشتیبانی' }
  ]

  const team = content?.aboutInfo?.team || [
    { name: 'علی احمدی', role: 'مدیر عامل', description: 'بیش از 15 سال تجربه در صنعت فناوری' },
    { name: 'سارا محمدی', role: 'مدیر فنی', description: 'متخصص توسعه نرم‌افزار و معماری سیستم' },
    { name: 'حسن رضایی', role: 'مدیر فروش', description: 'خبره در روابط مشتریان و توسعه بازار' }
  ]

  return (
    <div className="py-6 sm:py-10 md:py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center mb-6 sm:mb-10 md:mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-3 sm:mb-4 md:mb-6 shadow-lg">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 md:mb-4">
          {content?.heroTitle || 'درباره تراشه'}
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed px-2">
          {content?.heroSubtitle || 'ما در تراشه با بیش از یک ده ه تجربه، به ارائه بهترین محصولات و خدمات فناوری برای کسب‌وکارها و سازمان‌ها متعهد هستیم.'}
        </p>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700 py-8 sm:py-12 md:py-16 mb-6 sm:mb-10 md:mb-16 rounded-2xl sm:rounded-3xl mx-3 sm:mx-4 md:mx-6 lg:mx-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-3 sm:p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-white/50 dark:border-gray-700/50 shadow-sm">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-1 sm:mb-2">
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-6 sm:mb-10 md:mb-16">
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">ماموریت ما</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              {content?.aboutInfo?.mission || 'ارائه راه‌حل‌های نوآورانه و با کیفیت که به کسب‌وکارها کمک می‌کند تا در عصر دیجیتال پیشرو باشند و اهداف خود را محقق کنند.'}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">چشم‌انداز ما</h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              {content?.aboutInfo?.vision || 'تبدیل شدن به پیشروترین شرکت فناوری در منطقه و ایجاد تحول مثبت در زندگی میلیون‌ها نفر از طریق فناوری‌های پیشرفته.'}
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-6 sm:mb-10 md:mb-16">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">تیم ما</h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">افراد متخصص و با تجربه ما</p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {team.map((member, index) => (
            <div key={index} className="text-center bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-lg">
                <span className="text-2xl sm:text-3xl md:text-4xl">👤</span>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">{member.name}</h3>
              <p className="text-sm sm:text-base text-blue-600 dark:text-blue-400 font-medium mb-2 sm:mb-3">{member.role}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{member.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700 text-white py-8 sm:py-12 md:py-16 rounded-2xl sm:rounded-3xl mx-3 sm:mx-4 md:mx-6 lg:mx-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-sm rounded-full mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6">آماده همکاری با ما هستید؟</h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            با تیم متخصص ما در تماس باشید و پروژه بعدی خود را شروع کنید.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            تماس با ما
          </Link>
        </div>
      </section>
    </div>
  )
}