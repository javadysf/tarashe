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
  brand: string
  category: { name: string }
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await api.getProducts({ page: String(page), limit: String(limit), search: searchTerm || '' })
      setProducts(response.products || [])
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
      // Refetch current page after deletion
      fetchProducts()
    } catch (error) {
      toast.error('❌ خطا در حذف محصول', {
        position: 'top-right',
        autoClose: 3000,
      })
    }
  }

  if (user?.role !== 'admin') return null

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">مدیریت محصولات</h1>
          <Link href="/admin/products/add" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            افزودن محصول
          </Link>
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
              className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {totalProducts > 0 ? `${totalProducts} محصول` : 'محصولی یافت نشد'}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نام</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">برند</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">قیمت</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">موجودی</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">دسته بندی</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof product.brand === 'object' ? product.brand?.name : product.brand}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Intl.NumberFormat('fa-IR').format(product.price)} تومان
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2 justify-end">
                          <Link 
                            href={`/admin/products/edit/${product._id}`} 
                            className="text-blue-600 hover:text-blue-900 transition-colors px-3 py-1 rounded bg-blue-50 hover:bg-blue-100"
                          >
                            ویرایش
                          </Link>
                          <button 
                            onClick={() => deleteProduct(product._id)} 
                            className="text-red-600 hover:text-red-900 transition-colors px-3 py-1 rounded bg-red-50 hover:bg-red-100"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {searchTerm ? 'نتیجه‌ای یافت نشد' : 'هیچ محصولی موجود نیست'}
                        </h3>
                        <p className="text-gray-500">
                          {searchTerm 
                            ? `برای "${searchTerm}" محصولی یافت نشد. کلمات کلیدی دیگری امتحان کنید.`
                            : 'اولین محصول خود را اضافه کنید'
                          }
                        </p>
                        {searchTerm && (
                          <button
                            onClick={() => handleSearch('')}
                            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
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
            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-t">
              <div className="text-sm text-gray-600">
                صفحه {page} از {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={`px-3 py-1 rounded-lg border text-sm ${page <= 1 ? 'text-gray-300 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  قبلی
                </button>
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 rounded-lg text-sm border ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={`px-3 py-1 rounded-lg border text-sm ${page >= totalPages ? 'text-gray-300 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
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