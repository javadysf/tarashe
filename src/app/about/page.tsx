'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

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
      const response = await fetch('http://localhost:3002/api/content/about')
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
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-6"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto mb-16"></div>
            <div className="grid md:grid-cols-4 gap-8 mb-16">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
    <div className="py-16 bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {content?.heroTitle || 'درباره تراشه'}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          {content?.heroSubtitle || 'ما در تراشه با بیش از یک ده ه تجربه، به ارائه بهترین محصولات و خدمات فناوری برای کسب‌وکارها و سازمان‌ها متعهد هستیم.'}
        </p>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-50 dark:bg-gray-800 py-16 mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-700 dark:text-gray-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">ماموریت ما</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {content?.aboutInfo?.mission || 'ارائه راه‌حل‌های نوآورانه و با کیفیت که به کسب‌وکارها کمک می‌کند تا در عصر دیجیتال پیشرو باشند و اهداف خود را محقق کنند.'}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">چشم‌انداز ما</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {content?.aboutInfo?.vision || 'تبدیل شدن به پیشروترین شرکت فناوری در منطقه و ایجاد تحول مثبت در زندگی میلیون‌ها نفر از طریق فناوری‌های پیشرفته.'}
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">تیم ما</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div key={index} className="text-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="w-24 h-24 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{member.name}</h3>
              <p className="text-blue-600 dark:text-blue-400 font-medium mb-3">{member.role}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{member.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 dark:bg-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">آماده همکاری با ما هستید؟</h2>
          <p className="text-xl text-gray-300 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            با تیم متخصص ما در تماس باشید و پروژه بعدی خود را شروع کنید.
          </p>
          <Link
            href="/contact"
            className="bg-blue-600 dark:bg-blue-700 text-white px-8 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors font-medium inline-block"
          >
            تماس با ما
          </Link>
        </div>
      </section>
    </div>
  )
}