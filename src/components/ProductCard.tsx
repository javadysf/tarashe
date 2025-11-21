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
  originalPrice?: number
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
  className?: string
}

export default function ProductCard({ product, index, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showAccessorySelector, setShowAccessorySelector] = useState(false)
  const { addItem } = useCartStore()
  const { user } = useAuthStore()

  useEffect(() => {
    // Optionally, preload liked status when logged in
  }, [user])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price)
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-2.5 h-2.5 md:w-4 md:h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  const brandName = typeof product.brand === 'string' ? product.brand : product.brand?.name
  const hasDiscount = typeof product.originalPrice === 'number' && product.originalPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice as number) - product.price) / (product.originalPrice as number) * 100)
    : 0

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error('این محصول در حال حاضر موجود نیست')
      return
    }

    if (product.accessories && product.accessories.length > 0) {
      setShowAccessorySelector(true)
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
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        ease: "easeOut"
      }}
      whileHover={{ y: -6 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Mobile Design */}
      <Card className="md:hidden w-full h-[210px] group relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl transition-all duration-300 rounded-lg flex flex-col">
        {/* Image Section - ~30% of height */}
        <div className="relative  h-[80px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
          <Link href={`/products/${product._id}`}>
            <Image
              src={product.images[0]?.url || '/pics/battery.jpg'}
              alt={product.images[0]?.alt || product.name}
              fill
              className="object-contain p-1 group-hover:scale-105 transition-transform duration-500"
              sizes="140px"
              priority={index < 4}
            />
          </Link>
          
          {/* Discount Badge - Mobile */}
          {hasDiscount && (
            <div className="absolute top-1 left-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[11px] font-bold px-1 py-0.5 rounded-full shadow-md z-10">
              {discountPercent}% تخفیف
            </div>
          )}

          {/* Stock Badge - Mobile */}
          {product.stock === 0 && (
            <div className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-md z-10">
              ناموجود
            </div>
          )}
        </div>

        {/* Content Section - ~70% of height */}
        <CardContent className="p-2 flex-1 flex flex-col h-[110px]">
          {/* Title - Fixed Height */}
          <Link href={`/products/${product._id}`} className="mb-1">
            <h3 className="text-[11px] font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 min-h-[28px] leading-tight">
              {product.name}
            </h3>
          </Link>
          
          {/* Rating - Fixed Height - Mobile */}
          <div className="flex items-center gap-1 mb-1 min-h-[12px]">
            <div className="flex items-center gap-0.5">
              {renderStars(product.rating.average)}
            </div>
            <span className="text-[9px] text-gray-500 dark:text-gray-400">({product.rating.count})</span>
          </div>

          {/* Price Section - Fixed Height */}
          <div className="mt-auto pt-1 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between gap-2">
              <div className="text-right flex-1 min-w-0">
                {hasDiscount && (
                  <div className="text-[8px] text-gray-400 dark:text-gray-500 line-through mb-0.5">
                    {formatPrice(product.originalPrice as number)} تومان
                  </div>
                )}
                <div className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  {formatPrice(product.price)}
                </div>
                <div className="text-[8px] text-gray-500 dark:text-gray-400">تومان</div>
              </div>
              
              <Button
                size="sm"
                disabled={product.stock === 0}
                onClick={handleAddToCart}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-[9px] px-2 py-1 h-auto shadow-md hover:shadow-lg transition-all duration-200 flex-shrink-0"
              >
                <ShoppingCart className="w-3 h-3 mr-0.5" />
                <span className="hidden xs:inline">افزودن</span>
                <span className="xs:hidden">+</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Design */}
      <Card className="hidden md:flex w-full h-[485px] group relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl flex-col">
        {/* Image Section - Exactly 33.33% of height (160px) */}
        <div className="relative h-[160px] overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-700 dark:via-blue-900/20 dark:to-gray-800">
          <Link href={`/products/${product._id}`}>
            <Image
              src={product.images[0]?.url || '/pics/battery.jpg'}
              alt={product.images[0]?.alt || product.name}
              fill
              className="object-contain p-6 group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 1200px) 33vw, 25vw"
              priority={index < 4}
            />
          </Link>
          
          {/* Category Badge */}
          <Badge 
            variant="secondary" 
            className="absolute top-4 right-4 bg-blue-600 text-white border-0 shadow-lg text-xs px-2.5 py-1"
          >
            {product?.category?.name}
          </Badge>

          {/* Stock Badge */}
          {product.stock < 5 && (
            <Badge 
              variant="destructive" 
              className="absolute top-4 left-4 animate-pulse text-xs px-2.5 py-1"
            >
              {product.stock === 0 ? 'ناموجود' : `تنها ${product.stock} عدد`}
            </Badge>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute bottom-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xl">
              {discountPercent}% تخفیف
            </div>
          )}

          {/* Hover Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ 
              opacity: isHovered ? 1 : 0, 
              y: isHovered ? 0 : 15 
            }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-4 left-4 right-4 flex gap-2"
          >
            <Button
              size="sm"
              variant="secondary"
              className="flex-1 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 text-xs"
              asChild
            >
              <Link href={`/products/${product._id}`}>
                <Eye className="w-3.5 h-3.5 mr-1.5" />
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
              className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </motion.div>
        </div>

        {/* Content Section - Exactly 66.67% of height (320px) */}
        <CardContent className="p-3 flex-1 flex flex-col h-[60px]">
          {/* Title - Fixed Height: 56px */}
          <Link href={`/products/${product._id}`} className="mb-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 min-h-[24px] leading-snug">
              {product?.name}
            </h3>
          </Link>
          
          {/* Brand - Fixed Height: 24px */}
          {brandName && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-3 min-h-[20px]">
              برند: <span className="font-semibold text-gray-700 dark:text-gray-300">{brandName}</span>
            </div>
          )}

          {/* Attributes - Fixed Height: 32px */}
          <div className="mb-3 min-h-[24px]">
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(product.attributes).slice(0, 2).map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="text-xs px-2 py-0.5">
                    {value}
                  </Badge>
                ))}
                {Object.keys(product.attributes).length > 2 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    +{Object.keys(product.attributes).length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Description - Fixed Height: 48px */}
          <div className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed min-h-[46px]">
            {product.description}
          </div>

          {/* Rating - Fixed Height: 28px */}
          <div className="flex items-center justify-between mb-4 min-h-[24px]">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(product.rating.average)}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                ({product.rating.count})
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
              {product.rating.average.toFixed(1)} ⭐
            </div>
          </div>

          {/* Price and Add to Cart - Fixed Height: 80px */}
          <div className="mt-auto pt-1 border-t border-gray-100 dark:border-gray-700 min-h-[80px] flex flex-col justify-between">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center text-right">
                {hasDiscount && (
                  <div className="text-sm text-gray-400 dark:text-gray-500 line-through mb-1">
                    {formatPrice(product.originalPrice as number)} تومان
                  </div>
                )}
                <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  {formatPrice(product.price)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">تومان</div>
              </div>
            </div>
            
            <Button
              size="sm"
              disabled={product.stock === 0}
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-2.5 text-sm font-semibold"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.stock === 0 ? 'ناموجود' : 'افزودن به سبد خرید'}
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
