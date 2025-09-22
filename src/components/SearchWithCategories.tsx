'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ChevronDown, Grid3X3 } from 'lucide-react'
import { api } from '@/lib/api'
import GlobalSearch from './GlobalSearch'

interface Category {
  _id: string
  name: string
  description?: string
  attributes?: {
    _id: string
    name: string
    options: string[]
  }[]
}

export default function SearchWithCategories() {
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      fetchCategories()
    }
  }, [isOpen])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const categoriesResponse = await api.getCategories()
      
      // Get attributes for each category
      const categoriesWithAttributes = await Promise.all(
        categoriesResponse.map(async (category: any) => {
          try {
            const attributes = await api.getCategoryAttributes(category._id)
            return { ...category, attributes }
          } catch (error) {
            return category
          }
        })
      )
      
      setCategories(categoriesWithAttributes)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-4 w-full max-w-6xl">
      {/* Categories Menu - Right Side */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-all duration-300 font-medium text-gray-700 hover:text-blue-600 min-w-max"
        >
          <Grid3X3 className="w-5 h-5" />
          دسته بندی محصولات
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}

              className="absolute top-full right-0 mt-2 w-screen bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 p-6 z-[9999]"
            >
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    دسته بندی محصولات
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-6 max-h-96 overflow-y-auto custom-scrollbar">
                    {categories.map((category) => (
                      <div key={category._id} className="space-y-2">
                        <Link
                          href={`/products?category=${category._id}`}
                          className="block p-3 rounded-xl hover:bg-blue-50 transition-all duration-300 font-semibold text-gray-900 hover:text-blue-600 border-b border-gray-200 pb-2"
                          onClick={() => setIsOpen(false)}
                        >
                          {category.name}
                        </Link>
                        
                        <div className="space-y-1">
                          {category.attributes && category.attributes.length > 0 ? (
                            category.attributes.map((attribute: any) => 
                              attribute.options && attribute.options.map((option: string, index: number) => (
                                <Link
                                  key={`${attribute._id}-${index}`}
                                  href={`/products?category=${category._id}&${attribute.name}=${encodeURIComponent(option)}`}
                                  className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                  onClick={() => setIsOpen(false)}
                                >
                                  {option}
                                </Link>
                              ))
                            )
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-400">
                              هیچ ویژگی تعریف نشده
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Bar */}
      <div className="flex-1">
        <GlobalSearch />
      </div>
    </div>
  )
}