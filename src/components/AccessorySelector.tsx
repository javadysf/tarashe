'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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

interface AccessorySelectorProps {
  accessories: Accessory[]
  isOpen: boolean
  onClose: () => void
  onAddToCart: (selectedAccessories: any[]) => void
  productName: string
}

export default function AccessorySelector({ 
  accessories, 
  isOpen, 
  onClose, 
  onAddToCart, 
  productName 
}: AccessorySelectorProps) {
  const [selectedAccessories, setSelectedAccessories] = useState<{[key: string]: number}>({})

  const handleQuantityChange = (accessoryId: string, quantity: number) => {
    if (quantity <= 0) {
      const newSelected = { ...selectedAccessories }
      delete newSelected[accessoryId]
      setSelectedAccessories(newSelected)
    } else {
      setSelectedAccessories(prev => ({
        ...prev,
        [accessoryId]: quantity
      }))
    }
  }

  const handleAddToCart = () => {
    const accessoriesToAdd = Object.entries(selectedAccessories).map(([accessoryId, quantity]) => {
      const accessory = accessories.find(acc => acc.accessory._id === accessoryId)
      if (!accessory) return null

      const originalPrice = accessory.accessory.price
      const discountAmount = (originalPrice * accessory.bundleDiscount) / 100
      const discountedPrice = originalPrice - discountAmount

      return {
        accessoryId,
        name: accessory.accessory.name,
        originalPrice,
        discountedPrice,
        quantity,
        discount: accessory.bundleDiscount
      }
    }).filter(Boolean)

    onAddToCart(accessoriesToAdd)
    setSelectedAccessories({})
  }

  const getTotalPrice = () => {
    return Object.entries(selectedAccessories).reduce((total, [accessoryId, quantity]) => {
      const accessory = accessories.find(acc => acc.accessory._id === accessoryId)
      if (!accessory) return total

      const originalPrice = accessory.accessory.price
      const discountAmount = (originalPrice * accessory.bundleDiscount) / 100
      const discountedPrice = originalPrice - discountAmount

      return total + (discountedPrice * quantity)
    }, 0)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right text-xl font-bold text-gray-800 dark:text-gray-100">
            متعلقات پیشنهادی برای {productName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400 text-sm text-right">
            متعلقات زیر برای این محصول پیشنهاد می‌شود. می‌توانید آن‌ها را به سبد خرید خود اضافه کنید:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accessories.map((accessory) => {
              const originalPrice = accessory.accessory.price
              const discountAmount = (originalPrice * accessory.bundleDiscount) / 100
              const discountedPrice = originalPrice - discountAmount
              const quantity = selectedAccessories[accessory.accessory._id] || 0

              return (
                <div
                  key={accessory.accessory._id}
                  className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                      <Image
                        src={accessory.accessory.images?.[0]?.url || '/pics/battery.jpg'}
                        alt={accessory.accessory.images?.[0]?.alt || accessory.accessory.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight mb-2">
                        {accessory.accessory.name}
                      </h4>
                      
                      {accessory.accessory.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-2">
                          {accessory.accessory.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mb-3">
                        {accessory.bundleDiscount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {accessory.bundleDiscount}% تخفیف
                          </Badge>
                        )}
                        {accessory.isSuggested && (
                          <Badge variant="secondary" className="text-xs">
                            پیشنهادی
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        {accessory.bundleDiscount > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400 text-sm line-through">
                              {formatPrice(originalPrice)}
                            </span>
                            <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                              {formatPrice(discountedPrice)} تومان
                            </span>
                          </div>
                        ) : (
                          <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                            {formatPrice(originalPrice)} تومان
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(accessory.accessory._id, quantity - 1)}
                          disabled={quantity <= 0}
                          className="w-8 h-8 p-0"
                        >
                          -
                        </Button>
                        
                        <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                          {quantity}
                        </span>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(accessory.accessory._id, quantity + 1)}
                          className="w-8 h-8 p-0"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {Object.keys(selectedAccessories).length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <p className="text-blue-800 dark:text-blue-300 font-semibold text-sm">
                    مجموع قیمت متعلقات انتخاب شده:
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                    {formatPrice(getTotalPrice())} تومان
                  </p>
                </div>
                
                <Button
                  onClick={handleAddToCart}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  افزودن به سبد خرید
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
            <Button
              onClick={() => {
                onAddToCart([])
                onClose()
              }}
              variant="outline"
              className="flex-1"
            >
              ادامه خرید بدون متعلقات
            </Button>
            
            <Button
              onClick={handleAddToCart}
              disabled={Object.keys(selectedAccessories).length === 0}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              افزودن محصول و متعلقات
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
















