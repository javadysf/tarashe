'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Category {
  name: string
  persianName: string
  gradient: string
  icon: string
}

export default function CategoriesSection() {
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://fakestoreapi.com/products/categories')
      const data = await response.json()
      setCategories(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setLoading(false)
    }
  }

  const getCategoryInfo = (category: string): Category => {
    const categoryMap: { [key: string]: Category } = {
      "men's clothing": {
        name: "men's clothing",
        persianName: "پوشاک مردانه",
        gradient: "from-[#0D47A1] to-[#1565C0]",
        icon: "👔"
      },
      "women's clothing": {
        name: "women's clothing", 
        persianName: "پوشاک زنانه",
        gradient: "from-[#0D47A1] to-[#1976D2]",
        icon: "👗"
      },
      "jewelery": {
        name: "jewelery",
        persianName: "جواهرات",
        gradient: "from-[#0D47A1] to-[#1E88E5]",
        icon: "💎"
      },
      "electronics": {
        name: "electronics",
        persianName: "الکترونیک",
        gradient: "from-[#0D47A1] to-[#2196F3]",
        icon: "📱"
      }
    }
    return categoryMap[category] || {
      name: category,
      persianName: category,
      gradient: "from-gray-500 to-gray-600",
      icon: "📦"
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">دستهبندی محصولات</h2>
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
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">دستهبندی محصولات</h2>
          <p className="text-xl text-gray-600">انتخاب کنید و خرید کنید</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const categoryInfo = getCategoryInfo(category)
            return (
              <Link
                key={category}
                href={`/products?category=${encodeURIComponent(category)}`}
                className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105"
              >
                <div className={`h-48 bg-gradient-to-br ${categoryInfo.gradient} relative`}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 text-6xl opacity-50">
                      {categoryInfo.icon}
                    </div>
                    <div className="absolute bottom-4 left-4 text-4xl opacity-30">
                      {categoryInfo.icon}
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-20">
                      {categoryInfo.icon}
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute top-6 left-6 w-3 h-3 bg-white/30 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-8 right-8 w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
                  <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white/50 rounded-full animate-ping"></div>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-center items-center text-white p-6">
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {categoryInfo.icon}
                    </div>
                    <h3 className="text-xl font-bold text-center group-hover:scale-105 transition-transform duration-300">
                      {categoryInfo.persianName}
                    </h3>
                    
                    {/* Arrow Icon */}
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-6 h-6 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                  
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
            href="/products"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl hover:bg-primary-dark transition-all font-medium text-lg transform hover:scale-105 shadow-lg"
          >
            <span>مشاهده همه محصولات</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}