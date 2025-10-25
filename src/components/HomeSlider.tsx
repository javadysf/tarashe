'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
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
  
  // Slider scroll positions
  const [categoriesScroll, setCategoriesScroll] = useState(0)
  const [latestScroll, setLatestScroll] = useState(0)
  const [discountedScroll, setDiscountedScroll] = useState(0)
  const [brandsScroll, setBrandsScroll] = useState(0)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      
      // Mock data for now
      setCategories([
        { _id: '1', name: 'باتری لپ تاپ', description: 'انواع باتری لپ تاپ', image: { url: '/pics/battery.jpg' } },
        { _id: '2', name: 'شارژر لپ تاپ', description: 'شارژرهای اصل', image: { url: '/pics/battery.jpg' } },
        { _id: '3', name: 'قطعات لپ تاپ', description: 'قطعات یدکی', image: { url: '/pics/battery.jpg' } }
      ])
      
      setBrands([
        { _id: '1', name: 'HP', image: { url: '/pics/battery.jpg' } },
        { _id: '2', name: 'Dell', image: { url: '/pics/battery.jpg' } },
        { _id: '3', name: 'Lenovo', image: { url: '/pics/battery.jpg' } }
      ])
      
      setLatestProducts([
        {
          _id: '1',
          name: 'باتری HP Pavilion 15',
          brand: 'HP',
          model: 'Pavilion 15',
          price: 850000,
          originalPrice: 1200000,
          images: [{ url: '/pics/battery.jpg', alt: 'باتری HP' }],
          rating: { average: 4.8, count: 24 },
          inStock: true,
          stock: 25,
          createdAt: new Date().toISOString()
        }
      ])
      
      setDiscountedProducts([
        {
          _id: '1',
          name: 'باتری HP Pavilion 15',
          brand: 'HP',
          model: 'Pavilion 15',
          price: 850000,
          originalPrice: 1200000,
          images: [{ url: '/pics/battery.jpg', alt: 'باتری HP' }],
          rating: { average: 4.8, count: 24 },
          inStock: true,
          stock: 25,
          createdAt: new Date().toISOString(),
          discountPercentage: 29
        }
      ])
      
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

  const scrollSlider = (direction: 'left' | 'right', sliderType: 'categories' | 'latest' | 'discounted' | 'brands') => {
    const scrollAmount = 300
    const container = document.getElementById(`${sliderType}-slider`)
    
    if (container) {
      const newScroll = direction === 'left' 
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount
      
      container.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      })
      
      // Update state
      if (sliderType === 'categories') {
        setCategoriesScroll(newScroll)
      } else if (sliderType === 'latest') {
        setLatestScroll(newScroll)
      } else if (sliderType === 'discounted') {
        setDiscountedScroll(newScroll)
      } else if (sliderType === 'brands') {
        setBrandsScroll(newScroll)
      }
    }
  }

  const renderCategoriesSlider = () => (
    <div className="relative">
      {/* Left Arrow */}
      <button
        onClick={() => scrollSlider('left', 'categories')}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      {/* Right Arrow */}
      <button
        onClick={() => scrollSlider('right', 'categories')}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      <div 
        id="categories-slider"
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-16"
      >
        {categories.map((category) => (
          <Link
            key={category._id}
            href={`/products?category=${encodeURIComponent(category._id)}`}
            className="group relative glass rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center min-w-[150px] flex-shrink-0"
          >
            <div className="relative w-16 h-16 mx-auto mb-3 rounded-xl overflow-hidden bg-gray-100">
              <Image
                src={category.image?.url || '/pics/battery.jpg'}
                alt={category.image?.alt || category.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-yellow-300 transition-colors line-clamp-2">
              {category.name}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  )

  const renderLatestProductsSlider = () => (
    <div className="relative">
      {/* Left Arrow */}
      <button
        onClick={() => scrollSlider('left', 'latest')}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      {/* Right Arrow */}
      <button
        onClick={() => scrollSlider('right', 'latest')}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      <div 
        id="latest-slider"
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-16"
      >
        {latestProducts.map((product) => (
          <Link
            key={product._id}
            href={`/products/${product._id}`}
            className="group relative glass rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden min-w-[200px] flex-shrink-0"
          >
            <div className="absolute top-2 right-2 z-10">
              <div className="bg-gradient-4 text-white px-2 py-1 rounded-full text-xs font-bold">
                جدید
              </div>
            </div>
            
            <div className="aspect-square bg-gray-100 overflow-hidden">
              <Image
                src={product.images[0]?.url || '/pics/battery.jpg'}
                alt={product.name}
                width={200}
                height={200}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            
            <div className="p-3">
              <h3 className="font-bold text-sm text-white mb-1 group-hover:text-yellow-300 transition-colors line-clamp-2">
                {product.name}
              </h3>
              <div className="text-xs text-white/80 mb-2">{brandToText(product.brand)}</div>
              <div className="text-lg font-bold text-white">
                {formatPrice(product.price)} تومان
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )

  const renderDiscountedProductsSlider = () => (
    <div className="relative">
      {/* Left Arrow */}
      <button
        onClick={() => scrollSlider('left', 'discounted')}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      {/* Right Arrow */}
      <button
        onClick={() => scrollSlider('right', 'discounted')}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      <div 
        id="discounted-slider"
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-16"
      >
        {discountedProducts.map((product) => (
          <Link
            key={product._id}
            href={`/products/${product._id}`}
            className="group relative glass rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden min-w-[200px] flex-shrink-0"
          >
            <div className="absolute top-2 right-2 z-10">
              <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                {product.discountPercentage}% تخفیف
              </div>
            </div>
            
            <div className="aspect-square bg-gray-100 overflow-hidden">
              <Image
                src={product.images[0]?.url || '/pics/battery.jpg'}
                alt={product.name}
                width={200}
                height={200}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            
            <div className="p-3">
              <h3 className="font-bold text-sm text-white mb-1 group-hover:text-yellow-300 transition-colors line-clamp-2">
                {product.name}
              </h3>
              <div className="text-xs text-white/80 mb-2">{brandToText(product.brand)}</div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-white">
                  {formatPrice(product.price)} تومان
                </div>
                <div className="text-sm text-white/60 line-through">
                  {formatPrice(product.originalPrice)}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )

  const renderBrandsSlider = () => (
    <div className="relative">
      {/* Left Arrow */}
      <button
        onClick={() => scrollSlider('left', 'brands')}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      {/* Right Arrow */}
      <button
        onClick={() => scrollSlider('right', 'brands')}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      <div 
        id="brands-slider"
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-16"
      >
        {brands.map((brand) => (
          <Link
            key={brand._id}
            href={`/products?brand=${encodeURIComponent(brand._id)}`}
            className="group relative glass rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center min-w-[150px] flex-shrink-0"
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
            <div className="inline-flex items-center gap-2 glass text-white px-4 py-2 rounded-full text-sm font-medium mb-4 animate-pulse-glow">
              <span className="text-lg">📂</span>
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
            <div className="inline-flex items-center gap-2 glass text-white px-4 py-2 rounded-full text-sm font-medium mb-4 animate-pulse-glow">
              <span className="text-lg">🏷️</span>
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
      <section className="py-16 bg-gradient-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 glass text-white px-4 py-2 rounded-full text-sm font-medium mb-4 animate-pulse-glow">
              <span className="text-lg">🆕</span>
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
