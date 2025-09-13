'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import Link from 'next/link'
import { toast } from 'react-toastify'

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

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchProducts()
    }
  }, [user])

  const fetchProducts = async () => {
    try {
      const response = await api.getProducts({ limit: 50 })
      setProducts(response.products)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return
    
    toast.success('🗑️ محصول با موفقیت حذف شد!', {
      position: 'top-right',
      autoClose: 2000,
    })
    
    try {
      await api.deleteProduct(id)
      setProducts(products.filter(p => p._id !== id))
    } catch (error) {
      toast.error('❌ خطا در حذف محصول', {
        position: 'top-right',
        autoClose: 3000,
      })
    }
  }

  if (user?.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">مدیریت محصولات</h1>
          <Link href="/admin/products/add" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            افزودن محصول
          </Link>
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">دستهبندی</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.brand}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link href={`/admin/products/edit/${product._id}`} className="text-blue-600 hover:text-blue-900 ml-4">
                        ویرایش
                      </Link>
                      <button onClick={() => deleteProduct(product._id)} className="text-red-600 hover:text-red-900">
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}