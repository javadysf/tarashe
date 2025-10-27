'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, ShoppingCart, Eye, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'
import { toast } from 'react-toastify'
import AccessorySelector from './AccessorySelector'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

interface Accessory {
  _id: string
  accessory: {
    _id: string
    name: string
    price: number
    images: Array<{
      url: string
      alt: string
    }>
    description?: string
  }
  isSuggested: boolean
  bundleDiscount: number
  displayOrder: number
}

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
  attributes?: { [key: string]: string }
  accessories?: Accessory[]
}

interface ProductCardProps {
  product: Product
  index: number
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showAccessorySelector, setShowAccessorySelector] = useState(false)
  const { addItem } = useCartStore()
  const { user } = useAuthStore()

  useEffect(() => {
    // Optionally, preload liked status when logged in
    // This can be optimized by passing liked info in product list
  }, [user])

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

    // اگر متعلقات دارد، نمایش انتخابگر متعلقات
    if (product.accessories && product.accessories.length > 0) {
      setShowAccessorySelector(true)
      return
    }

    // اگر متعلقات ندارد، مستقیماً اضافه کن
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

  const handleAddWithAccessories = (selectedAccessories: any[]) => {
    const cartAccessories = selectedAccessories.map(acc => ({
      accessoryId: acc.accessoryId,
      name: product.accessories?.find(a => a.accessory._id === acc.accessoryId)?.accessory.name || '',
      price: acc.discountedPrice,
      quantity: acc.quantity,
      originalPrice: acc.originalPrice,
      discountedPrice: acc.discountedPrice
    }))

    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || '/pics/battery.jpg',
      quantity: 1,
      accessories: cartAccessories
    })

    toast.success(`${product.name} و متعلقات انتخاب شده به سبد خرید اضافه شد`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })

    setShowAccessorySelector(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500">
        {/* Product Image */}
        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50/30">
          <Link href={`/products/${product._id}`}>
            <Image
              src={product.images[0]?.url || '/pics/battery.jpg'}
              alt={product.images[0]?.alt || product.name}
              fill
              className="object-contain p-4 group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </Link>
          
          {/* Category Badge */}
          <Badge 
            variant="secondary" 
            className="absolute top-3 right-3 bg-blue-600 text-white border-0 shadow-lg"
          >
            {product.category.name}
          </Badge>

          {/* Stock Badge */}
          {product.stock < 5 && (
            <Badge 
              variant="destructive" 
              className="absolute top-3 left-3 animate-pulse"
            >
              {product.stock === 0 ? 'ناموجود' : `تنها ${product.stock} عدد`}
            </Badge>
          )}

          {/* Hover Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: isHovered ? 1 : 0, 
              y: isHovered ? 0 : 20 
            }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-3 left-3 right-3 flex gap-2"
          >
            <Button
              size="sm"
              variant="secondary"
              className="flex-1 bg-white/90 backdrop-blur-sm hover:bg-white"
              asChild
            >
              <Link href={`/products/${product._id}`}>
                <Eye className="w-4 h-4 mr-2" />
                مشاهده
              </Link>
            </Button>
            
            <Button
              size="sm"
              onClick={async () => {
                if (!user) {
                  toast.info('لطفاً برای پسندیدن وارد شوید')
                  return
                }
                try {
                  if (isFavorite) {
                    await api.unlikeProduct(product._id)
                    setIsFavorite(false)
                    toast.success('از پسندیده‌ها حذف شد')
                  } else {
                    await api.likeProduct(product._id)
                    setIsFavorite(true)
                    toast.success('به پسندیده‌ها اضافه شد')
                  }
                } catch (e: any) {
                  toast.error(e?.message || 'خطا در ثبت پسندیدن')
                }
              }}
              variant={isFavorite ? "default" : "secondary"}
              className="bg-white/90 backdrop-blur-sm hover:bg-white"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </motion.div>
        </div>

        <CardContent className="p-4 md:p-6">
          {/* Product Title */}
          <Link href={`/products/${product._id}`}>
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
              {product.name}
            </h3>
          </Link>
          
          {/* Brand */}
          {brandName && (
            <div className="text-xs md:text-sm text-gray-500 mb-2">برند: {brandName}</div>
          )}

          {/* Attributes */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {Object.entries(product.attributes).slice(0, 3).map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="text-xs">
                    {value}
                  </Badge>
                ))}
                {Object.keys(product.attributes).length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{Object.keys(product.attributes).length - 3} بیشتر
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="text-gray-600 text-xs md:text-sm mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </div>

          {/* Rating */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              {renderStars(product.rating.average)}
              <span className="mr-2 text-xs md:text-sm text-gray-600">
                ({product.rating.count})
              </span>
            </div>
            <div className="text-xs md:text-sm text-gray-500">
              امتیاز: {product.rating.average.toFixed(1)}
            </div>
          </div>

          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between">
            <div className="text-right">
              <div className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {formatPrice(product.price)}
              </div>
              <div className="text-xs md:text-sm text-gray-500">تومان</div>
            </div>
            
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
        </CardContent>
      </Card>

      {/* Accessory Selector Modal */}
      {product.accessories && product.accessories.length > 0 && (
        <AccessorySelector
          accessories={product.accessories}
          isOpen={showAccessorySelector}
          onClose={() => setShowAccessorySelector(false)}
          onAddToCart={handleAddWithAccessories}
          productName={product.name}
        />
      )}
    </motion.div>
  )
}