'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/lib/api'
import { ChevronLeft, Home } from 'lucide-react'

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
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  const displayCategories = getDisplayCategories()
  const breadcrumb = getBreadcrumb()

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
          <Link 
            href="/products" 
            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            همه محصولات
          </Link>
          {breadcrumb.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2">
              <span className="text-gray-300">›</span>
              <button
                onClick={() => onCategorySelect(item.id)}
                className="hover:text-blue-600 transition-colors"
              >
                {item.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Back Button */}
      {currentCategory && (
        <div className="mb-6">
          <button
            onClick={() => {
              if (parentCategory) {
                onCategorySelect(parentCategory._id)
              } else {
                onCategorySelect('')
              }
            }}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {parentCategory ? `بازگشت به ${parentCategory.name}` : 'بازگشت به همه دسته‌ها'}
          </button>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
        {displayCategories.map((category) => (
          <button
            key={category._id}
            onClick={() => onCategorySelect(category._id)}
            className="group flex flex-col items-center p-2 transition-all duration-200"
          >
            <div className="relative w-28 h-28 rounded-full overflow-hidden bg-gray-100 mb-3 shadow-lg group-hover:shadow-xl transition-all duration-200">
              <Image
                src={category.image?.url || '/pics/battery.jpg'}
                alt={category.image?.alt || category.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-200"
              />
              {/* Circular overlay for better text visibility */}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-200 rounded-full" />
            </div>
            <span className="text-md font-black text-gray-900 text-center group-hover:text-blue-600 transition-colors leading-tight">
              {category.name}
            </span>
          </button>
        ))}
      </div>

    </div>
  )
}

