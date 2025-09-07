'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface Product {
  id: number
  title: string
  price: number
  image: string
  category: string
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

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
    if (query.length > 2) {
      setLoading(true)
      fetch('https://fakestoreapi.com/products')
        .then(res => res.json())
        .then(data => {
          const filtered = data.filter((product: Product) =>
            product.title.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 6)
          setResults(filtered)
          setIsOpen(true)
          setLoading(false)
        })
    } else {
      setResults([])
      setIsOpen(false)
    }
  }, [query])

  return (
    <div ref={searchRef} className="relative w-full max-w-lg">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجوی محصولات..."
          className="w-full px-5 py-3 pr-12 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-right shadow-sm"
        />
        <MagnifyingGlassIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl z-[9999] max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-primary mb-2"></div>
              <p>در حال جستجو...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center p-4 hover:bg-gray-50/80 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-14 h-14 object-cover rounded-lg ml-4 shadow-sm"
                  />
                  <div className="flex-1 text-right">
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-1">
                      {product.title}
                    </h4>
                    <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                    <p className="text-sm font-bold text-primary">${product.price}</p>
                  </div>
                </Link>
              ))}
              <Link
                href={`/products?search=${encodeURIComponent(query)}`}
                onClick={() => setIsOpen(false)}
                className="block p-4 text-center text-primary hover:bg-primary/5 font-medium border-t border-gray-100"
              >
                مشاهده همه نتایج ({query})
              </Link>
            </>
          ) : query.length > 2 ? (
            <div className="p-6 text-center text-gray-500">
              <p className="mb-2">محصولی یافت نشد</p>
              <p className="text-xs">کلمات دیگری امتحان کنید</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}