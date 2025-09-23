'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'
import ProductCard from '@/components/ProductCard'
import ProductListItem from '@/components/ProductListItem'
import FilterSidebar from '@/components/FilterSidebar'
import SearchHeader from '@/components/SearchHeader'
import ProductStats from '@/components/ProductStats'
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

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    
    // Read category from URL
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) {
      setFilters(prev => ({ ...prev, category: categoryFromUrl }))
    }
  }, [searchParams])

  useEffect(() => {
    if (filters.category && filters.category !== 'all') {
      fetchCategoryAttributes(filters.category)
    } else {
      setCategoryAttributes([])
      setAttributeValues({})
    }
  }, [filters.category])

  useEffect(() => {
    applyFiltersAndSort()
  }, [products, filters, sortBy, searchTerm])

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

  const fetchProducts = async () => {
    try {
      setError(null)
      const response = await api.getProducts({ limit: 100 })
      setProducts(response.products || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('خطا در بارگذاری محصولات')
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories()
      setCategories(response)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchCategoryAttributes = async (categoryId: string) => {
    try {
      const response = await api.getCategoryAttributes(categoryId)
      setCategoryAttributes(response)
      
      // Extract unique values for each attribute from products
      const values: { [key: string]: string[] } = {}
      response.forEach((attr: any) => {
        const attrValues = new Set<string>()
        products.forEach(product => {
          if (product.attributes && product.attributes[attr._id]) {
            attrValues.add(product.attributes[attr._id])
          }
        })
        values[attr._id] = Array.from(attrValues)
      })
      setAttributeValues(values)
    } catch (error) {
      console.error('Error fetching category attributes:', error)
    }
  }

  const applyFiltersAndSort = () => {
    let filtered = products.filter(product => {
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typeof product.brand === 'string' ? product.brand : product.brand?.name)?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const categoryId = product.category?._id || product.category
      const matchesCategory = filters.category === 'all' || categoryId === filters.category
      
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
  }

  const retryFetch = () => {
    setLoading(true)
    setError(null)
    fetchProducts()
    fetchCategories()
  }

  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl"
        >
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">{error}</h3>
          <p className="text-gray-600 mb-6">لطفاً دوباره تلاش کنید</p>
          <Button onClick={retryFetch} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            تلاش مجدد
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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

        {/* Product Stats */}
        <ProductStats
          totalProducts={products.length}
          categories={categories}
          averageRating={products.length > 0 ? products.reduce((acc, p) => acc + p.rating.average, 0) / products.length : 0}
          topCategory={categories.length > 0 ? categories[0]?.name || 'نامشخص' : 'نامشخص'}
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
                  {filteredProducts.map((product, index) => (
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
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">محصولی یافت نشد</h3>
                  <p className="text-gray-600 mb-6">لطفاً فیلترهای خود را تغییر دهید یا عبارت جستجوی دیگری امتحان کنید</p>
                  <Button
                    onClick={() => {
                      setFilters({category: 'all', brand: [], minPrice: 0, maxPrice: 10000000, minRating: 0, attributes: {}})
                      setSearchTerm('')
                    }}
                    variant="outline"
                    className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    پاک کردن همه فیلترها
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}