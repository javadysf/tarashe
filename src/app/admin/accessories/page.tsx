'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Package, Search, Filter } from 'lucide-react'
import { api } from '@/lib/api'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'

interface Accessory {
  _id: string
  name: string
  description?: string
  price: number
  category: {
    _id: string
    name: string
  }
  brand: {
    _id: string
    name: string
  }
  images: Array<{
    url: string
    alt: string
  }>
  stock: number
  isActive: boolean
  isAccessory: boolean
  createdAt: string
}

interface Category {
  _id: string
  name: string
}

export default function AccessoriesPage() {
  const [accessories, setAccessories] = useState<Accessory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [filterActive, setFilterActive] = useState<boolean | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState('')

  const fetchAccessories = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      // Use getProducts directly with isAccessory filter
      const response = await api.getProducts({
        page: String(currentPage),
        limit: '20',
        isAccessory: 'true',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(filterActive !== null && { isActive: String(filterActive) })
      })
      
      // Handle response format - products API returns { products: [], pagination: {} }
      const accessoriesList = response?.products || []
      const totalPagesValue = response?.pagination?.totalPages || 1
      
      setAccessories(accessoriesList)
      setTotalPages(totalPagesValue)
    } catch (error: any) {
      console.error('Error fetching accessories:', error)
      setError(error.message || 'خطا در بارگذاری متعلقات')
      setAccessories([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, filterActive, searchTerm, selectedCategory])

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.getCategories()
      setCategories(response)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }, [])

  useEffect(() => {
    fetchAccessories()
    fetchCategories()
  }, [fetchAccessories, fetchCategories])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`آیا مطمئن هستید که می‌خواهید متعلق "${name}" را حذف کنید؟`)) {
      return
    }

    try {
      await api.deleteProduct(id)
      setAccessories(prev => prev.filter(acc => acc._id !== id))
    } catch (error: any) {
      console.error('Error deleting accessory:', error)
      alert(error.message || 'خطا در حذف متعلق')
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const accessory = accessories.find(acc => acc._id === id)
      if (!accessory) return

      await api.updateProduct(id, {
        ...accessory,
        isActive: !currentStatus
      })

      setAccessories(prev =>
        prev.map(acc =>
          acc._id === id ? { ...acc, isActive: !currentStatus } : acc
        )
      )
    } catch (error) {
      console.error('Error updating accessory:', error)
      alert('خطا در به‌روزرسانی متعلق')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR')
  }

  if (loading && accessories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">مدیریت متعلقات</h1>
            <p className="text-gray-600 dark:text-gray-400">مدیریت و سازماندهی متعلقات محصولات</p>
          </div>
          <Link
            href="/admin/products/add"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            افزودن متعلق جدید
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="جستجو در متعلقات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">همه دسته‌بندی‌ها</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterActive === null ? '' : filterActive.toString()}
              onChange={(e) => setFilterActive(e.target.value === '' ? null : e.target.value === 'true')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="true">فعال</option>
              <option value="false">غیرفعال</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('')
                setFilterActive(null)
                setCurrentPage(1)
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              پاک کردن فیلترها
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Accessories Grid */}
        {!loading && accessories.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">هیچ متعلقی یافت نشد</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || selectedCategory || filterActive !== null
                ? 'با فیلترهای انتخاب شده هیچ متعلقی یافت نشد. لطفاً فیلترها را پاک کنید.'
                : 'هنوز هیچ متعلقی ایجاد نشده است. برای ایجاد متعلق، محصول جدیدی با گزینه "متعلق" اضافه کنید.'
              }
            </p>
            <Link
              href="/admin/products/add"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              افزودن اولین متعلق
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accessories.map((accessory) => (
              <motion.div
                key={accessory._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {accessory.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{accessory.category.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(accessory._id, accessory.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          accessory.isActive
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        }`}
                      >
                        {accessory.isActive ? 'فعال' : 'غیرفعال'}
                      </button>
                    </div>
                  </div>

                  {/* Image */}
                  {accessory.images && accessory.images.length > 0 && (
                    <div className="mb-4 overflow-hidden rounded-lg">
                      <Image
                        src={accessory.images[0].url}
                        alt={accessory.images[0].alt || accessory.name}
                        width={600}
                        height={240}
                        className="w-full h-32 object-cover"
                        sizes="(max-width: 768px) 100vw, 600px"
                      />
                    </div>
                  )}

                  {/* Description */}
                  {accessory.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {accessory.description}
                    </p>
                  )}

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatPrice(accessory.price)}
                    </span>
                  </div>

                  {/* Stock */}
                  <div className="mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      موجودی: <span className="font-medium">{accessory.stock}</span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      href={`/admin/products/edit/${accessory._id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      ویرایش
                    </Link>
                    <button
                      onClick={() => handleDelete(accessory._id, accessory.name)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                قبلی
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                بعدی
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
