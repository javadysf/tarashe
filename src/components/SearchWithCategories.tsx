'use client'

import { useState, useEffect, useMemo } from 'react'
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
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await api.getCategories()
      console.log('Categories response:', response)
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
    <div className="flex items-center gap-2 md:gap-4 w-full max-w-6xl">
      {/* Categories Menu */}
      <div className="relative">
        <button
          onMouseEnter={() => {
            if (hideTimeout) {
              clearTimeout(hideTimeout)
              setHideTimeout(null)
            }
            setIsOpen(true)
          }}
          onMouseLeave={() => {
            const timeout = setTimeout(() => setIsOpen(false), 1000)
            setHideTimeout(timeout)
          }}
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 shadow-sm"
        >
          <Grid3X3 className="h-4 w-4" />
          <span className="hidden md:inline">دستهبندی محصولات</span>
          <span className="md:hidden">دستهها</span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="fixed inset-0 z-[9998] bg-black/50" onClick={() => setIsOpen(false)} />
            <div className="fixed inset-x-0 top-0 bottom-0 z-[9999] bg-white" dir="rtl">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                  <button onClick={() => setIsOpen(false)} className="text-2xl">×</button>
                  <h3 className="text-lg font-bold text-gray-900">دستهبندی کالاها</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {parents.map((parent) => (
                        <div key={parent._id} className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 hover:bg-gray-100 transition-colors relative">
                            <Link
                              href={`/products?category=${encodeURIComponent(parent._id)}`}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-3 p-4 pr-12 text-right text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors"
                            >
                              {parent.image?.url && (
                                <img 
                                  src={parent.image.url} 
                                  alt={parent.image.alt || parent.name}
                                  className="w-8 h-8 rounded object-cover flex-shrink-0"
                                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                                />
                              )}
                              <span>{parent.name}</span>
                            </Link>
                            <button
                              onClick={() => setActiveParentId(activeParentId === parent._id ? null : parent._id)}
                              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2"
                            >
                              <ChevronDown className={`w-5 h-5 transition-transform ${activeParentId === parent._id ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                          {activeParentId === parent._id && (
                            <div className="bg-white">
                              {(childrenByParent[parent._id] || []).map((sub) => (
                                <div key={sub._id} className="border-t">
                                  <Link
                                    href={`/products?category=${encodeURIComponent(sub._id)}`}
                                    onClick={() => setIsOpen(false)}
                                    className="block p-4 text-right font-medium text-blue-600 hover:bg-blue-50 transition-colors border-b border-gray-100"
                                  >
                                    <span className="text-base">{sub.name}</span>
                                  </Link>
                                  {(childrenByParent[sub._id] || []).map((child) => (
                                    <Link
                                      key={child._id}
                                      href={`/products?category=${encodeURIComponent(child._id)}`}
                                      onClick={() => setIsOpen(false)}
                                      className="block p-3 pr-8 text-right text-gray-600 hover:bg-gray-50 transition-colors text-sm border-b border-gray-50"
                                    >
                                      {child.name}
                                    </Link>
                                  ))}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Menu */}
        {isOpen && (
          <div 
            className="hidden md:block absolute right-0 top-full z-[9999] mt-1 w-[900px] rounded-lg border bg-white shadow-2xl"
            onMouseEnter={() => {
              if (hideTimeout) {
                clearTimeout(hideTimeout)
                setHideTimeout(null)
              }
              setIsOpen(true)
            }}
            onMouseLeave={() => {
              const timeout = setTimeout(() => setIsOpen(false), 1000)
              setHideTimeout(timeout)
            }}
            dir="rtl"
          >
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid gap-6 p-8 lg:grid-cols-[1fr_2fr]">
                {/* Categories Sidebar */}
                <div>
                  <div className="mb-4 pb-3 border-b">
                    <h4 className="text-lg font-bold text-right text-gray-800">دستهبندی کالاها</h4>
                  </div>
                  <div className="space-y-2">
                    {parents.map((parent) => (
                      <Link
                        key={parent._id}
                        href={`/products?category=${encodeURIComponent(parent._id)}`}
                        onClick={() => setIsOpen(false)}
                        onMouseEnter={() => setActiveParentId(parent._id)}
                        className={`block w-full text-right p-4 rounded-lg transition-all duration-200 cursor-pointer ${
                          activeParentId === parent._id 
                            ? "bg-blue-50 text-blue-700 border-r-4 border-blue-500 shadow-sm" 
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`h-3 w-3 rounded-full transition-colors ${
                            activeParentId === parent._id ? "bg-blue-500" : "bg-gray-300"
                          }`} />
                          <div className="flex items-center gap-3">
                            {(() => {
                              console.log('Category image check:', parent.name, parent.image)
                              return parent.image?.url && (
                                <img 
                                  src={parent.image.url} 
                                  alt={parent.image.alt || parent.name}
                                  className="w-6 h-6 rounded object-cover"
                                  onError={(e) => { 
                                    console.log('Image load error for category:', parent.name, parent.image.url)
                                    e.currentTarget.style.display = 'none' 
                                  }}
                                  onLoad={() => console.log('Image loaded for category:', parent.name)}
                                />
                              )
                            })()}
                            <div className="text-base font-semibold">{parent.name}</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Content Area */}
                <div className="space-y-4">
                  {activeParentId ? (
                    <>
                      <h5 className="text-lg font-bold text-right text-gray-800 mb-4 pb-2 border-b">
                        {parents.find(p => p._id === activeParentId)?.name}
                      </h5>
                      <div className="grid gap-4">
                        {(childrenByParent[activeParentId] || []).map((sub) => (
                          <div key={sub._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                            <Link
                              href={`/products?category=${encodeURIComponent(sub._id)}`}
                              onClick={() => setIsOpen(false)}
                              className="block mb-3 p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg text-right font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-md text-base"
                            >
                              {sub.name}
                            </Link>
                            {(childrenByParent[sub._id] || []).length > 0 && (
                              <div className="grid grid-cols-2 gap-3">
                                {(childrenByParent[sub._id] || []).map((child) => (
                                  <Link
                                    key={child._id}
                                    href={`/products?category=${encodeURIComponent(child._id)}`}
                                    onClick={() => setIsOpen(false)}
                                    className="block p-3 text-right bg-white text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-gray-200 hover:border-blue-300 text-sm font-medium"
                                  >
                                    {child.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex h-40 items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Grid3X3 className="mx-auto h-12 w-12 opacity-50" />
                        <p className="mt-3 text-base">روی دستهای حرکت کنید</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <GlobalSearch />
      </div>
      <CartButton />
    </div>
  )
}