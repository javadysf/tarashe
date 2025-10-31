'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/lib/api'
import { Carousel } from '@/components/ui/carousel'
import ProductCard from '@/components/ProductCard'

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

interface Category {
  _id: string
  name: string
  description?: string
  image?: { url?: string; alt?: string }
  parent?: string | null
}

interface Brand {
  _id: string
  name: string
  image?: { url?: string; alt?: string }
  isActive?: boolean
}

export default function HomeSlider() {
  const [categories, setCategories] = useState<Category[]>([])
  const [latestProducts, setLatestProducts] = useState<Product[]>([])
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  


  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      
      // Fetch real categories
      const categoriesResponse = await api.getCategories()
      setCategories(categoriesResponse || [])
      
      // Fetch real brands
      try {
        const brandsResponse = await api.getBrands()
        setBrands(brandsResponse || [])
      } catch (error) {
        console.error('Error fetching brands:', error)
        setBrands([])
      }
      
      // Fetch latest products
      try {
        const latestResponse = await api.getProducts({ sort: 'newest', limit: 10 })
        setLatestProducts(latestResponse.products || [])
      } catch (error) {
        console.error('Error fetching latest products:', error)
        setLatestProducts([])
      }
      
      // Fetch discounted products
      try {
        const discountedResponse = await api.getProducts({ sort: 'discount', limit: 10 })
        setDiscountedProducts(discountedResponse.products || [])
      } catch (error) {
        console.error('Error fetching discounted products:', error)
        setDiscountedProducts([])
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
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



  const chunkArray = <T,>(items: T[], chunkSize: number): T[][] => {
    const result: T[][] = []
    for (let i = 0; i < items.length; i += chunkSize) {
      result.push(items.slice(i, i + chunkSize))
    }
    return result
  }

  const getCategoryImage = (category: Category) => {
    if (category.image?.url) {
      let imageUrl = category.image.url
      
      // Fix old localhost:5000 URLs to use localhost:3002
      if (imageUrl.includes('localhost:5000')) {
        imageUrl = imageUrl.replace('localhost:5000', 'localhost:3002')
      }
      
      // If URL starts with /uploads, prepend backend URL
      if (imageUrl.startsWith('/uploads')) {
        imageUrl = `http://localhost:3002${imageUrl}`
      }
      
      return imageUrl
    }
    return '/pics/battery.jpg'
  }



  const renderCategoriesSlider = () => {
    if (categories.length === 0) return null
    
    return (
      <div className="sm:px-12">
        <Carousel>
          {chunkArray(categories, 10).map((catChunk, idx) => (
            <div key={idx} className="w-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {catChunk.map((category) => (
                  <Link
                    key={category._id}
                    href={`/products?category=${encodeURIComponent(category._id)}`}
                    className="group relative glass rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center block"
                  >
                    <div className="relative w-32 h-32 sm:w-32 sm:h-32 mx-auto mb-2 rounded-full overflow-hidden bg-white ring-[0.5px] ring-white/30 shadow-lg shadow-white/20">
                      <Image
                        src={getCategoryImage(category)}
                        alt={category.image?.alt || category.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                        unoptimized={category.image?.url?.startsWith('/uploads')}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          if (!target.src.includes('/pics/battery.jpg')) {
                            target.src = '/pics/battery.jpg'
                          }
                        }}
                      />
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-yellow-300 transition-colors line-clamp-2">
                      {category.name}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    )
  }

  const renderLatestProductsSlider = () => (
    <div className="sm:px-8">
      <Carousel>
        {chunkArray(latestProducts, 4).map((prodChunk, idx) => (
          <div key={idx} className="w-full">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2">
              {prodChunk.map((product, i) => (
                <div key={product._id} className="w-full sm:max-w-[260px] mx-auto sm:h-[420px]">
                  <ProductCard product={product} index={i} className="h-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  )

  const renderDiscountedProductsSlider = () => (
    <div className="sm:px-12">
      <Carousel>
        {chunkArray(discountedProducts, 4).map((prodChunk, idx) => (
          <div key={idx} className="w-full">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
              {prodChunk.map((product, i) => (
                <div key={product._id} className="w-full max-w-[160px] sm:max-w-[200px] mx-auto h-[320px] md:h-[420px]">
                  <ProductCard product={product} index={i} className="h-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  )

  const renderBrandsSlider = () => (
    <div className="sm:px-12">
      <Carousel>
        {chunkArray(brands, 6).map((brandChunk, idx) => (
          <div key={idx} className="w-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {brandChunk.map((brand) => (
                <Link
                  key={brand._id}
                  href={`/products?brand=${encodeURIComponent(brand._id)}`}
                  className="group relative glass rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center block"
                >
                  <div className="relative w-16 h-16 mx-auto mb-3 rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={brand.image?.url || '/pics/battery.jpg'}
                      alt={brand.image?.alt || brand.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-yellow-300 transition-colors line-clamp-2">
                    {brand.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  )


  if (loading) {
    return (
      <section className="py-16 bg-gradient-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded w-64 mx-auto mb-4"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-48 bg-white/20 rounded-2xl"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-16">
      {/* Categories Slider */}
      <section className="py-16 bg-gradient-7">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 glass text-white px-4 py-2 rounded-full text-2xl font-medium mb-4 animate-pulse-glow">
              <span className="text-2xl">📂</span>
              دسته‌بندی‌ها
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
              دسته‌بندی محصولات
            </h2>
            <p className="text-lg text-white/90 drop-shadow-md">
              انتخاب کنید و خرید کنید
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            {renderCategoriesSlider()}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 bg-gradient-3 text-white px-8 py-4 rounded-xl hover:shadow-2xl transition-all font-medium text-lg transform hover:scale-105 shadow-lg animate-pulse-glow"
            >
              <span>مشاهده همه دسته‌بندی‌ها</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Brands Slider */}
      <section className="py-16 bg-gradient-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 glass text-white px-4 py-2 rounded-full text-2xl font-medium mb-4 animate-pulse-glow">
              <span className="text-2xl">🏷️</span>
              برندها
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
              برندهای معتبر
            </h2>
            <p className="text-lg text-white/90 drop-shadow-md">
              محصولات با کیفیت از بهترین برندها
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            {renderBrandsSlider()}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gradient-4 text-white px-8 py-4 rounded-xl hover:shadow-2xl transition-all font-medium text-lg transform hover:scale-105 shadow-lg animate-pulse-glow"
            >
              <span>مشاهده همه برندها</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Latest Products Slider */}
      <section className="py-12 bg-gradient-3">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 glass text-white px-2 py-2 rounded-full text-2xl font-medium mb-4 animate-pulse-glow">
              <span className="text-xl">🆕</span>
              جدیدترین محصولات
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
              تازه‌ترین محصولات
            </h2>
            <p className="text-lg text-white/90 drop-shadow-md">
              جدیدترین محصولات اضافه شده به فروشگاه
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            {renderLatestProductsSlider()}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
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

      {/* Discounted Products Slider */}
      <section className="py-16 bg-gradient-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 glass text-white px-4 py-2 rounded-full text-sm font-medium mb-4 animate-pulse-glow">
              <span className="text-lg">🔥</span>
              پیشنهاد ویژه
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
              بیشترین تخفیف‌ها
            </h2>
            <p className="text-lg text-white/90 drop-shadow-md">
              محصولات با بالاترین درصد تخفیف را از دست ندهید
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            {renderDiscountedProductsSlider()}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              href="/products?sort=discount"
              className="inline-flex items-center gap-2 bg-gradient-2 text-white px-8 py-4 rounded-xl hover:shadow-2xl transition-all font-medium text-lg transform hover:scale-105 shadow-lg animate-pulse-glow"
            >
              <span>مشاهده همه تخفیف‌ها</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
