'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useCartStore } from '@/store/cartStore'
import { toast } from 'react-toastify'

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
}

export default function ProductSlider() {
  const [products, setProducts] = useState<Product[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [loading, setLoading] = useState(true)
  const { addItem } = useCartStore()

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.getProducts({ isFeatured: 'true', limit: 5 })
      let items: Product[] = response.products || []

      // Fallback: if no featured products, load latest products
      if (!items.length) {
        const fallback = await api.getProducts({ limit: 5 })
        items = fallback.products || []
      }

      setProducts(items)
    } catch (error) {
      console.error('Error fetching products:', error)
      // Final fallback on error
      try {
        const fallback = await api.getProducts({ limit: 5 })
        setProducts(fallback.products || [])
      } catch (e) {
        console.error('Error fetching fallback products:', e)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAutoPlaying || products.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, products.length])

  const nextSlide = () => {
    const newSlide = (currentSlide + 1) % products.length
    console.log('Next slide clicked, going to:', newSlide)
    setCurrentSlide(newSlide)
  }

  const prevSlide = () => {
    const newSlide = (currentSlide - 1 + products.length) % products.length
    console.log('Prev slide clicked, going to:', newSlide)
    setCurrentSlide(newSlide)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price)
  }

  const handleAddToCart = (product: Product) => {
    if (product.stock === 0) {
      toast.error('این محصول در حال حاضر موجود نیست')
      return
    }

    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || '/pics/battery.jpg',
      quantity: 1
    })

    toast.success(`${product.name} به سبد خرید اضافه شد`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
  }

  const brandToText = (brand: Product['brand']) => typeof brand === 'string' ? brand : brand?.name

  if (loading) {
    return (
      <section className="h-64 flex items-center bg-gradient-6">
        <div className="w-full">
          <div className="animate-pulse bg-gray-300 h-64"></div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="h-96 flex items-center bg-gradient-6 relative">
      <div className="w-full mx-auto">
        <div 
          className="relative overflow-hidden shadow-2xl"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div 
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(${currentSlide * 100}%)` }}
          >
            {products.map((product) => (
              <div key={product._id} className="w-full flex-shrink-0">
                <div className="relative h-[480px] bg-gradient-1">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <Image
                    src={product.images[0]?.url || '/pics/battery.jpg'}
                    alt={product.images[0]?.alt || product.name}
                    fill
                    className="object-cover mix-blend-overlay"
                    priority={products.indexOf(product) === currentSlide}
                  />
                  
                  <div className="relative z-10 h-64 flex items-center">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                      <div className="grid md:grid-cols-2 gap-6 items-center h-64 py-4">
                        <div className="text-white">
                          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                            <span className="text-sm font-medium">{brandToText(product.brand)}</span>
                          </div>
                          
                          <h3 className="text-2xl md:text-4xl lg:text-4xl font-bold mb-6 leading-tight">
                            {product.name}
                          </h3>
                          
                          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl">
                            مدل {product.model} - کیفیت اصل و گارانتی معتبر
                          </p>

                          <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-5 h-5 ${
                                    i < Math.floor(product.rating.average) ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="mr-2 text-sm">({product.rating.average})</span>
                            </div>
                            
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                              product.stock > 0 
                                ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
                                : 'bg-red-500/20 text-red-100 border border-red-400/30'
                            }`}>
                              {product.stock > 0 ? 'موجود در انبار' : 'ناموجود'}
                            </div>
                          </div>

                          <div className="flex items-center gap-6 mb-10">
                            <div className="text-2xl md:text-3xl font-bold">
                              {formatPrice(product.price)} تومان
                            </div>
                            {product.originalPrice && (
                              <div className="text-xl text-gray-300 line-through">
                                {formatPrice(product.originalPrice)}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                              href={`/products/${product._id}`}
                              className="bg-white text-gray-900 px-10 py-4 rounded-xl font-medium hover:bg-gray-100 transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                              مشاهده جزئیات
                            </Link>
                            <button 
                              className="border-2 border-white text-white px-10 py-4 rounded-xl font-medium hover:bg-white hover:text-gray-900 transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                              disabled={product.stock === 0}
                              onClick={() => handleAddToCart(product)}
                            >
                              {product.stock > 0 ? 'افزودن به سبد' : 'ناموجود'}
                            </button>
                          </div>
                        </div>

                        <div className="hidden md:block">
                          <div className="relative">
                            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl transform rotate-3 scale-105"></div>
                            <div className="relative bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                              <Image
                                src={product.images[0]?.url || '/pics/battery.jpg'}
                                alt={product.images[0]?.alt || product.name}
                                width={300}
                                height={200}
                                className="w-full h-48 object-cover rounded-xl"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-4 rounded-full hover:bg-white/30 transition-all duration-300 z-20 shadow-lg hover:shadow-xl"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-4 rounded-full hover:bg-white/30 transition-all duration-300 z-20 shadow-lg hover:shadow-xl"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}