'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MapHelper from '@/components/MapHelper'
import { getApiUrl } from '@/lib/config'

interface ContactContent {
  _id?: string
  page: string
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
  seo: {
    metaTitle: string
    metaDescription: string
    metaKeywords: string
    ogTitle: string
    ogDescription: string
  }
  isActive: boolean
}

export default function ContactContentManagement() {
  const router = useRouter()
  const [content, setContent] = useState<ContactContent>({
    page: 'contact',
    heroTitle: 'تماس با ما',
    heroSubtitle: 'ما همیشه آماده پاسخگویی به سوالات شما هستیم. با ما در تماس باشید.',
    contactInfo: {
      phone: '021-1234-5678',
      email: 'info@tarashe.com',
      address: 'تهران، خیابان ولیعصر، پلاک 123',
      workingHours: 'شنبه تا پنجشنبه: 9-18',
      mapAddress: 'تهران، خیابان ولیعصر، پلاک 123',
      mapEmbedCode: ''
    },
    seo: {
      metaTitle: 'تماس با ما | تراشه',
      metaDescription: 'با تیم تراشه در تماس باشید - پشتیبانی 24/7، مشاوره رایگان و پاسخگویی سریع',
      metaKeywords: 'تماس، پشتیبانی، مشاوره، تراشه، فناوری',
      ogTitle: 'تماس با ما | تراشه',
      ogDescription: 'با تیم تراشه در تماس باشید - پشتیبانی 24/7، مشاوره رایگان و پاسخگویی سریع'
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
      const response = await fetch(getApiUrl('/content/admin/contact'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setContent(data.content)
      }
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    if (field.startsWith('contactInfo.')) {
      const contactField = field.split('.')[1]
      setContent(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [contactField]: value
        }
      }))
    } else if (field.startsWith('seo.')) {
      const seoField = field.split('.')[1]
      setContent(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          [seoField]: value
        }
      }))
    } else {
      setContent(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Sanitize the embed code before sending
      const sanitizedContent = {
        ...content,
        contactInfo: {
          ...content.contactInfo,
          mapEmbedCode: sanitizeEmbedCode(content.contactInfo.mapEmbedCode)
        }
      }

      const response = await fetch(getApiUrl('/content/admin/contact'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(sanitizedContent)
      })

      if (response.ok) {
        const result = await response.json()
        alert('محتوای صفحه تماس با ما با موفقیت بروزرسانی شد')
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

  const sanitizeEmbedCode = (embedCode: string): string => {
    if (!embedCode.trim()) return ''
    
    // Basic sanitization - remove potentially dangerous attributes
    let sanitized = embedCode
      .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
      .trim()
    
    // Ensure it's a valid iframe
    if (!/<iframe[^>]*src=["'][^"']*["'][^>]*>.*?<\/iframe>/i.test(sanitized)) {
      // Invalid embed code detected, clearing it
      return ''
    }
    
    return sanitized
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
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📞</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ویرایش محتوای تماس با ما</h1>
            <p className="text-gray-600">مدیریت اطلاعات تماس، آدرس و محتوای صفحه تماس با ما</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">📄</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">اطلاعات اصلی صفحه</h2>
          </div>
          
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
                placeholder="تماس با ما"
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
                placeholder="ما همیشه آماده پاسخگویی به سوالات شما هستیم"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">📞</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">اطلاعات تماس</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                شماره تلفن
              </label>
              <input
                type="text"
                id="phone"
                value={content.contactInfo.phone}
                onChange={(e) => handleChange('contactInfo.phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="021-1234-5678"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                آدرس ایمیل
              </label>
              <input
                type="email"
                id="email"
                value={content.contactInfo.email}
                onChange={(e) => handleChange('contactInfo.email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="info@tarashe.com"
              />
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                آدرس
              </label>
              <input
                type="text"
                id="address"
                value={content.contactInfo.address}
                onChange={(e) => handleChange('contactInfo.address', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="تهران، خیابان ولیعصر، پلاک 123"
              />
            </div>
            
            <div>
              <label htmlFor="workingHours" className="block text-sm font-medium text-gray-700 mb-2">
                ساعات کاری
              </label>
              <input
                type="text"
                id="workingHours"
                value={content.contactInfo.workingHours}
                onChange={(e) => handleChange('contactInfo.workingHours', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="شنبه تا پنجشنبه: 9-18"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">🗺️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">تنظیمات نقشه</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="mapAddress" className="block text-sm font-medium text-gray-700 mb-2">
                آدرس برای نمایش در نقشه
              </label>
              <input
                type="text"
                id="mapAddress"
                value={content.contactInfo.mapAddress}
                onChange={(e) => handleChange('contactInfo.mapAddress', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="تهران، خیابان ولیعصر، پلاک 123"
              />
              <p className="text-xs text-gray-500 mt-1">این آدرس برای جستجو در نقشه استفاده می‌شود</p>
            </div>
            
            <div>
              <label htmlFor="mapEmbedCode" className="block text-sm font-medium text-gray-700 mb-2">
                کد تعبیه نقشه (اختیاری)
              </label>
              <textarea
                id="mapEmbedCode"
                rows={6}
                value={content.contactInfo.mapEmbedCode}
                onChange={(e) => handleChange('contactInfo.mapEmbedCode', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="&lt;iframe src=&quot;https://www.google.com/maps/embed?pb=...&quot; width=&quot;100%&quot; height=&quot;300&quot; style=&quot;border:0;&quot; allowfullscreen=&quot;&quot; loading=&quot;lazy&quot; referrerpolicy=&quot;no-referrer-when-downgrade&quot;&gt;&lt;/iframe&gt;"
              />
              {content.contactInfo.mapEmbedCode && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                  ✓ کد نقشه معتبر است و آماده ذخیره می‌باشد
                </div>
              )}
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">راهنمای دریافت کد نقشه:</p>
                <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                  <li>به <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Maps</a> بروید</li>
                  <li>آدرس شرکت خود را جستجو کنید</li>
                  <li>روی دکمه &quot;اشتراک‌ گذاری&quot; کلیک کنید</li>
                  <li>گزینه &quot;تعبیه نقشه&quot; را انتخاب کنید</li>
                  <li>کد HTML را کپی و در اینجا قرار دهید</li>
                </ol>
              </div>
              
              <MapHelper onEmbedCodeGenerated={(embedCode) => {
                setContent(prev => ({
                  ...prev,
                  contactInfo: {
                    ...prev.contactInfo,
                    mapEmbedCode: embedCode
                  }
                }))
              }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">🔍</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">تنظیمات SEO</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-2">
                عنوان متا (Meta Title)
              </label>
              <input
                type="text"
                id="metaTitle"
                value={content.seo.metaTitle}
                onChange={(e) => handleChange('seo.metaTitle', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="تماس با ما | تراشه"
                maxLength={60}
              />
              <p className="text-xs text-gray-500 mt-1">حداکثر 60 کاراکتر (بهینه برای موتورهای جستجو)</p>
            </div>
            
            <div>
              <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                توضیحات متا (Meta Description)
              </label>
              <textarea
                id="metaDescription"
                rows={3}
                value={content.seo.metaDescription}
                onChange={(e) => handleChange('seo.metaDescription', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="با تیم تراشه در تماس باشید - پشتیبانی 24/7، مشاوره رایگان و پاسخگویی سریع"
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-1">حداکثر 160 کاراکتر (بهینه برای موتورهای جستجو)</p>
            </div>
            
            <div>
              <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700 mb-2">
                کلمات کلیدی (Meta Keywords)
              </label>
              <input
                type="text"
                id="metaKeywords"
                value={content.seo.metaKeywords}
                onChange={(e) => handleChange('seo.metaKeywords', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="تماس، پشتیبانی، مشاوره، تراشه، فناوری"
              />
              <p className="text-xs text-gray-500 mt-1">کلمات کلیدی را با کاما جدا کنید</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="ogTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان Open Graph
                </label>
                <input
                  type="text"
                  id="ogTitle"
                  value={content.seo.ogTitle}
                  onChange={(e) => handleChange('seo.ogTitle', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="تماس با ما | تراشه"
                />
              </div>
              
              <div>
                <label htmlFor="ogDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  توضیحات Open Graph
                </label>
                <textarea
                  id="ogDescription"
                  rows={3}
                  value={content.seo.ogDescription}
                  onChange={(e) => handleChange('seo.ogDescription', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="با تیم تراشه در تماس باشید - پشتیبانی 24/7، مشاوره رایگان و پاسخگویی سریع"
                />
              </div>
            </div>
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
