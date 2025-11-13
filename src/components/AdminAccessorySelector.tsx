'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import Image from 'next/image'

interface Accessory {
  _id: string
  name: string
  price: number
  images: Array<{
    url: string
    alt: string
  }>
  category?: {
    _id: string
    name: string
  }
}

interface Category {
  _id: string
  name: string
  parent?: string
  children?: Category[]
}

interface AdminAccessorySelectorProps {
  selectedAccessories: string[]
  onAccessoriesChange: (accessoryIds: string[]) => void
}

export default function AdminAccessorySelector({ selectedAccessories, onAccessoriesChange }: AdminAccessorySelectorProps) {
  const [accessories, setAccessories] = useState<Accessory[]>([])
  const [allAccessories, setAllAccessories] = useState<Accessory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('')
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Reset subcategories when parent changes
  useEffect(() => {
    setSelectedSubCategory('')
    setSelectedSubSubCategory('')
  }, [selectedCategory])

  useEffect(() => {
    setSelectedSubSubCategory('')
  }, [selectedSubCategory])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch products and categories in parallel
      const [productsResponse, categoriesResponse] = await Promise.all([
        api.getProducts({ limit: 100 }),
        api.getCategories()
      ])
      
      setAllAccessories(productsResponse.products || [])
      setCategories(categoriesResponse || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('خطا در بارگذاری داده‌ها')
    } finally {
      setLoading(false)
    }
  }, [])

  const filterAccessories = useCallback(() => {
    let filtered = [...allAccessories]

    // Filter by category (use the deepest selected level)
    const categoryToFilter = selectedSubSubCategory || selectedSubCategory || selectedCategory
    if (categoryToFilter) {
      filtered = filtered.filter(product => 
        product.category && product.category._id === categoryToFilter
      )
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setAccessories(filtered)
  }, [allAccessories, searchTerm, selectedCategory, selectedSubCategory, selectedSubSubCategory])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    filterAccessories()
  }, [filterAccessories])

  const getParentCategories = () => {
    return categories.filter(cat => !cat.parent)
  }

  const getSubCategories = (parentId: string) => {
    return categories.filter(cat => cat.parent === parentId)
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId)
    return category?.name || ''
  }

  const getSelectedCategoryPath = () => {
    const path = []
    if (selectedCategory) path.push(getCategoryName(selectedCategory))
    if (selectedSubCategory) path.push(getCategoryName(selectedSubCategory))
    if (selectedSubSubCategory) path.push(getCategoryName(selectedSubSubCategory))
    return path.join(' > ')
  }

  const handleAccessoryToggle = (accessoryId: string) => {
    if (selectedAccessories.includes(accessoryId)) {
      onAccessoriesChange(selectedAccessories.filter(id => id !== accessoryId))
    } else {
      onAccessoriesChange([...selectedAccessories, accessoryId])
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          متعلقات محصول
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border border-red-100">
        <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          خطا در بارگذاری متعلقات
        </h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          تلاش مجدد
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
      <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        متعلقات محصول
      </h3>
      
      <p className="text-gray-600 text-sm mb-4">
        محصولاتی که به عنوان متعلق این محصول در نظر گرفته می‌شوند را از لیست محصولات موجود انتخاب کنید
      </p>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">جستجو در محصولات</label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="نام محصول را جستجو کنید..."
              className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
            />
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Filter - Cascading */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">فیلتر بر اساس دسته‌بندی</label>
          
          {/* Level 1: Parent Category */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">دسته اصلی</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
            >
              <option value="">انتخاب دسته اصلی</option>
              {getParentCategories().map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Level 2: Sub Category */}
          {selectedCategory && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">زیردسته</label>
              <select
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
              >
                <option value="">انتخاب زیردسته</option>
                {getSubCategories(selectedCategory).map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Level 3: Sub-Sub Category */}
          {selectedSubCategory && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">زیردسته سطح سوم</label>
              <select
                value={selectedSubSubCategory}
                onChange={(e) => setSelectedSubSubCategory(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
              >
                <option value="">انتخاب زیردسته سطح سوم</option>
                {getSubCategories(selectedSubCategory).map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Filter Summary */}
        {(selectedCategory || searchTerm) && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>
              {selectedCategory && `مسیر: ${getSelectedCategoryPath()}`}
              {selectedCategory && searchTerm && ' • '}
              {searchTerm && `جستجو: "${searchTerm}"`}
            </span>
            <button
              onClick={() => {
                setSelectedCategory('')
                setSelectedSubCategory('')
                setSelectedSubSubCategory('')
                setSearchTerm('')
              }}
              className="text-red-500 hover:text-red-700 font-medium"
            >
              پاک کردن فیلترها
            </button>
          </div>
        )}
      </div>

      {accessories.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg font-medium mb-2">
            {allAccessories.length === 0 ? 'هیچ محصولی یافت نشد' : 'هیچ محصولی با این فیلترها یافت نشد'}
          </p>
          <p className="text-gray-400 text-sm">
            {allAccessories.length === 0 
              ? 'ابتدا محصولاتی را در سیستم ایجاد کنید' 
              : 'فیلترهای جستجو را تغییر دهید یا پاک کنید'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accessories.map((accessory) => (
            <div
              key={accessory._id}
              className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedAccessories.includes(accessory._id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => handleAccessoryToggle(accessory._id)}
            >
              <div className="flex items-start gap-3">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={accessory.images?.[0]?.url || '/pics/battery.jpg'}
                    alt={accessory.images?.[0]?.alt || accessory.name}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm leading-tight mb-1">
                    {accessory.name}
                  </h4>
                  {accessory.category && (
                    <p className="text-blue-600 text-xs mb-1">
                      {accessory.category.name}
                    </p>
                  )}
                  <p className="text-green-600 font-semibold text-sm">
                    {new Intl.NumberFormat('fa-IR').format(accessory.price)} تومان
                  </p>
                </div>
                
                <div className="flex-shrink-0">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedAccessories.includes(accessory._id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedAccessories.includes(accessory._id) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAccessories.length > 0 && (
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-blue-800 text-sm font-medium">
            {selectedAccessories.length} متعلق انتخاب شده است
          </p>
        </div>
      )}
    </div>
  )
}
