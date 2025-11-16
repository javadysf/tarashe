'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'
import ProductCard from '@/components/ProductCard'
import ProductListItem from '@/components/ProductListItem'
import FilterSidebar from '@/components/FilterSidebar'
import SearchHeader from '@/components/SearchHeader'
import CategoryHierarchy from '@/components/CategoryHierarchy'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Package, RefreshCw } from 'lucide-react'

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
}

interface Filters {
  category: string
  brand: string[]
  minPrice: number
  maxPrice: number
  minRating: number
  attributes: { [key: string]: string[] }
}

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('default')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    brand: [],
    minPrice: 0,
    maxPrice: 10000000,
    minRating: 0,
    attributes: {}
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [categoryAttributes, setCategoryAttributes] = useState<any[]>([])
  const [attributeValues, setAttributeValues] = useState<{ [key: string]: string[] }>({})
  const [currentCategoryId, setCurrentCategoryId] = useState<string | undefined>(undefined)
  const [displayedCount, setDisplayedCount] = useState(12)
  const ITEMS_PER_PAGE = 12

  useEffect(() => {
    const uniqueBrands = products
      .map(product => product.brand)
      .filter(Boolean)
      .reduce((acc: any[], brand) => {
        const brandId = typeof brand === 'string' ? brand : brand._id
        if (!acc.find(b => (typeof b === 'string' ? b : b._id) === brandId)) {
          acc.push(brand)
        }
        return acc
      }, [])
    setBrands(uniqueBrands)
  }, [products])

  const fetchProducts = useCallback(async (categoryId?: string, brandId?: string) => {
    try {
      setError(null)
      const params: any = { limit: 100 }
      if (categoryId && categoryId !== 'all') params.category = categoryId
      const response = await api.getProducts(params)
      setProducts(response.products || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('خطا در بارگذاری محصولات')
      setLoading(false)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.getCategories()
      setCategories(response)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }, [])

  const fetchCategoryAttributes = useCallback(async (categoryId: string) => {
    try {
      const response = await api.getCategoryAttributes(categoryId)
      console.log('Category attributes response:', response)
      
      const attributes = response.map((ca: any) => ca.attribute).filter(Boolean)
      setCategoryAttributes(attributes)
      
      const values: { [key: string]: string[] } = {}
      attributes.forEach((attr: any) => {
        const attrValues = new Set<string>()
        products.forEach(product => {
          if (product.attributes && product.attributes[attr._id]) {
            attrValues.add(product.attributes[attr._id])
          }
        })
        
        if (attr.type === 'select' && attr.options) {
          attr.options.forEach((option: string) => {
            attrValues.add(option)
          })
        }
        
        values[attr._id] = Array.from(attrValues).sort()
      })
      setAttributeValues(values)
      console.log('Attribute values:', values)
    } catch (error) {
      console.error('Error fetching category attributes:', error)
    }
  }, [products])

  const applyFiltersAndSort = useCallback(() => {
    let filtered = products.filter(product => {
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof product.brand === 'string' ? product.brand : product.brand?.name)?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const categoryId = product.category?._id || product.category
      // Server already returns deep-filtered list when category is set, so don't over-filter on client
      const matchesCategory = filters.category === 'all' ? true : true
      
      const productBrandId = typeof product.brand === 'string' ? product.brand : product.brand?._id
      const matchesBrand = filters.brand.length === 0 || filters.brand.includes(productBrandId)
      
      const matchesPrice = product.price >= filters.minPrice && product.price <= filters.maxPrice
      
      const matchesAttributes = Object.entries(filters.attributes).every(([attrId, values]) => {
        if (values.length === 0) return true
        return product.attributes && values.includes(product.attributes[attrId])
      })
      
      return (
        matchesSearch &&
        matchesCategory &&
        matchesBrand &&
        matchesPrice &&
        matchesAttributes &&
        product.rating.average >= filters.minRating
      )
    })

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating.average - a.rating.average)
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'fa'))
        break
      case 'newest':
        // Assuming products have a createdAt field or similar
        break
      default:
        break
    }

    setFilteredProducts(filtered)
  }, [filters, products, searchTerm, sortBy])

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    const brandFromUrl = searchParams.get('brand')

    setCurrentCategoryId(categoryFromUrl || undefined)
    fetchProducts(categoryFromUrl || undefined)
    fetchCategories()

    setFilters(prev => ({
      ...prev,
      category: categoryFromUrl || 'all',
      brand: brandFromUrl ? [brandFromUrl] : []
    }))
  }, [fetchCategories, fetchProducts, searchParams])

  useEffect(() => {
    const categoryId = filters.category !== 'all' ? filters.category : undefined

    if (categoryId) {
      // فقط ویژگی‌های دسته انتخابی را می‌گیریم
      fetchCategoryAttributes(categoryId)
    } else {
      // اگر دسته خاصی انتخاب نشده، ویژگی‌های دسته را خالی می‌کنیم
      setCategoryAttributes([])
      setAttributeValues({})
    }
  }, [fetchCategoryAttributes, filters.category])

  useEffect(() => {
    applyFiltersAndSort()
    setDisplayedCount(ITEMS_PER_PAGE)
  }, [applyFiltersAndSort])

  const retryFetch = () => {
    setLoading(true)
    setError(null)
    fetchProducts()
    fetchCategories()
  }

  const handleCategorySelect = (categoryId: string) => {
    if (categoryId) {
      setCurrentCategoryId(categoryId)
      setFilters(prev => ({ ...prev, category: categoryId }))
      fetchProducts(categoryId)
      // Update URL without page reload
      const url = new URL(window.location.href)
      url.searchParams.set('category', categoryId)
      window.history.pushState({}, '', url.toString())
    } else {
      setCurrentCategoryId(undefined)
      setFilters(prev => ({ ...prev, category: 'all' }))
      fetchProducts()
      // Update URL without page reload
      const url = new URL(window.location.href)
      url.searchParams.delete('category')
      window.history.pushState({}, '', url.toString())
    }
  }

  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-3">
            <Skeleton className="h-32 w-full rounded-2xl mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <Skeleton key={i} className="h-96 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl"
        >
          <Package className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{error}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">لطفاً دوباره تلاش کنید</p>
          <Button onClick={retryFetch} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            تلاش مجدد
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <SearchHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          productsCount={filteredProducts.length}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Category Hierarchy */}
        <CategoryHierarchy
          currentCategoryId={currentCategoryId}
          onCategorySelect={handleCategorySelect}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              categories={categories}
              brands={brands}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              productsCount={filteredProducts.length}
              categoryAttributes={categoryAttributes}
              attributeValues={attributeValues}
            />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {filteredProducts.length > 0 ? (
                <motion.div
                  key="products-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`${
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                      : 'space-y-6'
                  }`}
                >
                  {filteredProducts.slice(0, displayedCount).map((product, index) => (
                    viewMode === 'grid' ? (
                      <ProductCard
                        key={product._id}
                        product={product}
                        index={index}
                      />
                    ) : (
                      <ProductListItem
                        key={product._id}
                        product={product}
                        index={index}
                      />
                    )
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="no-products"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-16"
                >
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">محصولی یافت نشد</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">لطفاً فیلترهای خود را تغییر دهید یا عبارت جستجوی دیگری امتحان کنید</p>
                  <Button
                    onClick={() => {
                      setFilters({category: 'all', brand: [], minPrice: 0, maxPrice: 10000000, minRating: 0, attributes: {}})
                      setSearchTerm('')
                    }}
                    variant="outline"
                    className="border-2 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    پاک کردن همه فیلترها
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Load More Button */}
            {filteredProducts.length > displayedCount && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center mt-12"
              >
                <Button
                  onClick={() => setDisplayedCount(prev => prev + ITEMS_PER_PAGE)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                >
                  نمایش بیشتر
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}