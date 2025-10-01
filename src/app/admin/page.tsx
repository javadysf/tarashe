'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'

export default function AdminPage() {
  const { user, checkAuth } = useAuthStore()
  const router = useRouter()
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    reviews: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      // Get products count (this works without auth)
      let productsCount = 0
      try {
        const productsRes = await api.getProducts({ limit: 1000 })
        productsCount = productsRes.products?.length || 0
      } catch (error) {
        console.log('Could not fetch products:', error)
      }
      
      // Get orders count (requires auth)
      let ordersCount = 0
      try {
        const ordersRes = await api.getOrders()
        ordersCount = ordersRes?.orders?.length || ordersRes?.length || 0
      } catch (error) {
        console.log('Could not fetch orders (auth required):', error)
      }
      
      // Get users count (requires auth)
      let usersCount = 0
      try {
        const usersRes = await api.getUsers()
        usersCount = usersRes?.users?.length || usersRes?.length || 0
      } catch (error) {
        console.log('Could not fetch users (auth required):', error)
      }
      
      // Get reviews count (requires auth)
      let reviewsCount = 0
      try {
        const reviewsRes = await api.getAllReviews()
        reviewsCount = reviewsRes?.reviews?.length || 0
      } catch (error) {
        console.log('Could not fetch reviews (auth required):', error)
      }
      
      setStats({
        products: productsCount,
        orders: ordersCount,
        users: usersCount,
        reviews: reviewsCount
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">پنل مدیریت</h1>
          <p className="text-gray-600 mt-2">خوش آمدید {user.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">محصولات</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {loading ? '...' : stats.products.toLocaleString('fa-IR')}
                </p>
                <p className="text-sm text-gray-500">مجموع محصولات</p>
              </div>
              <div className="text-blue-600">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">سفارشات</h3>
                <p className="text-3xl font-bold text-green-600">
                  {loading ? '...' : stats.orders.toLocaleString('fa-IR')}
                </p>
                <p className="text-sm text-gray-500">مجموع سفارشات</p>
              </div>
              <div className="text-green-600">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">کاربران</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {loading ? '...' : stats.users.toLocaleString('fa-IR')}
                </p>
                <p className="text-sm text-gray-500">مجموع کاربران</p>
              </div>
              <div className="text-purple-600">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">نظرات</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {loading ? '...' : stats.reviews.toLocaleString('fa-IR')}
                </p>
                <p className="text-sm text-gray-500">مجموع نظرات</p>
              </div>
              <div className="text-orange-600">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">عملیات سریع</h2>
            </div>
            <div className="p-6 space-y-4">
              <Link href="/admin/products" className="block w-full text-right px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <span className="font-medium text-blue-900">مدیریت محصولات</span>
                <p className="text-sm text-blue-600">افزودن، ویرایش و حذف محصولات</p>
              </Link>
              
              <Link href="/admin/orders" className="block w-full text-right px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <span className="font-medium text-green-900">مدیریت سفارشات</span>
                <p className="text-sm text-green-600">بررسی و پردازش سفارشات</p>
              </Link>
              
              <Link href="/admin/users" className="block w-full text-right px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <span className="font-medium text-purple-900">مدیریت کاربران</span>
                <p className="text-sm text-purple-600">مشاهده و مدیریت کاربران</p>
              </Link>
              
              <Link href="/admin/reviews" className="block w-full text-right px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <span className="font-medium text-orange-900">مدیریت نظرات</span>
                <p className="text-sm text-orange-600">مشاهده و حذف نظرات کاربران</p>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">آخرین فعالیتها</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">سیستم آماده است</span>
                  </div>
                  <span className="text-sm text-gray-400">الان</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">{stats.products} محصول در فروشگاه</span>
                  </div>
                  <span className="text-sm text-gray-400">آپدیت شده</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600">{stats.users} کاربر عضو</span>
                  </div>
                  <span className="text-sm text-gray-400">فعال</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-600">{stats.reviews} نظر ثبت شده</span>
                  </div>
                  <span className="text-sm text-gray-400">مجموع</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}