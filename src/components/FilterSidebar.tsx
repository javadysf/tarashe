'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Filter, X, Star, ChevronDown, ChevronUp } from 'lucide-react'

interface Filters {
  category: string
  brand: string[]
  minPrice: number
  maxPrice: number
  minRating: number
  attributes: { [key: string]: string[] }
}

interface FilterSidebarProps {
  filters: Filters
  setFilters: (filters: Filters) => void
  categories: any[]
  brands: any[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  productsCount: number
  categoryAttributes: any[]
  attributeValues: { [key: string]: string[] }
  isMobile?: boolean
}

export default function FilterSidebar({ 
  filters, 
  setFilters, 
  categories,
  brands, 
  searchTerm, 
  setSearchTerm,
  productsCount,
  categoryAttributes = [],
  attributeValues = {},
  isMobile = false
}: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const clearFilters = () => {
    setFilters({
      category: 'all',
      brand: [],
      minPrice: 0,
      maxPrice: 10000000,
      minRating: 0,
      attributes: {}
    })
    setSearchTerm('')
  }

  const hasActiveFilters = (filters.category && filters.category !== 'all') || filters.brand.length > 0 || filters.minRating > 0 || Object.keys(filters.attributes).length > 0 || searchTerm

  const renderFilterContent = () => (
    <>
      {/* Category Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          دسته بندی
        </label>
        <Select 
          value={filters.category} 
          onValueChange={(value) => setFilters({...filters, category: value})}
        >
          <SelectTrigger className="h-10 text-sm">
            <SelectValue placeholder="انتخاب دسته" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه دسته ها</SelectItem>
            {categories.map(category => (
              <SelectItem key={category._id} value={category._id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Brand Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          برند
        </label>
        <div className="space-y-1.5 max-h-32 overflow-y-auto">
          {brands.map(brand => {
            const brandName = typeof brand === 'string' ? brand : brand.name
            const brandId = typeof brand === 'string' ? brand : brand._id
            return (
              <label key={brandId} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={filters.brand.includes(brandId)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFilters({...filters, brand: [...filters.brand, brandId]})
                    } else {
                      setFilters({...filters, brand: filters.brand.filter(b => b !== brandId)})
                    }
                  }}
                  className="w-3.5 h-3.5 text-purple-600 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 cursor-pointer"
                />
                <span className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer flex-1">{brandName}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          محدوده قیمت
        </label>
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800">
          <div className="space-y-3">
            <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">محدوده:</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {new Intl.NumberFormat('fa-IR').format(filters.minPrice)} - {new Intl.NumberFormat('fa-IR').format(filters.maxPrice)}
                </span>
              </div>
            </div>
            <div className="px-1">
              <Slider
                value={[filters.minPrice, filters.maxPrice]}
                onValueChange={([min, max]) => setFilters({...filters, minPrice: min, maxPrice: max})}
                max={10000000}
                min={0}
                step={100000}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-600 dark:text-gray-400">از</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: Number(e.target.value) || 0})}
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-right bg-white dark:bg-gray-900"
                  min="0"
                  max={filters.maxPrice}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-600 dark:text-gray-400">تا</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value) || 10000000})}
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-right bg-white dark:bg-gray-900"
                  min={filters.minPrice}
                  max={10000000}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Attributes */}
      {categoryAttributes.map((attr) => {
        const values = attributeValues[attr._id] || []
        if (values.length === 0) return null
        
        return (
          <div key={attr._id} className="space-y-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              {attr.name}
            </label>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {values.map(value => (
                <label key={value} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.attributes[attr._id]?.includes(value) || false}
                    onChange={(e) => {
                      const currentValues = filters.attributes[attr._id] || []
                      if (e.target.checked) {
                        setFilters({
                          ...filters, 
                          attributes: {
                            ...filters.attributes,
                            [attr._id]: [...currentValues, value]
                          }
                        })
                      } else {
                        const newValues = currentValues.filter(v => v !== value)
                        const newAttributes = { ...filters.attributes }
                        if (newValues.length === 0) {
                          delete newAttributes[attr._id]
                        } else {
                          newAttributes[attr._id] = newValues
                        }
                        setFilters({...filters, attributes: newAttributes})
                      }
                    }}
                    className="w-3.5 h-3.5 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-xs text-gray-700 dark:text-gray-300 flex-1">{value}</span>
                </label>
              ))}
            </div>
          </div>
        )
      })}

      {/* Rating Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          حداقل امتیاز
        </label>
        <div className="space-y-1.5">
          {[0, 1, 2, 3, 4].map((rating) => (
            <button
              key={rating}
              onClick={() => setFilters({...filters, minRating: rating})}
              className={`w-full p-2 rounded-lg border-2 transition-all text-xs flex items-center gap-2 ${
                filters.minRating === rating
                  ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-900 dark:text-gray-100">
                {rating === 0 ? 'همه' : `${rating}+`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          onClick={clearFilters}
          variant="outline"
          className="w-full border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs py-2"
        >
          <X className="w-3 h-3 mr-1" />
          پاک کردن همه
        </Button>
      )}
    </>
  )

  // Mobile Dropdown Version
  if (isMobile) {
    return (
      <div className="mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100">فیلترها</div>
              {hasActiveFilters && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {productsCount} محصول
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                {[
                  filters.category !== 'all' ? 1 : 0,
                  filters.brand.length,
                  filters.minRating > 0 ? 1 : 0,
                  Object.keys(filters.attributes).length,
                  searchTerm ? 1 : 0
                ].reduce((a, b) => a + b, 0)} فعال
              </Badge>
            )}
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mt-2">
                <CardContent className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Mobile Filter Content - Same as desktop but compact */}
                  {renderFilterContent()}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Desktop Sidebar Version
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl sticky top-24">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
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
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              دسته بندی
            </label>
            <Select 
              value={filters.category} 
              onValueChange={(value) => setFilters({...filters, category: value})}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="انتخاب دسته" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه دسته ها</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Brand Filter */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              برند
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {brands.map(brand => {
                const brandName = typeof brand === 'string' ? brand : brand.name
                const brandId = typeof brand === 'string' ? brand : brand._id
                return (
                  <label key={brandId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors w-full">
                    <input
                      type="checkbox"
                      checked={filters.brand.includes(brandId)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({...filters, brand: [...filters.brand, brandId]})
                        } else {
                          setFilters({...filters, brand: filters.brand.filter(b => b !== brandId)})
                        }
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex-1">{brandName}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              محدوده قیمت
            </label>
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800 shadow-inner">
              <div className="space-y-5">
                {/* Range Display */}
                <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">محدوده:</span>
                    </div>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {new Intl.NumberFormat('fa-IR').format(filters.minPrice)} - {new Intl.NumberFormat('fa-IR').format(filters.maxPrice)}
                    </span>
                  </div>
                </div>
                
                {/* Slider */}
                <div className="px-2">
                  <Slider
                    value={[filters.minPrice, filters.maxPrice]}
                    onValueChange={([min, max]) => setFilters({...filters, minPrice: min, maxPrice: max})}
                    max={10000000}
                    min={0}
                    step={100000}
                    className="w-full"
                  />
                </div>
                
                {/* Input Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-600 dark:text-gray-400 font-medium">از (تومان)</label>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({...filters, minPrice: Number(e.target.value) || 0})}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder="0"
                      min="0"
                      max={filters.maxPrice}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-600 dark:text-gray-400 font-medium">تا (تومان)</label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value) || 10000000})}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-right bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder="۱۰,۰۰۰,۰۰۰"
                      min={filters.minPrice}
                      max={10000000}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Attributes Filter */}
          {categoryAttributes.map((attr) => {
            const values = attributeValues[attr._id] || []
            if (values.length === 0) return null
            
            return (
              <div key={attr._id} className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  {attr.name}
                  {attr.unit && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">({attr.unit})</span>
                  )}
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {values.map(value => (
                    <label key={value} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={filters.attributes[attr._id]?.includes(value) || false}
                        onChange={(e) => {
                          const currentValues = filters.attributes[attr._id] || []
                          if (e.target.checked) {
                            setFilters({
                              ...filters, 
                              attributes: {
                                ...filters.attributes,
                                [attr._id]: [...currentValues, value]
                              }
                            })
                          } else {
                            const newValues = currentValues.filter(v => v !== value)
                            const newAttributes = { ...filters.attributes }
                            if (newValues.length === 0) {
                              delete newAttributes[attr._id]
                            } else {
                              newAttributes[attr._id] = newValues
                            }
                            setFilters({...filters, attributes: newAttributes})
                          }
                        }}
                        className="w-4 h-4 text-indigo-600 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{value}</span>
                      {attr.type === 'select' && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {attr.type}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Rating Filter */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
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
                      ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-500'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
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
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
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
                {filters.brand.map(brandId => {
                  const brand = brands.find(b => (typeof b === 'string' ? b : b._id) === brandId)
                  const brandName = typeof brand === 'string' ? brand : brand?.name || brandId
                  return (
                    <Badge key={brandId} variant="secondary" className="flex items-center gap-1">
                      {brandName}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => setFilters({...filters, brand: filters.brand.filter(b => b !== brandId)})}
                      />
                    </Badge>
                  )
                })}
                {Object.entries(filters.attributes).map(([attrId, values]) => 
                  values.map(value => {
                    const attr = categoryAttributes.find(a => a._id === attrId)
                    return (
                      <Badge key={`${attrId}-${value}`} variant="secondary" className="flex items-center gap-1">
                        {attr?.name}: {value}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => {
                            const newValues = filters.attributes[attrId].filter(v => v !== value)
                            const newAttributes = { ...filters.attributes }
                            if (newValues.length === 0) {
                              delete newAttributes[attrId]
                            } else {
                              newAttributes[attrId] = newValues
                            }
                            setFilters({...filters, attributes: newAttributes})
                          }}
                        />
                      </Badge>
                    )
                  })
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
              className="w-full border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700"
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