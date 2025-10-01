'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/lib/api'

interface Category {
  name: string
  persianName: string
  gradient: string
  icon: string
}

export default function CategoriesSection() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories()
      setCategories(response)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setLoading(false)
    }
  }

  const getCategoryInfo = (category: any): Category => {
    const categoryMap: { [key: string]: Category } = {
      "باتری لپ تاپ": {
        name: category.name,
        persianName: category.name,
        gradient: "from-[#0D47A1] to-[#1565C0]",
        icon: "🔋"
      },
      "شارژر لپ تاپ": {
        name: category.name,
        persianName: category.name,
        gradient: "from-[#0D47A1] to-[#1976D2]",
        icon: "⚡"
      },
      "قطعات لپ تاپ": {
        name: category.name,
        persianName: category.name,
        gradient: "from-[#0D47A1] to-[#1E88E5]",
        icon: "🔧"
      },
      "لوازم جانبی": {
        name: category.name,
        persianName: category.name,
        gradient: "from-[#0D47A1] to-[#2196F3]",
        icon: "💻"
      }
    }
    return categoryMap[category.name] || {
      name: category.name,
      persianName: category.name,
      gradient: "from-gray-500 to-gray-600",
      icon: "📦"
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">دسته بندی محصولات</h2>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-64 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-48 bg-gray-300 rounded-3xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gradient-7">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">دسته بندی محصولات</h2>
          <p className="text-xl text-white/90 drop-shadow-md">انتخاب کنید و خرید کنید</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const categoryInfo = getCategoryInfo(category)
            return (
              <Link
                key={category._id}
                href={`/products?category=${encodeURIComponent(category._id)}`}
                className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105"
              >
                <div className="h-48 relative bg-gray-100 glass">
                  {/* Category Image */}
                  <Image
                    src={category.image?.url || '/pics/battery.jpg'}
                    alt={category.image?.alt || category.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/pics/battery.jpg'
                    }}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-end p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:scale-105 transition-transform duration-300">
                      {category.name}
                    </h3>
                    
                    {category.description && (
                      <p className="text-white/80 text-sm mb-3 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    
                    {/* Arrow Icon */}
                    <div className="flex items-center text-white/90 group-hover:text-white transition-colors">
                      <span className="text-sm font-medium ml-2">مشاهده محصولات</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* View All Categories Button */}
        <div className="text-center mt-12">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 bg-gradient-3 text-white px-8 py-4 rounded-xl hover:shadow-2xl transition-all font-medium text-lg transform hover:scale-105 shadow-lg animate-pulse-glow"
          >
            <span>مشاهده همه دسته بندی ها</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}