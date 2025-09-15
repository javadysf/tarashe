'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/lib/api'

export default function DiscountedProductsSection() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDiscountedProducts()
  }, [])

  const fetchDiscountedProducts = async () => {
    try {
      const response = await api.getProducts({ limit: 20 })
      // Filter products with originalPrice and sort by discount percentage
      const discountedProducts = response.products
        .filter((product: any) => product.originalPrice && product.originalPrice > product.price)
        .map((product: any) => ({
          ...product,
          discountPercentage: Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        }))
        .sort((a: any, b: any) => b.discountPercentage - a.discountPercentage)
        .slice(0, 8)
      
      setProducts(discountedProducts)
    } catch (error) {
      console.error('Error fetching discounted products:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price)
  }

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-red-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-48 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-64 bg-gray-300 rounded-2xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-gradient-to-br from-red-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            پیشنهاد ویژه
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            بیشترین تخفیف‌ها
          </h2>
          <p className="text-xl text-gray-600">
            محصولات با بالاترین درصد تخفیف را از دست ندهید
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product._id}
              href={`/products/${product._id}`}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
            >
              {/* Discount Badge */}
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  {product.discountPercentage}% تخفیف
                </div>
              </div>

              {/* Product Image */}
              <div className="aspect-square bg-gray-100 overflow-hidden">
                <Image
                  src={product.images[0]?.url || '/pics/battery.jpg'}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Product Info */}
              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>
                
                <div className="mb-3">
                  <span className="text-sm text-gray-500">{product.brand}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating?.average || 0) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-sm text-gray-500 mr-1">
                    ({product.rating?.count || 0})
                  </span>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-red-600">
                      {formatPrice(product.price)} تومان
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="text-sm text-green-600 font-medium">
                      {formatPrice(product.originalPrice - product.price)} تومان صرفه‌جویی
                    </span>
                  </div>
                </div>

                {/* Stock Status */}
                <div className="mt-4">
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    product.stock > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock > 0 ? `${product.stock} عدد موجود` : 'ناموجود'}
                  </div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/products?sort=discount"
            className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-xl hover:bg-red-700 transition-all font-medium text-lg transform hover:scale-105 shadow-lg"
          >
            <span>مشاهده همه تخفیف‌ها</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}