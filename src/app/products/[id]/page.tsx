'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
  rating: {
    rate: number
    count: number
  }
}

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`https://fakestoreapi.com/products/${id}`)
      const data = await response.json()
      setProduct(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching product:', error)
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(Math.round(price * 50000))
  }

  const translateCategory = (category: string) => {
    const translations: { [key: string]: string } = {
      "men's clothing": "پوشاک مردانه",
      "women's clothing": "پوشاک زنانه",
      "jewelery": "جواهرات",
      "electronics": "الکترونیک"
    }
    return translations[category] || category
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">محصول یافت نشد</h1>
          <p className="text-gray-600 mb-8">متأسفانه محصول مورد نظر شما وجود ندارد</p>
          <Link 
            href="/products" 
            className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105"
          >
            بازگشت به محصولات
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light">
      {/* Floating Particles Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-32 left-16 w-3 h-3 bg-pink-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-blue-600 transition-colors">خانه</Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <Link href="/products" className="text-gray-500 hover:text-blue-600 transition-colors">محصولات</Link>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-gray-900 font-medium">{product.title.slice(0, 30)}...</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-6">
            <div className="relative group">
              <div className="bg-white rounded-3xl shadow-2xl p-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-purple-100/20"></div>
                <div className="relative h-96 md:h-[500px]">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-contain transition-transform duration-700 group-hover:scale-110"
                    priority
                  />
                  
                  {/* Floating Badge */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    {translateCategory(product.category)}
                  </div>
                  
                  {/* Wishlist Button */}
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`absolute top-4 left-4 p-3 rounded-full shadow-lg transition-all transform hover:scale-110 ${
                      isWishlisted 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white text-gray-600 hover:text-red-500'
                    }`}
                  >
                    <svg className="w-6 h-6" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Image Thumbnails */}
            <div className="flex gap-4 justify-center">
              {[...Array(4)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden transition-all transform hover:scale-105 ${
                    selectedImage === index 
                      ? 'ring-4 ring-blue-500 shadow-lg' 
                      : 'ring-2 ring-gray-200 hover:ring-blue-300'
                  }`}
                >
                  <Image
                    src={product.image}
                    alt={`${product.title} ${index + 1}`}
                    fill
                    className="object-contain p-2"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4 leading-tight">
                {product.title}
              </h1>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-6 h-6 ${
                          i < Math.floor(product.rating.rate) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-lg font-medium text-gray-700">
                    {product.rating.rate} ({product.rating.count} نظر)
                  </span>
                </div>
                
                <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">موجود در انبار</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">قیمت محصول</p>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {formatPrice(product.price)} تومان
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-2">
                    ۲۰% تخفیف
                  </div>
                  <div className="text-gray-500 line-through text-lg">
                    {formatPrice(product.price * 1.2)} تومان
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-6 h-6 text-blue-600 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                توضیحات محصول
              </h3>
              <div className="relative">
                <p className={`text-gray-600 leading-relaxed transition-all duration-300 ${
                  showFullDescription ? '' : 'line-clamp-3'
                }`}>
                  {product.description}
                </p>
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-blue-600 hover:text-blue-700 font-medium mt-2 flex items-center"
                >
                  {showFullDescription ? 'نمایش کمتر' : 'نمایش بیشتر'}
                  <svg 
                    className={`w-4 h-4 mr-1 transition-transform ${showFullDescription ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="bg-white rounded-3xl p-8 shadow-lg space-y-6">
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-4">انتخاب تعداد</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <div className="w-20 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-xl font-bold">
                    {quantity}
                  </div>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-bold text-lg transform hover:scale-105 shadow-lg">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                    افزودن به سبد خرید
                  </div>
                </button>
                <button className="px-6 py-4 border-2 border-orange-500 text-orange-500 rounded-xl hover:bg-orange-500 hover:text-white transition-all font-bold transform hover:scale-105">
                  خرید فوری
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl p-8 border border-green-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 text-green-600 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                مزایای خرید از ما
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: '🛡️', text: 'گارانتی اصالت کالا' },
                  { icon: '🚚', text: 'ارسال رایگان بالای ۵۰۰ هزار تومان' },
                  { icon: '↩️', text: 'امکان بازگشت تا ۷ روز' },
                  { icon: '📞', text: 'پشتیبانی ۲۴ ساعته' }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                    <span className="text-2xl">{feature.icon}</span>
                    <span className="font-medium text-gray-700">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            محصولات مشابه
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="group bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all transform hover:-translate-y-2">
                <div className="relative h-40 mb-4">
                  <Image
                    src={product.image}
                    alt="محصول مشابه"
                    fill
                    className="object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">محصول مشابه {index + 1}</h3>
                <div className="text-blue-600 font-bold">{formatPrice(product.price * (0.8 + index * 0.1))} تومان</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}