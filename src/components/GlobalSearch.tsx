'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Search, X } from 'lucide-react'
import { api } from '@/lib/api'

interface SearchResult {
  _id: string
  name: string
  price: number
  images: { url: string; alt: string }[]
  category: {
    name: string
  }
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchProducts = async () => {
      if (searchTerm.length < 2) {
        setResults([])
        return
      }

      try {
        setLoading(true)
        const response = await api.getProducts({ 
          search: searchTerm, 
          limit: 6 
        })
        setResults(response.products || [])
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm)}`)
      setIsOpen(false)
      setSearchTerm('')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price)
  }

  return (
    <div ref={searchRef} className="relative flex-1 max-w-2xl">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="جستجو در محصولات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="w-full pr-12 pl-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-base"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setResults([])
                inputRef.current?.focus()
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      <AnimatePresence>
        {isOpen && (searchTerm.length >= 2 || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 p-4 z-50 max-h-96 overflow-y-auto custom-scrollbar"
          >
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="mr-3 text-gray-600">در حال جستجو...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700">
                    نتایج جستجو ({results.length})
                  </h3>
                  <button
                    onClick={handleSearch}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    مشاهده همه
                  </button>
                </div>
                
                {results.map((product) => (
                  <motion.div
                    key={product._id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      router.push(`/products/${product._id}`)
                      setIsOpen(false)
                      setSearchTerm('')
                    }}
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={product.images[0]?.url || '/pics/battery.jpg'}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 line-clamp-1 mb-1">
                        {product.name}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {product.category.name}
                        </span>
                        <span className="text-sm font-semibold text-blue-600">
                          {formatPrice(product.price)} تومان
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : searchTerm.length >= 2 ? (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">محصولی یافت نشد</p>
                <p className="text-sm text-gray-400">
                  عبارت جستجوی دیگری امتحان کنید
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  حداقل 2 کاراکتر تایپ کنید
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}