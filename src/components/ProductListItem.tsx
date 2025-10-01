'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, ShoppingCart, Eye, Heart } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { toast } from 'react-toastify'

interface Product {
  _id: string
  name: string
  price: number
  description: string
  category: {
    _id: string
    name: string
  }
  images: { url: string; alt: string }[]
  rating: {
    average: number
    count: number
  }
  brand: string | { _id: string; name: string; image?: string; isActive?: boolean; createdAt?: string; updatedAt?: string; __v?: number }
  stock: number
}

interface ProductListItemProps {
  product: Product
  index: number
}

export default function ProductListItem({ product, index }: ProductListItemProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const { addItem } = useCartStore()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price)
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  const brandName = typeof product.brand === 'string' ? product.brand : product.brand?.name

  const handleAddToCart = () => {
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

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
    >
      <Card className="group overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Product Image */}
            <div className="relative w-full md:w-48 h-48 flex-shrink-0 overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl">
              <Link href={`/products/${product._id}`}>
                <Image
                  src={product.images[0]?.url || '/pics/battery.jpg'}
                  alt={product.images[0]?.alt || product.name}
                  fill
                  className="object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 200px"
                />
              </Link>
              
              {/* Category Badge */}
              <Badge 
                variant="secondary" 
                className="absolute top-3 right-3 bg-blue-600 text-white border-0 shadow-lg text-xs"
              >
                {product.category.name}
              </Badge>

              {/* Stock Badge */}
              {product.stock < 5 && (
                <Badge 
                  variant="destructive" 
                  className="absolute top-3 left-3 animate-pulse text-xs"
                >
                  {product.stock === 0 ? 'ناموجود' : `${product.stock} عدد`}
                </Badge>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                {/* Product Title */}
                <Link href={`/products/${product._id}`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                    {product.name}
                  </h3>
                </Link>
                
                {/* Brand */}
                {brandName && (
                  <div className="text-sm text-gray-500 mb-2">برند: {brandName}</div>
                )}

                {/* Description */}
                <div className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {product.description}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {renderStars(product.rating.average)}
                    <span className="mr-2 text-sm text-gray-600">
                      ({product.rating.count} نظر)
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    امتیاز: {product.rating.average.toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Price and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {formatPrice(product.price)}
                  </div>
                  <div className="text-sm text-gray-500">تومان</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="border-2 border-gray-200 hover:border-red-300 hover:bg-red-50"
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Link href={`/products/${product._id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      مشاهده
                    </Link>
                  </Button>
                  
                  <Button
                    size="sm"
                    disabled={product.stock === 0}
                    onClick={handleAddToCart}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {product.stock === 0 ? 'ناموجود' : 'افزودن'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}