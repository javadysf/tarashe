'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/lib/api'

interface Category {
  _id: string
  name: string
  description?: string
  image?: { url?: string; alt?: string }
  parent?: string | null
}

type CategoryMap = { [parentId: string]: Category[] }

export default function CategorySidebar() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const response = await api.getCategories()
        setCategories(response || [])
      } catch (e) {
        console.error('Error loading categories:', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const { parents, childrenByParent }: { parents: Category[]; childrenByParent: CategoryMap } = useMemo(() => {
    const parents: Category[] = []
    const childrenByParent: CategoryMap = {}

    for (const c of categories) {
      if (!c.parent) {
        parents.push(c)
      } else {
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
    if (!activeId && parents.length) {
      setActiveId(parents[0]._id)
    }
  }, [parents, activeId])

  if (loading) {
    return (
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </section>
    )
  }

  if (parents.length === 0) return null

  const activeChildren = activeId ? (childrenByParent[activeId] || []) : []

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
          <div className="grid grid-cols-12">
            {/* Sidebar (right / RTL) */}
            <div className="col-span-12 lg:col-span-3 order-2 lg:order-1 border-t lg:border-t-0 lg:border-l border-gray-200 bg-gray-50">
              {/* Title */}
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-pink-600">▮</span>
                  <span className="font-bold text-gray-900">دستهبندی کالاها</span>
                </div>
                <span className="text-xs text-gray-400">(نمایش زیرشاخه با هاور)</span>
              </div>

              <ul className="divide-y divide-gray-200 max-h-[480px] overflow-auto">
                {parents.map((cat) => {
                  const isActive = cat._id === activeId
                  return (
                    <li key={cat._id}>
                      <button
                        onMouseEnter={() => setActiveId(cat._id)}
                        onFocus={() => setActiveId(cat._id)}
                        onClick={() => setActiveId(cat._id)}
                        className={`w-full text-right px-4 py-3 flex items-center justify-between gap-3 transition-colors ${
                          isActive ? 'bg-white text-blue-700' : 'hover:bg-white'
                        }`}
                        aria-expanded={isActive}
                      >
                        <span className="font-medium truncate">{cat.name}</span>
                        <svg className={`w-4 h-4 transition-transform ${isActive ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Panel (left) */}
            <div className="col-span-12 lg:col-span-9 order-1 lg:order-2 p-4 lg:p-6">
              {activeId && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                  {activeChildren.length > 0 ? (
                    activeChildren.map((sub) => (
                      <Link
                        key={sub._id}
                        href={`/products?category=${encodeURIComponent(sub._id)}`}
                        className="group flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={sub.image?.url || '/pics/battery.jpg'}
                            alt={sub.image?.alt || sub.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate group-hover:text-blue-700">{sub.name}</div>
                          {sub.description && (
                            <div className="text-xs text-gray-500 truncate">{sub.description}</div>
                          )}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full">
                      <div className="text-center py-10 text-gray-500">
                        زیردستهبندی برای این مورد ثبت نشده است
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
