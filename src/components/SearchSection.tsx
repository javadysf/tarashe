'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter } from 'lucide-react'

export default function SearchSection() {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            پیدا کردن محصول مورد نظرتان
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            با جستجوی هوشمند ما، محصولات باکیفیت و مناسب را پیدا کنید
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="نام محصول، برند یا کد محصول را جستجو کنید..."
              className="w-full pr-12 pl-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg transition-all duration-300"
            />
          </div>
          
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              جستجو
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/products')}
              className="flex items-center gap-2 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
            >
              <Filter className="h-5 w-5" />
              فیلتر پیشرفته
            </button>
          </div>
        </form>

        {/* Popular Searches */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">جستجوهای محبوب</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {['باتری لپ تاپ', 'شارژر', 'کیبورد', 'ماوس', 'هارد دیسک'].map((term) => (
              <button
                key={term}
                onClick={() => {
                  setSearchTerm(term)
                  router.push(`/products?search=${encodeURIComponent(term)}`)
                }}
                className="px-4 py-2 bg-white text-gray-700 rounded-full border border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


