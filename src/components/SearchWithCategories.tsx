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
    <div className="flex items-center gap-2 md:gap-4 w-full max-w-6xl">
      {/* Categories Menu */}
      <div className="relative">
        <button
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 shadow-sm"
        >
          <Grid3X3 className="h-4 w-4" />
          <span className="hidden md:inline">دسته بندی محصولات</span>
          <span className="md:hidden">دسته ها</span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div 
            className="absolute right-0 top-full z-[9999] mt-1 w-[800px] rounded-md border bg-popover p-0 text-popover-foreground shadow-md"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            dir="rtl"
          >
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid gap-3 p-6 lg:grid-cols-[.75fr_1fr]">
                {/* Categories Sidebar */}
                <div className="row-span-3">
                  <div className="mb-3 pb-2 border-b">
                    <h4 className="text-sm font-semibold text-right">دسته بندی کالاها</h4>
                  </div>
                  <div className="grid gap-1">
                    {parents.map((parent) => (
                      <button
                        key={parent._id}
                        onMouseEnter={() => setActiveParentId(parent._id)}
                        className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-right bg-blue-50 ${
                          activeParentId === parent._id ? "bg-accent text-accent-foreground" : ""
                        }`}
                      >
                        <div className="flex cursor-pointer] items-center justify-between">
                          <div className={`h-2 w-2 rounded-full transition-colors ${
                            activeParentId === parent._id ? "bg-primary" : "bg-muted-foreground/50"
                          }`} />
                          <div className="text-sm font-medium leading-none">{parent.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Area */}
                <div className="space-y-3">
                  {activeParentId ? (
                    <>
                      <h5 className="text-sm font-medium text-right text-muted-foreground mb-3">
                        {parents.find(p => p._id === activeParentId)?.name}
                      </h5>
                      <div className="grid gap-3">
                        {(childrenByParent[activeParentId] || []).map((sub) => (
                          <div key={sub._id} className="space-y-2">
                            <Link
                              href={`/products?category=${encodeURIComponent(sub._id)}`}
                              onClick={() => setIsOpen(false)}
                              className="block select-none space-y-1 rounded-md bg-gradient-to-r from-muted/50 to-muted p-3 leading-none no-underline outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground text-right"
                            >
                              <div className="text-sm font-medium leading-none">{sub.name}</div>
                            </Link>
                            {(childrenByParent[sub._id] || []).length > 0 && (
                              <div className="grid grid-cols-2 gap-2 pr-4">
                                {(childrenByParent[sub._id] || []).map((child) => (
                                  <Link
                                    key={child._id}
                                    href={`/products?category=${encodeURIComponent(child._id)}`}
                                    onClick={() => setIsOpen(false)}
                                    className="block select-none rounded-sm p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-right text-xs border"
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
                    <div className="flex h-32 items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Grid3X3 className="mx-auto h-8 w-8 opacity-50" />
                        <p className="mt-2 text-xs">روی دستهای حرکت کنید</p>
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