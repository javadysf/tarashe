'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AboutContent {
  _id?: string
  page: string
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
  isActive: boolean
}

export default function AboutContentManagement() {
  const router = useRouter()
  const [content, setContent] = useState<AboutContent>({
    page: 'about',
    heroTitle: 'درباره تراشه',
    heroSubtitle: 'ما در تراشه با بیش از یک دهه تجربه، به ارائه بهترین محصولات و خدمات فناوری برای کسب‌وکارها و سازمان‌ها متعهد هستیم.',
    aboutInfo: {
      title: 'درباره تراشه',
      subtitle: 'ما در تراشه با بیش از یک دهه تجربه، به ارائه بهترین محصولات و خدمات فناوری برای کسب‌وکارها و سازمان‌ها متعهد هستیم.',
      mission: 'ارائه راه‌حل‌های نوآورانه و با کیفیت که به کسب‌وکارها کمک می‌کند تا در عصر دیجیتال پیشرو باشند و اهداف خود را محقق کنند.',
      vision: 'تبدیل شدن به پیشروترین شرکت فناوری در منطقه و ایجاد تحول مثبت در زندگی میلیون‌ها نفر از طریق فناوری‌های پیشرفته.',
      stats: [
        { number: '10+', label: 'سال تجربه' },
        { number: '500+', label: 'پروژه موفق' },
        { number: '100+', label: 'مشتری راضی' },
        { number: '24/7', label: 'پشتیبانی' }
      ],
      team: [
        { name: 'علی احمدی', role: 'مدیر عامل', description: 'بیش از 15 سال تجربه در صنعت فناوری' },
        { name: 'سارا محمدی', role: 'مدیر فنی', description: 'متخصص توسعه نرم‌افزار و معماری سیستم' },
        { name: 'حسن رضایی', role: 'مدیر فروش', description: 'خبره در روابط مشتریان و توسعه بازار' }
      ]
    },
    isActive: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/content/admin/about', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setContent(data.content)
      } else {
        console.log('Content not found, using default values')
      }
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    if (field.startsWith('aboutInfo.')) {
      const aboutField = field.split('.')[1]
      setContent(prev => ({
        ...prev,
        aboutInfo: {
          ...prev.aboutInfo,
          [aboutField]: value
        }
      }))
    } else {
      setContent(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleStatsChange = (index: number, field: 'number' | 'label', value: string) => {
    setContent(prev => ({
      ...prev,
      aboutInfo: {
        ...prev.aboutInfo,
        stats: prev.aboutInfo.stats.map((stat, i) => 
          i === index ? { ...stat, [field]: value } : stat
        )
      }
    }))
  }

  const handleTeamChange = (index: number, field: 'name' | 'role' | 'description', value: string) => {
    setContent(prev => ({
      ...prev,
      aboutInfo: {
        ...prev.aboutInfo,
        team: prev.aboutInfo.team.map((member, i) => 
          i === index ? { ...member, [field]: value } : member
        )
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('http://localhost:3002/api/content/admin/about', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(content)
      })

      if (response.ok) {
        const result = await response.json()
        alert('محتوای صفحه درباره ما با موفقیت بروزرسانی شد')
        router.push('/admin/content')
      } else {
        // Check if response is JSON
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json()
          alert(`خطا: ${error.message}`)
        } else {
          const errorText = await response.text()
          console.error('Non-JSON error response:', errorText)
          alert('خطا در سرور - لطفاً دوباره تلاش کنید')
        }
      }
    } catch (error) {
      console.error('Error saving content:', error)
      alert('خطا در ذخیره محتوا - لطفاً اتصال اینترنت خود را بررسی کنید')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-6 flex items-center gap-2 font-medium"
        >
          ← بازگشت به مدیریت محتوا
        </button>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">ℹ️</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ویرایش محتوای درباره ما</h1>
            <p className="text-gray-600">مدیریت اطلاعات شرکت، ماموریت، چشم‌انداز، آمار و تیم</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">اطلاعات اصلی صفحه</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="heroTitle" className="block text-sm font-medium text-gray-700 mb-2">
                عنوان اصلی صفحه
              </label>
              <input
                type="text"
                id="heroTitle"
                value={content.heroTitle}
                onChange={(e) => handleChange('heroTitle', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="درباره تراشه"
              />
            </div>
            
            <div>
              <label htmlFor="heroSubtitle" className="block text-sm font-medium text-gray-700 mb-2">
                زیرعنوان صفحه
              </label>
              <input
                type="text"
                id="heroSubtitle"
                value={content.heroSubtitle}
                onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ما در تراشه با بیش از یک دهه تجربه..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">اطلاعات شرکت</h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                عنوان شرکت
              </label>
              <input
                type="text"
                id="title"
                value={content.aboutInfo.title}
                onChange={(e) => handleChange('aboutInfo.title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="درباره تراشه"
              />
            </div>
            
            <div>
              <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
                توضیحات شرکت
              </label>
              <textarea
                id="subtitle"
                rows={3}
                value={content.aboutInfo.subtitle}
                onChange={(e) => handleChange('aboutInfo.subtitle', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="توضیحات کلی درباره شرکت..."
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="mission" className="block text-sm font-medium text-gray-700 mb-2">
                  ماموریت
                </label>
                <textarea
                  id="mission"
                  rows={4}
                  value={content.aboutInfo.mission}
                  onChange={(e) => handleChange('aboutInfo.mission', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ماموریت شرکت..."
                />
              </div>
              
              <div>
                <label htmlFor="vision" className="block text-sm font-medium text-gray-700 mb-2">
                  چشم‌انداز
                </label>
                <textarea
                  id="vision"
                  rows={4}
                  value={content.aboutInfo.vision}
                  onChange={(e) => handleChange('aboutInfo.vision', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="چشم‌انداز شرکت..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">آمار و ارقام</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {content.aboutInfo.stats.map((stat, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">آمار {index + 1}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">عدد</label>
                    <input
                      type="text"
                      value={stat.number}
                      onChange={(e) => handleStatsChange(index, 'number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="10+"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">برچسب</label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => handleStatsChange(index, 'label', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="سال تجربه"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">تیم</h2>
          
          <div className="space-y-6">
            {content.aboutInfo.team.map((member, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">عضو تیم {index + 1}</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">نام</label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => handleTeamChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="نام عضو تیم"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">سمت</label>
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => handleTeamChange(index, 'role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="مدیر عامل"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">توضیحات</label>
                    <input
                      type="text"
                      value={member.description}
                      onChange={(e) => handleTeamChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="توضیحات کوتاه"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </button>
        </div>
      </form>
    </div>
  )
}
