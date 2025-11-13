'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Clock } from 'lucide-react'
import { api } from '@/lib/api'
import Image from 'next/image'

interface Product {
  _id: string
  name: string
  price: number
  originalPrice?: number
  images: Array<{ url: string; alt?: string }>
  brand?: { name: string }
}

export default function GlobalSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true)
        const response = await api.getSearchSuggestions(searchTerm, 3)
        setSuggestions(response.products || [])
        setShowSuggestions(true)
      } catch (error) {
        console.error('Search suggestions error:', error)
        setSuggestions([])
        // Don't show suggestions on error, but don't prevent user from typing
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`)
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (product: Product) => {
    router.push(`/products/${product._id}`)
    setShowSuggestions(false)
    setSearchTerm('')
  }

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  return (
    <div ref={searchRef} className="relative w-full ">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleInputFocus}
            placeholder="جستجو در محصولات..."
            className="w-full sm:min-h-16 pr-12 pl-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-300 bg-white/80 backdrop-blur-sm"
          />
          {isLoading && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </form>

      {/* Mobile Overlay */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="md:hidden fixed inset-0 bg-black/20 z-40" onClick={() => setShowSuggestions(false)} />
      )}
      
      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <>
          {/* Desktop Suggestions */}
          <div className="hidden md:block absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
            <div className="p-2">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                <Clock className="h-3 w-3" />
                پیشنهادات جستجو
              </div>
              {suggestions.map((product) => (
                <button
                  key={product._id}
                  onClick={() => handleSuggestionClick(product)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-right"
                >
                  <div className="relative w-12 h-12 flex-shrink-0">
                    {product.images?.[0]?.url ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {product.name}
                    </div>
                    {product.brand && (
                      <div className="text-xs text-gray-500 truncate">
                        {product.brand.name}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-semibold text-blue-600">
                        {product.price.toLocaleString('fa-IR')} تومان
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs text-gray-400 line-through">
                          {product.originalPrice.toLocaleString('fa-IR')}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={handleSearch}
                  className="w-full text-center py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  مشاهده همه نتایج برای &quot;{searchTerm}&quot;
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile Suggestions */}
          <div className="md:hidden fixed top-20 left-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-[70vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 border-b border-gray-100">
                <Clock className="h-4 w-4" />
                پیشنهادات جستجو
              </div>
              {suggestions.map((product) => (
                <button
                  key={product._id}
                  onClick={() => handleSuggestionClick(product)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 rounded-lg transition-colors text-right"
                >
                  <div className="relative w-14 h-14 flex-shrink-0">
                    {product.images?.[0]?.url ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate text-base">
                      {product.name}
                    </div>
                    {product.brand && (
                      <div className="text-sm text-gray-500 truncate">
                        {product.brand.name}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-semibold text-blue-600 text-base">
                        {product.price.toLocaleString('fa-IR')} تومان
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-400 line-through">
                          {product.originalPrice.toLocaleString('fa-IR')}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={handleSearch}
                  className="w-full text-center py-3 text-base text-blue-600 hover:text-blue-700 font-medium"
                >
                  مشاهده همه نتایج برای &quot;{searchTerm}&quot;
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
