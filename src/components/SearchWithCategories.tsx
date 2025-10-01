'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ChevronDown, Grid3X3 } from 'lucide-react'
import { api } from '@/lib/api'
import GlobalSearch from './GlobalSearch'
import CartButton from './CartButton'

interface Category {
  _id: string
  name: string
  description?: string
  parent?: string | null
  image?: { url?: string; alt?: string }
}

type CategoryMap = { [parentId: string]: Category[] }

export default function SearchWithCategories() {
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [activeParentId, setActiveParentId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      fetchCategories()
    }
  }, [isOpen])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await api.getCategories()
      setCategories(response)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const { parents, childrenByParent }: { parents: Category[]; childrenByParent: CategoryMap } = useMemo(() => {
    const parents: Category[] = []
    const childrenByParent: CategoryMap = {}
    for (const c of categories) {
      if (!c.parent) parents.push(c)
      else {
        // Only show direct children (level 2) of level 1 categories
        const pid = typeof c.parent === 'string' ? c.parent : String(c.parent)
        if (!childrenByParent[pid]) childrenByParent[pid] = []
        childrenByParent[pid].push(c)
      }
    }
    parents.sort((a, b) => a.name.localeCompare(b.name, 'fa'))
    Object.values(childrenByParent).forEach(list => list.sort((a, b) => a.name.localeCompare(b.name, 'fa')))
    return { parents, childrenByParent }
  }, [categories])

  useEffect(() => {
    if (!activeParentId && parents.length) setActiveParentId(parents[0]._id)
  }, [parents, activeParentId])

  return (
    <div className="flex items-center gap-4 w-full max-w-6xl">
      {/* Categories Menu - Right Side */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center bg-yellow-200 gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-full hover:border-blue-500 transition-all duration-300 font-medium text-gray-700 hover:text-blue-600 min-w-max"
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
              className="absolute top-full right-0 mt-2 w-screen bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 p-0 z-[9999]"
            >
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-12">
                  {/* Parents */}
                  <div className="col-span-12 md:col-span-4 border-l border-gray-200 bg-gray-50 rounded-r-2xl overflow-auto max-h-[70vh]">
                    <div className="px-4 py-3 border-b border-gray-200 font-bold text-gray-900">دستهبندی کالاها</div>
                    <ul className="divide-y divide-gray-200">
                      {parents.map((p) => {
                        const isActive = p._id === activeParentId
                        return (
                          <li key={p._id}>
                            <button
                              onMouseEnter={() => setActiveParentId(p._id)}
                              onFocus={() => setActiveParentId(p._id)}
                              onClick={() => setActiveParentId(p._id)}
                              className={`w-full text-right px-4 py-3 flex items-center justify-between gap-3 transition-colors ${isActive ? 'bg-white text-blue-700' : 'hover:bg-white'}`}
                            >
                              <span className="font-medium truncate">{p.name}</span>
                              <svg className={`w-4 h-4 transition-transform ${isActive ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>

                  {/* Children */}
                  <div className="col-span-12 md:col-span-8 p-6 max-h-[70vh] overflow-auto">
                    {activeParentId ? (
                      <div className="space-y-4">
                        {(childrenByParent[activeParentId] || []).map((sub: any) => (
                          <div key={sub._id} className="rounded-xl border border-gray-200">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-t-xl">
                              <Link
                                href={`/products?category=${encodeURIComponent(sub._id)}`}
                                className="font-semibold text-gray-900 hover:text-blue-700 truncate"
                                onClick={() => setIsOpen(false)}
                              >
                                {sub.name}
                              </Link>
                              <span className="text-gray-300">›</span>
                            </div>
                            {(childrenByParent[sub._id] || []).length > 0 && (
                              <div className="p-2">
                                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1">
                                  {(childrenByParent[sub._id] || []).map((g: any) => (
                                    <li key={g._id}>
                                      <Link
                                        href={`/products?category=${encodeURIComponent(g._id)}`}
                                        className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-50 text-gray-700 hover:text-blue-700"
                                        onClick={() => setIsOpen(false)}
                                      >
                                        <span className="truncate">{g.name}</span>
                                        <span className="text-gray-300">›</span>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                        {(childrenByParent[activeParentId] || []).length === 0 && (
                          <div className="text-gray-500 py-2">زیردسته‌ای ثبت نشده</div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <CartButton />
      {/* Search Bar */}
      <div className="flex-1">
        <GlobalSearch />
      </div>
    </div>
  )
}