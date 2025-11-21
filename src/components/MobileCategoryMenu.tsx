'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Grid3X3, ChevronDown, X } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog'
import { api } from '@/lib/api'

interface Category {
  _id: string
  name: string
  description?: string
  parent?: string | null
  image?: { url?: string; alt?: string }
}

type CategoryMap = { [parentId: string]: Category[] }

export default function MobileCategoryMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set())

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

  const toggleParent = (parentId: string) => {
    setExpandedParents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(parentId)) {
        newSet.delete(parentId)
      } else {
        newSet.add(parentId)
      }
      return newSet
    })
  }

  const handleCategoryClick = () => {
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button 
          className="inline-flex h-[50px] sm:h-14 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 shadow-sm"
        >
          <Grid3X3 className="h-4 w-4" />
          <span>دسته‌ها</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent 
        className="w-[95vw] max-w-[95vw] h-[85vh] p-0 border-2 border-blue-100 dark:border-blue-800 rounded-xl shadow-2xl bg-white dark:bg-gray-900 flex flex-col"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-blue-100 dark:border-blue-800">
          <DialogTitle asChild>
            <h3 className="text-lg font-bold text-right text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Grid3X3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              دسته‌بندی کالاها
            </h3>
          </DialogTitle>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="بستن"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {parents.map((parent) => {
                const isExpanded = expandedParents.has(parent._id)
                return (
                  <div 
                    key={parent._id} 
                    className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-blue-300 dark:hover:border-blue-600 transition-all shadow-md"
                  >
                    {/* Parent Category Header */}
                    <div className="relative flex items-center">
                      <Link
                        href={`/products?category=${encodeURIComponent(parent._id)}`}
                        onClick={handleCategoryClick}
                        className="flex-1 flex items-center gap-2 p-3 bg-gradient-to-l from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 hover:from-blue-50 hover:to-white dark:hover:from-blue-900 dark:hover:to-gray-800 transition-all"
                      >
                        {parent.image?.url && (
                          <Image 
                            src={parent.image.url} 
                            alt={parent.image.alt || parent.name}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded object-cover flex-shrink-0 border border-gray-200 dark:border-gray-600"
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                            unoptimized
                          />
                        )}
                        <span className="text-base font-bold text-gray-800 dark:text-gray-100">{parent.name}</span>
                      </Link>
                      
                      {/* Arrow Button */}
                      {(childrenByParent[parent._id]?.length > 0) && (
                        <button
                          onClick={() => toggleParent(parent._id)}
                          className="p-3 hover:bg-blue-50 dark:hover:bg-blue-900 transition-all flex-shrink-0"
                          aria-label={isExpanded ? 'بستن' : 'باز کردن'}
                        >
                          <ChevronDown 
                            className={`w-6 h-6 transition-transform duration-300 ${
                              isExpanded 
                                ? 'rotate-180 text-blue-500 dark:text-blue-400' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`} 
                          />
                        </button>
                      )}
                    </div>

                    {/* Sub Categories */}
                    {isExpanded && childrenByParent[parent._id] && (
                      <div className="bg-white dark:bg-gray-800 border-t-2 border-gray-100 dark:border-gray-700">
                        {(childrenByParent[parent._id] || []).map((sub) => (
                          <div key={sub._id} className="border-t border-gray-100 dark:border-gray-700 first:border-t-0">
                            <Link
                              href={`/products?category=${encodeURIComponent(sub._id)}`}
                              onClick={handleCategoryClick}
                              className="block p-3 text-right font-bold text-blue-600 dark:text-blue-400 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900 dark:to-gray-800 hover:from-blue-100 hover:to-white dark:hover:from-blue-800 dark:hover:to-gray-700 transition-all border-b border-blue-100 dark:border-blue-800 shadow-sm"
                            >
                              <span className="text-sm flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                                {sub.name}
                              </span>
                            </Link>
                            
                            {/* Grand Children */}
                            {childrenByParent[sub._id] && childrenByParent[sub._id].length > 0 && (
                              <div className="bg-gray-50 dark:bg-gray-900">
                                {(childrenByParent[sub._id] || []).map((child) => (
                                  <Link
                                    key={child._id}
                                    href={`/products?category=${encodeURIComponent(child._id)}`}
                                    onClick={handleCategoryClick}
                                    className="block p-2 pr-10 text-right text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-xs border-b border-gray-100 dark:border-gray-800 font-medium last:border-b-0"
                                  >
                                    <span className="flex items-center gap-1.5">
                                      <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                                      {child.name}
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

