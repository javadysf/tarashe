'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface Product {
  id: number
  title: string
  price: number
  image: string
  category: string
}

export default function SearchSection() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.length > 2) {
      setLoading(true)
      fetch('https://fakestoreapi.com/products')
        .then(res => res.json())
        .then(data => {
          const filtered = data.filter((product: Product) =>
            product.title.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 8)
          setResults(filtered)
          setLoading(false)
        })
    } else {
      setResults([])
    }
  }, [query])

  return (
    <section className="bg-gradient-to-br from-primary to-blue-800 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">جستجوی محصولات</h2>
          <p className="text-blue-100">محصول مورد نظر خود را پیدا کنید</p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="نام محصول را وارد کنید..."
              className="w-full px-6 py-4 pr-14 text-lg bg-white/90 backdrop-blur-sm border-0 rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/30 text-right shadow-xl"
            />
            <MagnifyingGlassIcon className="absolute right-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-500" />
          </div>
        </div>

        {loading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-white mt-2">در حال جستجو...</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {results.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20"
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h3 className="text-white font-medium text-sm line-clamp-2 mb-2">
                  {product.title}
                </h3>
                <p className="text-blue-200 text-xs mb-2">{product.category}</p>
                <p className="text-yellow-300 font-bold">${product.price}</p>
              </Link>
            ))}
          </div>
        )}

        {query.length > 2 && !loading && results.length === 0 && (
          <div className="text-center">
            <p className="text-white text-lg">محصولی یافت نشد</p>
            <p className="text-blue-200">لطفاً کلمات دیگری امتحان کنید</p>
          </div>
        )}
      </div>
    </section>
  )
}