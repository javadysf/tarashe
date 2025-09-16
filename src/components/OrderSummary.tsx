'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Package, Truck, Shield } from 'lucide-react'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface OrderSummaryProps {
  items: OrderItem[]
  totalPrice: number
  formatPrice: (price: number) => string
}

export default function OrderSummary({ items, totalPrice, formatPrice }: OrderSummaryProps) {
  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl sticky top-8 hover:shadow-3xl transition-all duration-500">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
            <Package className="w-4 h-4 text-white" />
          </div>
          خلاصه سفارش
          <Badge variant="secondary" className="mr-auto">
            {items.length} کالا
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Items List */}
        <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center gap-4 p-3 bg-gradient-to-r from-gray-50/80 to-blue-50/30 rounded-xl hover:from-gray-100/80 hover:to-blue-100/50 transition-all duration-300 group"
            >
              <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow duration-300">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors duration-300">
                  {item.name}
                </h4>
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-xs bg-white/80">
                    تعداد: {item.quantity}
                  </Badge>
                  <div className="text-right">
                    <div className="font-bold text-blue-600 text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    <div className="text-xs text-gray-500">تومان</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        
        {/* Price Breakdown */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 flex items-center gap-2">
              <Package className="w-4 h-4" />
              جمع کل:
            </span>
            <span className="font-semibold">{formatPrice(totalPrice)} تومان</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 flex items-center gap-2">
              <Truck className="w-4 h-4" />
              هزینه ارسال:
            </span>
            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
              رایگان
            </Badge>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              بیمه سفارش:
            </span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
              شامل
            </Badge>
          </div>
          
          <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">مبلغ نهایی:</span>
            <div className="text-right">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {formatPrice(totalPrice)}
              </div>
              <div className="text-sm text-gray-500">تومان</div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200/50">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-green-600" />
              پرداخت امن
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center gap-1">
              <Truck className="w-3 h-3 text-blue-600" />
              ارسال سریع
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center gap-1">
              <Package className="w-3 h-3 text-purple-600" />
              ضمانت اصالت
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}