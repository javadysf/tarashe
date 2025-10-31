'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories()
      setCategories(response)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryImage = (category: any) => {
    if (category.image?.url) {
      let imageUrl = category.image.url
      
      // Fix old localhost:5000 URLs to use localhost:3002
      if (imageUrl.includes('localhost:5000')) {
        imageUrl = imageUrl.replace('localhost:5000', 'localhost:3002')
      }
      
      // If URL starts with /uploads, prepend backend URL
      if (imageUrl.startsWith('/uploads')) {
        imageUrl = `http://localhost:3002${imageUrl}`
      }
      
      return imageUrl
    }
    return '/pics/battery.jpg'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">دسته بندی محصولات</h1>
          <p className="text-gray-600 text-lg">محصولات مورد نظر خود را از دسته بندی های زیر انتخاب کنید</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="text-gray-600 mt-4">در حال بارگذاری دسته بندی ها...</p>
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {categories.map((category) => (
              <Link 
                key={category._id} 
                href={`/products?category=${category._id}`}
                className="group"
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    <Image
                      src={getCategoryImage(category)}
                      alt={category.image?.alt || `تصویر ${category.name}`}
                      width={400}
                      height={250}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                      unoptimized={category.image?.url?.startsWith('/uploads')}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        const currentSrc = target.src
                        
                        if (!failedImages.has(currentSrc) && !currentSrc.includes('/pics/battery.jpg')) {
                          setFailedImages(prev => new Set(prev).add(currentSrc))
                          target.src = '/pics/battery.jpg'
                        }
                      }}
                    />
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                    
                    {category.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-medium text-sm group-hover:text-blue-700">
                        مشاهده محصولات
                      </span>
                      <svg 
                        className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <svg className="w-24 h-24 mx-auto text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">هیچ دسته بندی یافت نشد</h3>
            <p className="text-gray-600 mb-8">در حال حاضر دسته بندی موجود نیست</p>
            <Link 
              href="/"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              بازگشت به صفحه اصلی
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}