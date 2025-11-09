'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'

interface Product {
  _id: string
  name: string
  brand: string | { _id: string; name: string; image?: string; isActive?: boolean; createdAt?: string; updatedAt?: string; __v?: number }
  model: string
  price: number
  originalPrice?: number
  images: { url: string; alt: string }[]
  rating: { average: number; count: number }
  inStock: boolean
  stock: number
  createdAt: string
  attributes?: { [key: string]: string }
}

export default function LatestProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLatestProducts()
  }, [])

  const fetchLatestProducts = async () => {
    try {
      const response = await api.getProducts({ limit: 8, sort: 'newest' })
      setProducts(response.products || [])
    } catch (error) {
      console.error('Error fetching latest products:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price)
  }

  const brandToText = (brand: Product['brand']) => typeof brand === 'string' ? brand : brand?.name

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <section className="py-16 bg-gradient-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-white/20 rounded w-48 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-64 bg-white/20 rounded-2xl"></div>
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
    <section className="py-16 bg-gradient-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 glass text-white px-4 py-2 rounded-full text-sm font-medium mb-4 animate-pulse-glow">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            جدیدترین محصولات
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
            تازه‌ترین محصولات
          </h2>
          <p className="text-xl text-white/90 drop-shadow-md">
            جدیدترین محصولات اضافه شده به فروشگاه
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                href={`/products/${product._id}`}
                className="group relative glass rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden animate-bounce-in"
              >
                {/* New Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-gradient-4 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    جدید
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
                  <h3 className="font-bold text-lg text-white mb-2 group-hover:text-yellow-300 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <div className="mb-3">
                    <span className="text-sm text-white/80">{brandToText(product.brand)}</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating?.average || 0) ? 'text-yellow-400' : 'text-white/30'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-sm text-white/80 mr-1">
                      ({product.rating?.count || 0})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white">
                        {formatPrice(product.price)} تومان
                      </span>
                    </div>
                    {product.originalPrice && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg text-white/60 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                        <span className="text-sm text-yellow-300 font-medium">
                          {formatPrice(product.originalPrice - product.price)} تومان صرفه‌جویی
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Date Added */}
                  <div className="text-xs text-white/60 mb-3">
                    اضافه شده در {formatDate(product.createdAt)}
                  </div>

                  {/* Stock Status */}
                  <div className="mt-4">
                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      product.stock > 0 
                        ? 'bg-green-500/20 text-green-200 border border-green-400/30' 
                        : 'bg-red-500/20 text-red-200 border border-red-400/30'
                    }`}>
                      {product.stock > 0 ? `${product.stock} عدد موجود` : 'ناموجود'}
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/products?sort=newest"
            className="inline-flex items-center gap-2 bg-gradient-4 text-white px-8 py-4 rounded-xl hover:shadow-2xl transition-all font-medium text-lg transform hover:scale-105 shadow-lg animate-pulse-glow"
          >
            <span>مشاهده همه محصولات جدید</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}






























