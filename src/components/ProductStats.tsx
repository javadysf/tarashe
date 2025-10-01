'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Star, Tag, TrendingUp } from 'lucide-react'

interface ProductStatsProps {
  totalProducts: number
  categories: any[]
  averageRating: number
  topCategory: string
}

export default function ProductStats({ 
  totalProducts, 
  categories, 
  averageRating, 
  topCategory 
}: ProductStatsProps) {
  
  const stats = [
    {
      icon: Package,
      label: 'کل محصولات',
      value: totalProducts.toLocaleString('fa-IR'),
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Tag,
      label: 'دسته بندی ها',
      value: categories.length.toLocaleString('fa-IR'),
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Star,
      label: 'میانگین امتیاز',
      value: averageRating.toFixed(1),
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: TrendingUp,
      label: 'محبوبترین دسته',
      value: topCategory,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`w-6 h-6 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
                  <div className="text-lg font-bold text-gray-900 truncate">{stat.value}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}