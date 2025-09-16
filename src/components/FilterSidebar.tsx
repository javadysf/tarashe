'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Filter, X, Star } from 'lucide-react'

interface Filters {
  category: string
  minPrice: number
  maxPrice: number
  minRating: number
}

interface FilterSidebarProps {
  filters: Filters
  setFilters: (filters: Filters) => void
  categories: any[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  productsCount: number
}

export default function FilterSidebar({ 
  filters, 
  setFilters, 
  categories, 
  searchTerm, 
  setSearchTerm,
  productsCount 
}: FilterSidebarProps) {
  
  const clearFilters = () => {
    setFilters({
      category: 'all',
      minPrice: 0,
      maxPrice: 10000000,
      minRating: 0
    })
    setSearchTerm('')
  }

  const hasActiveFilters = (filters.category && filters.category !== 'all') || filters.minRating > 0 || searchTerm

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl sticky top-24">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Filter className="w-4 h-4 text-white" />
            </div>
            فیلترها
            {hasActiveFilters && (
              <Badge variant="secondary" className="mr-auto">
                {productsCount} محصول
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Category Filter */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              دستهبندی
            </label>
            <Select 
              value={filters.category} 
              onValueChange={(value) => setFilters({...filters, category: value})}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="انتخاب دسته" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه دستهها</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              محدوده قیمت
            </label>
            <div className="px-2">
              <Slider
                value={[filters.minPrice, filters.maxPrice]}
                onValueChange={([min, max]) => setFilters({...filters, minPrice: min, maxPrice: max})}
                max={10000000}
                min={0}
                step={100000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>{new Intl.NumberFormat('fa-IR').format(filters.minPrice)} تومان</span>
                <span>{new Intl.NumberFormat('fa-IR').format(filters.maxPrice)} تومان</span>
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              حداقل امتیاز
            </label>
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map((rating) => (
                <motion.button
                  key={rating}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilters({...filters, minRating: rating})}
                  className={`w-full p-3 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                    filters.minRating === rating
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm">
                    {rating === 0 ? 'همه امتیازها' : `${rating} ستاره و بالاتر`}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3"
            >
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                فیلترهای فعال
              </label>
              <div className="flex flex-wrap gap-2">
                {filters.category && filters.category !== 'all' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {categories.find(c => c._id === filters.category)?.name}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => setFilters({...filters, category: 'all'})}
                    />
                  </Badge>
                )}
                {filters.minRating > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {filters.minRating} ستاره+
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => setFilters({...filters, minRating: 0})}
                    />
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    جستجو: {searchTerm}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => setSearchTerm('')}
                    />
                  </Badge>
                )}
              </div>
            </motion.div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="outline"
              className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <X className="w-4 h-4 mr-2" />
              پاک کردن همه فیلترها
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}