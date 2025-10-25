'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '@/lib/api'

interface Product {
  _id: string
  name: string
  price: number
  images: { url: string; alt: string }[]
  rating?: { average: number; count: number }
  category?: { name: string }
  stock?: number
}

export default function BestSellingProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        // Mock data for now
        setProducts([
          {
            _id: '1',
            name: 'باتری HP Pavilion 15',
            price: 850000,
            images: [{ url: '/pics/battery.jpg', alt: 'باتری HP' }],
            rating: { average: 4.8, count: 24 },
            category: { name: 'باتری لپ تاپ' },
            stock: 25
          },
          {
            _id: '2',
            name: 'شارژر Dell Inspiron',
            price: 450000,
            images: [{ url: '/pics/battery.jpg', alt: 'شارژر Dell' }],
            rating: { average: 4.6, count: 18 },
            category: { name: 'شارژر لپ تاپ' },
            stock: 15
          }
        ])
      } catch (e) {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="h-6 w-40 bg-gray-200 rounded mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">محصولات پرفروش</h2>
        <Link href="/products" className="text-sm text-blue-600 hover:text-blue-800">مشاهده همه</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map(p => (
          <Link href={`/products/${p._id}`} key={p._id} className="group">
            <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
              <div className="aspect-square bg-white">
                <Image src={p.images?.[0]?.url || '/pics/battery.jpg'} alt={p.images?.[0]?.alt || p.name} width={300} height={300} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-3">
                <div className="text-sm font-semibold text-gray-900 line-clamp-2">{p.name}</div>
                <div className="mt-2 text-sm text-gray-700">{new Intl.NumberFormat('fa-IR').format(p.price)} تومان</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}











