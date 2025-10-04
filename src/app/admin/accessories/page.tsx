'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Package, Search, Filter } from 'lucide-react'
import { api } from '@/lib/api'
import Link from 'next/link'

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

  useEffect(() => {
    fetchAccessories()
    fetchCategories()
  }, [currentPage, searchTerm, selectedCategory, filterActive])

  const fetchAccessories = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: currentPage,
        limit: 20
      }
      
      if (searchTerm) params.search = searchTerm
      if (selectedCategory) params.category = selectedCategory
      if (filterActive !== null) params.isActive = filterActive
      
      const response = await api.getAccessories(params)
      setAccessories(response.accessories || [])
      setTotalPages(response.totalPages || 1)
    } catch (error) {
      console.error('Error fetching accessories:', error)
      setError('خطا در بارگذاری متعلقات')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories()
      setCategories(response)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`آیا مطمئن هستید که می‌خواهید متعلق "${name}" را حذف کنید؟`)) {
      return
    }

    try {
      await api.deleteProduct(id)
      setAccessories(accessories.filter(acc => acc._id !== id))
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

      setAccessories(accessories.map(acc => 
        acc._id === id ? { ...acc, isActive: !currentStatus } : acc
      ))
    } catch (error) {
      console.error('Error updating accessory:', error)
      alert('خطا در به‌روزرسانی متعلق')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR')
  }

  if (loading && accessories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">مدیریت متعلقات</h1>
            <p className="text-gray-600">مدیریت و سازماندهی متعلقات محصولات</p>
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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="جستجو در متعلقات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              پاک کردن فیلترها
            </button>
          </div>
        </div>

        {/* Accessories Grid */}
        {accessories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">هیچ متعلقی یافت نشد</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory || filterActive !== null
                ? 'با فیلترهای انتخاب شده هیچ متعلقی یافت نشد'
                : 'هنوز هیچ متعلقی ایجاد نشده است'
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
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {accessory.name}
                      </h3>
                      <p className="text-sm text-gray-600">{accessory.category.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(accessory._id, accessory.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          accessory.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {accessory.isActive ? 'فعال' : 'غیرفعال'}
                      </button>
                    </div>
                  </div>

                  {/* Image */}
                  {accessory.images && accessory.images.length > 0 && (
                    <div className="mb-4">
                      <img
                        src={accessory.images[0].url}
                        alt={accessory.images[0].alt || accessory.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Description */}
                  {accessory.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {accessory.description}
                    </p>
                  )}

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-lg font-bold text-blue-600">
                      {formatPrice(accessory.price)}
                    </span>
                  </div>

                  {/* Stock */}
                  <div className="mb-4">
                    <span className="text-sm text-gray-600">
                      موجودی: <span className="font-medium">{accessory.stock}</span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <Link
                      href={`/admin/products/edit/${accessory._id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      ویرایش
                    </Link>
                    <button
                      onClick={() => handleDelete(accessory._id, accessory.name)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
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
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
