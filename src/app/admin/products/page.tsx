'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import Link from 'next/link'
import { toast } from 'react-toastify'
import AdminSidebar from '@/components/AdminSidebar'

interface Product {
  _id: string
  name: string
  price: number
  stock: number
  brand: string | { name: string } | null | undefined
  category?: { name: string } | string | null
  isActive: boolean
}

export default function AdminProductsPage() {
  const { user } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [sortField, setSortField] = useState<'stock' | 'name' | 'price' | 'brand' | 'category'>('stock')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const limit = 10

  // Compute visible page numbers (stable hook order)
  const pageNumbers = useMemo(() => {
    const pages: number[] = []
    const maxToShow = 5
    const half = Math.floor(maxToShow / 2)
    let start = Math.max(1, page - half)
    let end = Math.min(totalPages, start + maxToShow - 1)
    if (end - start + 1 < maxToShow) {
      start = Math.max(1, end - maxToShow + 1)
    }
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }, [page, totalPages])

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchProducts()
      setSelectedProducts([]) // Clear selection when page changes
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page, sortField, sortOrder])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      // Map frontend sort field to backend sort parameter
      let sortParam = ''
      if (sortField === 'stock') {
        sortParam = sortOrder === 'asc' ? 'stock-asc' : 'stock-desc'
      } else if (sortField === 'price') {
        sortParam = sortOrder === 'asc' ? 'price-asc' : 'price-desc'
      } else if (sortField === 'name') {
        sortParam = sortOrder === 'asc' ? 'name' : 'name-desc'
      }
      
      const response = await api.getProducts({ 
        page: String(page), 
        limit: String(limit), 
        search: searchTerm || '',
        sort: sortParam || undefined
      })
      
      // Sort on frontend for fields that backend doesn't support or for all fields to ensure consistency
      let sortedProducts = response.products || []
      sortedProducts = [...sortedProducts].sort((a, b) => {
        let aValue: any
        let bValue: any
        
        if (sortField === 'stock') {
          aValue = a.stock
          bValue = b.stock
        } else if (sortField === 'price') {
          aValue = a.price
          bValue = b.price
        } else if (sortField === 'name') {
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
        } else if (sortField === 'brand') {
          aValue = (typeof a.brand === 'object' ? a.brand?.name : a.brand || '').toLowerCase()
          bValue = (typeof b.brand === 'object' ? b.brand?.name : b.brand || '').toLowerCase()
        } else if (sortField === 'category') {
          aValue = (typeof a.category === 'object' ? a.category?.name : a.category || '').toLowerCase()
          bValue = (typeof b.category === 'object' ? b.category?.name : b.category || '').toLowerCase()
        }
        
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
      
      setProducts(sortedProducts)
      setTotalPages(response.pagination?.totalPages || 1)
      setTotalProducts(response.pagination?.totalProducts || 0)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setPage(1)
  }

  const handleSort = (field: 'stock' | 'name' | 'price' | 'brand' | 'category') => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new field with ascending order
      setSortField(field)
      setSortOrder('asc')
    }
    setPage(1) // Reset to first page when sorting changes
  }

  const getSortIcon = (field: 'stock' | 'name' | 'price' | 'brand' | 'category') => {
    if (sortField !== field) {
      return (
        <span className="text-gray-400 dark:text-gray-500 ml-1">⇅</span>
      )
    }
    return sortOrder === 'asc' ? (
      <span className="text-blue-600 dark:text-blue-400 ml-1">↑</span>
    ) : (
      <span className="text-blue-600 dark:text-blue-400 ml-1">↓</span>
    )
  }

  // Debounce search
  useEffect(() => {
    if (user?.role !== 'admin') return
    const t = setTimeout(() => {
      fetchProducts()
    }, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

  const deleteProduct = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return
    
    toast.success('🗑️ محصول با موفقیت حذف شد!', {
      position: 'top-right',
      autoClose: 2000,
    })
    
    try {
      await api.deleteProduct(id)
      setSelectedProducts(selectedProducts.filter(p => p !== id))
      fetchProducts()
    } catch (error) {
      toast.error('❌ خطا در حذف محصول', {
        position: 'top-right',
        autoClose: 3000,
      })
    }
  }

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map(p => p._id))
    }
  }

  const toggleSelectProduct = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const deleteSelected = async () => {
    if (selectedProducts.length === 0) return
    if (!confirm(`آیا مطمئن هستید که می‌خواهید ${selectedProducts.length} محصول را حذف کنید؟`)) return

    try {
      await api.bulkDeleteProducts(selectedProducts)
      toast.success(`🗑️ ${selectedProducts.length} محصول با موفقیت حذف شد!`, {
        position: 'top-right',
        autoClose: 2000,
      })
      setSelectedProducts([])
      fetchProducts()
    } catch (error) {
      toast.error('❌ خطا در حذف محصولات', {
        position: 'top-right',
        autoClose: 3000,
      })
    }
  }

  if (user?.role !== 'admin') return null

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex-1">
        <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">مدیریت محصولات</h1>
          <div className="flex items-center gap-2">
            {selectedProducts.length > 0 && (
              <button
                onClick={deleteSelected}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm sm:text-base"
              >
                حذف انتخاب شده ({selectedProducts.length})
              </button>
            )}
            <Link href="/admin/products/add" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-center text-sm sm:text-base">
              افزودن محصول
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="جستجو در محصولات (نام، برند، دسته بندی)..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="block w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
            />
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {totalProducts > 0 ? `${totalProducts} محصول` : 'محصولی یافت نشد'}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    <input
                      type="checkbox"
                      checked={products.length > 0 && selectedProducts.length === products.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th 
                    className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center justify-end">
                      نام
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase hidden sm:table-cell cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none"
                    onClick={() => handleSort('brand')}
                  >
                    <div className="flex items-center justify-end">
                      برند
                      {getSortIcon('brand')}
                    </div>
                  </th>
                  <th 
                    className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center justify-end">
                      قیمت
                      {getSortIcon('price')}
                    </div>
                  </th>
                  <th 
                    className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase hidden md:table-cell cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none"
                    onClick={() => handleSort('stock')}
                  >
                    <div className="flex items-center justify-end">
                      موجودی
                      {getSortIcon('stock')}
                    </div>
                  </th>
                  <th 
                    className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase hidden lg:table-cell cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center justify-end">
                      دسته بندی
                      {getSortIcon('category')}
                    </div>
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {products.length > 0 ? (
                  products.map((product) => {
                    const isLowStock = product.stock < 15
                    return (
                      <tr 
                        key={product._id} 
                        className={`
                          ${selectedProducts.includes(product._id) 
                            ? 'bg-blue-50 dark:bg-blue-900/20' 
                            : isLowStock 
                              ? 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30' 
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }
                          transition-colors
                        `}
                      >
                        <td className="px-3 sm:px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product._id)}
                            onChange={() => toggleSelectProduct(product._id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className={`px-3 sm:px-6 py-4 text-sm font-medium ${isLowStock ? 'text-red-900 dark:text-red-200' : 'text-gray-900 dark:text-gray-100'}`}>
                          <div className="truncate max-w-32 sm:max-w-none">{product.name}</div>
                        </td>
                        <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm hidden sm:table-cell ${isLowStock ? 'text-red-700 dark:text-red-300' : 'text-gray-500 dark:text-gray-400'}`}>
                          {typeof product.brand === 'object' ? product.brand?.name : product.brand}
                        </td>
                        <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm ${isLowStock ? 'text-red-700 dark:text-red-300' : 'text-gray-500 dark:text-gray-400'}`}>
                          <div className="text-xs sm:text-sm">{new Intl.NumberFormat('fa-IR').format(product.price)} ت</div>
                        </td>
                        <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold hidden md:table-cell ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                          <span className="flex items-center gap-1">
                            {product.stock}
                            {isLowStock && (
                              <span className="text-xs text-red-600 dark:text-red-400" title="موجودی کم">⚠️</span>
                            )}
                          </span>
                        </td>
                        <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm hidden lg:table-cell ${isLowStock ? 'text-red-700 dark:text-red-300' : 'text-gray-500 dark:text-gray-400'}`}>
                          {typeof product.category === 'object'
                            ? product.category?.name
                            : product.category || '—'}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                            <Link 
                              href={`/admin/products/edit/${product._id}`} 
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors px-2 sm:px-3 py-1 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-xs sm:text-sm text-center"
                            >
                              ویرایش
                            </Link>
                            <button 
                              onClick={() => deleteProduct(product._id)} 
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors px-2 sm:px-3 py-1 rounded bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-xs sm:text-sm"
                            >
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-3 sm:px-6 py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          {searchTerm ? 'نتیجه‌ای یافت نشد' : 'هیچ محصولی موجود نیست'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          {searchTerm 
                            ? `برای "${searchTerm}" محصولی یافت نشد. کلمات کلیدی دیگری امتحان کنید.`
                            : 'اولین محصول خود را اضافه کنید'
                          }
                        </p>
                        {searchTerm && (
                          <button
                            onClick={() => handleSearch('')}
                            className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                          >
                            پاک کردن جستجو
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
            {/* Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 sm:px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-right">
                صفحه {page} از {totalPages}
              </div>
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={`px-2 sm:px-3 py-1 rounded-lg border text-xs sm:text-sm ${page <= 1 ? 'text-gray-300 dark:text-gray-600 border-gray-200 dark:border-gray-700' : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  قبلی
                </button>
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm border ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={`px-2 sm:px-3 py-1 rounded-lg border text-xs sm:text-sm ${page >= totalPages ? 'text-gray-300 dark:text-gray-600 border-gray-200 dark:border-gray-700' : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  بعدی
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}