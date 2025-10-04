'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ContentItem {
  _id: string
  page: string
  heroTitle: string
  heroSubtitle: string
  contactInfo?: {
    phone: string
    email: string
    address: string
    workingHours: string
  }
  aboutInfo?: {
    title: string
    subtitle: string
    mission: string
    vision: string
    stats: Array<{ number: string; label: string }>
    team: Array<{ name: string; role: string; description: string }>
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ContentManagement() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/content/admin/all', {
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

  const getPageTitle = (page: string) => {
    switch (page) {
      case 'contact':
        return 'صفحه تماس با ما'
      case 'about':
        return 'صفحه درباره ما'
      default:
        return page
    }
  }

  const getPageIcon = (page: string) => {
    switch (page) {
      case 'contact':
        return '📞'
      case 'about':
        return 'ℹ️'
      default:
        return '📄'
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📝</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">مدیریت محتوا</h1>
            <p className="text-gray-600">ویرایش و مدیریت محتوای صفحات تماس با ما و درباره ما</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {content.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">هیچ محتوایی یافت نشد</h3>
            <p className="text-gray-600 mb-6">برای شروع، محتوای صفحات را ویرایش کنید</p>
            <div className="space-x-4">
              <Link
                href="/admin/content/contact"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                ویرایش محتوای تماس با ما
              </Link>
              <Link
                href="/admin/content/about"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                ویرایش محتوای درباره ما
              </Link>
            </div>
          </div>
        ) : (
          content.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getPageIcon(item.page)}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {getPageTitle(item.page)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      آخرین بروزرسانی: {new Date(item.updatedAt).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.isActive ? 'فعال' : 'غیرفعال'}
                  </span>
                  <Link
                    href={`/admin/content/${item.page}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    ویرایش
                  </Link>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <strong>عنوان اصلی:</strong> {item.heroTitle || 'تعریف نشده'}
                </div>
                <div>
                  <strong>زیرعنوان:</strong> {item.heroSubtitle || 'تعریف نشده'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

        {content.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">برای ویرایش محتوا:</p>
          <div className="space-x-4">
            <Link
              href="/admin/content/contact"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              ویرایش تماس با ما
            </Link>
            <Link
              href="/admin/content/about"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              ویرایش درباره ما
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
