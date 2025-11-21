'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/lib/api'
import { ChevronLeft, Home, ChevronRight } from 'lucide-react'
import { getImageUrl } from '@/lib/config'

interface Category {
  _id: string
  name: string
  description?: string
  image?: { url?: string; alt?: string }
  parent?: string | null
}

interface CategoryHierarchyProps {
  currentCategoryId?: string
  onCategorySelect: (categoryId: string) => void
}

export default function CategoryHierarchy({ currentCategoryId, onCategorySelect }: CategoryHierarchyProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [parentCategory, setParentCategory] = useState<Category | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (currentCategoryId && categories.length > 0) {
      const category = categories.find(c => c._id === currentCategoryId)
      setCurrentCategory(category || null)
      
      if (category?.parent) {
        const parent = categories.find(c => c._id === category.parent)
        setParentCategory(parent || null)
      } else {
        setParentCategory(null)
      }
    } else {
      setCurrentCategory(null)
      setParentCategory(null)
    }
  }, [currentCategoryId, categories])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await api.getCategories()
      setCategories(response || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const { level1Categories, level2Categories, level3Categories } = useMemo(() => {
    const level1: Category[] = []
    const level2: Category[] = []
    const level3: Category[] = []

    for (const c of categories) {
      if (!c.parent) {
        level1.push(c)
      } else {
        const parent = categories.find(p => p._id === c.parent)
        if (parent && !parent.parent) {
          level2.push(c)
        } else if (parent && parent.parent) {
          level3.push(c)
        }
      }
    }

    level1.sort((a, b) => a.name.localeCompare(b.name, 'fa'))
    level2.sort((a, b) => a.name.localeCompare(b.name, 'fa'))
    level3.sort((a, b) => a.name.localeCompare(b.name, 'fa'))

    return { level1Categories: level1, level2Categories: level2, level3Categories: level3 }
  }, [categories])

  const getDisplayCategories = () => {
    if (!currentCategory) {
      // Show level 1 categories
      return level1Categories
    } else if (!currentCategory.parent) {
      // Show level 2 categories for current level 1 category
      return level2Categories.filter(c => c.parent === currentCategory._id)
    } else {
      // Show level 3 categories for current level 2 category
      return level3Categories.filter(c => c.parent === currentCategory._id)
    }
  }

  const ITEMS_PER_SLIDE = isMobile ? 6 : 10
  const displayCategories = getDisplayCategories()
  const totalSlides = Math.ceil(displayCategories.length / ITEMS_PER_SLIDE)
  const currentSlideCategories = displayCategories.slice(
    currentSlide * ITEMS_PER_SLIDE,
    (currentSlide + 1) * ITEMS_PER_SLIDE
  )

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex)
  }

  // Reset slide when categories change
  useEffect(() => {
    setCurrentSlide(0)
  }, [currentCategoryId])

  const getBreadcrumb = () => {
    const breadcrumb = []
    
    if (parentCategory) {
      breadcrumb.push({
        name: parentCategory.name,
        id: parentCategory._id,
        level: 1
      })
    }
    
    if (currentCategory) {
      breadcrumb.push({
        name: currentCategory.name,
        id: currentCategory._id,
        level: parentCategory ? 2 : 1
      })
    }

    return breadcrumb
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
        <div className="h-20 sm:h-24 md:h-32 bg-gray-100 dark:bg-gray-700 rounded-lg sm:rounded-xl animate-pulse" />
      </div>
    )
  }

  const breadcrumb = getBreadcrumb()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400 overflow-x-auto pb-2">
          <Link 
            href="/products" 
            className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap"
          >
            <Home className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">همه محصولات</span>
            <span className="sm:hidden">همه</span>
          </Link>
          {breadcrumb.map((item, index) => (
            <div key={item.id} className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
              <span className="text-gray-300 dark:text-gray-600 text-xs">›</span>
              <button
                onClick={() => onCategorySelect(item.id)}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none"
              >
                {item.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Back Button */}
      {currentCategory && (
        <div className="mb-3 sm:mb-4 md:mb-6">
          <button
            onClick={() => {
              if (parentCategory) {
                onCategorySelect(parentCategory._id)
              } else {
                onCategorySelect('')
              }
            }}
            className="flex items-center gap-1.5 sm:gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors text-xs sm:text-sm"
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{parentCategory ? `بازگشت به ${parentCategory.name}` : 'بازگشت به همه دسته‌ها'}</span>
            <span className="sm:hidden">بازگشت</span>
          </button>
        </div>
      )}

      {/* Categories Slider */}
      {displayCategories.length > 0 && (
        <div className="relative">
          {/* Navigation Arrows */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 shadow-md sm:shadow-lg rounded-full p-1.5 sm:p-2 transition-all duration-200"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 shadow-md sm:shadow-lg rounded-full p-1.5 sm:p-2 transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </>
          )}

          {/* Categories Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-6 px-4 sm:px-6 md:px-8">
            {currentSlideCategories.map((category) => {
              // Fix image URL if it contains localhost:5000
              const imageUrl = category.image?.url?.includes('localhost:5000') 
                ? getImageUrl(category.image.url)
                : category.image?.url || '/pics/battery.jpg'
              
              return (
                <button
                  key={category._id}
                  onClick={() => onCategorySelect(category._id)}
                  className="group flex flex-col items-center p-1 sm:p-2 transition-all duration-200"
                >
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 mb-1.5 sm:mb-2 md:mb-3 shadow-md sm:shadow-lg group-hover:shadow-xl transition-all duration-200">
                    <Image
                      src={imageUrl}
                      alt={category.image?.alt || category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/pics/battery.jpg'
                      }}
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-200 rounded-full" />
                  </div>
                  <span className="text-[10px] sm:text-xs md:text-sm font-bold text-gray-900 dark:text-gray-100 text-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight line-clamp-2">
                    {category.name}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Slide Indicators */}
          {totalSlides > 1 && (
            <div className="flex justify-center mt-3 sm:mt-4 md:mt-6 gap-1.5 sm:gap-2">
              {Array.from({ length: totalSlides }, (_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-200 ${
                    index === currentSlide
                      ? 'bg-blue-600 dark:bg-blue-500 w-4 sm:w-6'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 w-1.5 sm:w-2'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

