'use client'

import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, SlidersHorizontal, Grid3X3, List } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SearchHeaderProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  sortBy: string
  setSortBy: (sort: string) => void
  productsCount: number
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
}

export default function SearchHeader({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  productsCount,
  viewMode,
  setViewMode
}: SearchHeaderProps) {
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border-0 p-4 md:p-6 mb-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            محصولات
          </h1>
          <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 flex items-center gap-2">
            مجموعه کاملی از بهترین محصولات
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs md:text-sm">
              {productsCount} محصول
            </Badge>
          </div>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 mt-4 lg:mt-0">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="flex items-center gap-2"
          >
            <Grid3X3 className="w-4 h-4" />
            شبکه‌ای
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="flex items-center gap-2"
          >
            <List className="w-4 h-4" />
            لیستی
          </Button>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search Box */}
        <div className="relative lg:col-span-2">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <Input
            type="text"
            placeholder="جستجو در محصولات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 h-12 text-base bg-white/80 dark:bg-gray-900/80 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
          />
          {searchTerm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                ×
              </Button>
            </motion.div>
          )}
        </div>

        {/* Sort Options */}
        <div className="relative">
          <SlidersHorizontal className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="pr-10 h-12 bg-white/80 dark:bg-gray-900/80 border-2 border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="مرتب‌سازی" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">پیشفرض</SelectItem>
              <SelectItem value="price-low">قیمت: کم به زیاد</SelectItem>
              <SelectItem value="price-high">قیمت: زیاد به کم</SelectItem>
              <SelectItem value="rating">بالاترین امتیاز</SelectItem>
              <SelectItem value="name">نام محصول</SelectItem>
              <SelectItem value="newest">جدیدترین</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search Results Info */}
      {searchTerm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <div className="text-sm text-blue-700 dark:text-blue-300">
            نتایج جستجو برای: <span className="font-semibold">"{searchTerm}"</span>
            {productsCount > 0 ? (
              <span> - {productsCount} محصول یافت شد</span>
            ) : (
              <span> - هیچ محصولی یافت نشد</span>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}