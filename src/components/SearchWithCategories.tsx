'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Grid3X3, ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { api } from '@/lib/api'
import GlobalSearch from './GlobalSearch'
import CartButton from './CartButton'
import MobileCategoryMenu from './MobileCategoryMenu'

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
    <div className="flex items-center  gap-2 md:gap-4 w-full max-w-6xl">
      {/* Mobile Categories Menu */}
      <div className="md:hidden">
        <MobileCategoryMenu />
      </div>

      {/* Desktop Categories Menu */}
      <div className="hidden md:block">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button 
            onMouseEnter={() => {
              if (hideTimeout) {
                clearTimeout(hideTimeout)
                setHideTimeout(null)
              }
              setIsOpen(true)
            }}
            onMouseLeave={() => {
              const timeout = setTimeout(() => setIsOpen(false), 200)
              setHideTimeout(timeout)
            }}
            className="inline-flex sm:h-14 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 shadow-sm"
          >
            <Grid3X3 className="h-4 w-4" />
            <span className="hidden md:inline">دسته بندی محصولات</span>
            <span className="md:hidden">دسته‌ها</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[95vw] md:w-[1400px] p-0 border-2 border-blue-100 dark:border-blue-800 rounded-xl shadow-2xl bg-white dark:bg-gray-900" 
          align="start"
          dir="rtl"
          onMouseEnter={() => {
            if (hideTimeout) {
              clearTimeout(hideTimeout)
              setHideTimeout(null)
            }
          }}
          onMouseLeave={() => {
            const timeout = setTimeout(() => setIsOpen(false), 200)
            setHideTimeout(timeout)
          }}
          onPointerDownOutside={(e) => {
            // Prevent closing when clicking on the arrow button
            const target = e.target as HTMLElement
            if (target.closest('button[aria-label]') || target.closest('.chevron-down')) {
              e.preventDefault()
            }
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
              <div className="hidden md:grid gap-4 p-6 lg:grid-cols-[280px_1fr]">
              {/* Categories Sidebar */}
              <div className="border-l-2 border-gray-100 dark:border-gray-700 pr-4">
                <div className="mb-3 pb-2 border-b-2 border-blue-100 dark:border-blue-800">
                  <h4 className="text-base font-bold text-right text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <Grid3X3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    دسته‌بندی کالاها
                  </h4>
                </div>
                <div className="space-y-0.5 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {parents.map((parent) => (
                    <div key={parent._id} className="group">
                      <Link
                        href={`/products?category=${encodeURIComponent(parent._id)}`}
                        onClick={() => setIsOpen(false)}
                        onMouseEnter={() => setActiveParentId(parent._id)}
                        className={`block w-full text-right p-2.5 rounded-lg transition-colors duration-200 cursor-pointer ${
                          activeParentId === parent._id 
                            ? "bg-gradient-to-l from-blue-50 to-white dark:from-blue-900 dark:to-gray-800 text-blue-700 dark:text-blue-300 border-r-4 border-blue-500 dark:border-blue-600 shadow-md" 
                            : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-r-4 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                            activeParentId === parent._id ? "bg-blue-500 dark:bg-blue-400" : "bg-gray-300 dark:bg-gray-600"
                          }`} />
                          <div className="flex items-center gap-2 flex-1">
                            {parent.image?.url && (
                              <Image 
                                src={parent.image.url} 
                                alt={parent.image.alt || parent.name}
                                width={24}
                                height={24}
                                className="w-6 h-6 rounded object-cover border border-gray-200 dark:border-gray-600"
                                onError={(e) => { 
                                  e.currentTarget.style.display = 'none' 
                                }}
                                unoptimized
                              />
                            )}
                            <div className="text-sm font-semibold">{parent.name}</div>
                          </div>
                          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-500 transition-transform duration-300 ${
                            activeParentId === parent._id ? 'rotate-180 text-blue-500 dark:text-blue-400' : 'group-hover:text-gray-600 dark:group-hover:text-gray-400'
                          }`} />
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Area */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {activeParentId ? (
                  <>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-blue-100 dark:border-blue-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></div>
                      <h5 className="text-lg font-bold text-right text-gray-800 dark:text-gray-100">
                        {parents.find(p => p._id === activeParentId)?.name}
                      </h5>
                      <div className="flex-1 h-px bg-gradient-to-l from-blue-100 dark:from-blue-800 to-transparent"></div>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-2">
                      {(childrenByParent[activeParentId] || []).map((sub) => (
                        <div key={sub._id} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg p-3 hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600">
                          <Link
                            href={`/products?category=${encodeURIComponent(sub._id)}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 mb-2 p-3 bg-gradient-to-l from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white rounded-lg text-right font-bold hover:from-blue-600 hover:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-800 transition-all shadow-md text-sm hover:shadow-lg"
                          >
                            {sub.image?.url && (
                              <Image 
                                src={sub.image.url} 
                                alt={sub.image.alt || sub.name}
                                width={28}
                                height={28}
                                className="w-7 h-7 rounded object-cover border border-white/20"
                                onError={(e) => { 
                                  e.currentTarget.style.display = 'none' 
                                }}
                                unoptimized
                              />
                            )}
                            {sub.name}
                          </Link>
                          {(childrenByParent[sub._id] || []).length > 0 && (
                            <div className="grid grid-cols-1 gap-1.5">
                              {(childrenByParent[sub._id] || []).map((child) => (
                                <Link
                                  key={child._id}
                                  href={`/products?category=${encodeURIComponent(child._id)}`}
                                  onClick={() => setIsOpen(false)}
                                  className="flex items-center gap-1.5 p-2 text-right bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-md transition-all border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 text-xs font-medium hover:shadow-sm"
                                >
                                  <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500"></div>
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
                  <div className="flex h-80 items-center justify-center text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <Grid3X3 className="mx-auto h-12 w-12 opacity-30 text-blue-500 dark:text-blue-400" />
                      <p className="mt-3 text-base font-medium">روی دسته‌ای حرکت کنید</p>
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">برای مشاهده زیر دسته‌بندی‌ها</p>
                    </div>
                  </div>
                )}
              </div>
              </div>
          )}
        </PopoverContent>
      </Popover>
      </div>
      
      <div className="flex-1">
        <GlobalSearch />
      </div>
      <CartButton />
    </div>
  )
}
