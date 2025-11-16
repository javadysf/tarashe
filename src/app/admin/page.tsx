'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'

const STAT_CARDS = [
  {
    key: 'products',
    title: 'محصولات',
    description: 'مجموع محصولات',
    colorClasses: { text: 'text-blue-600', icon: 'text-blue-600' },
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    )
  },
  {
    key: 'orders',
    title: 'سفارشات',
    description: 'مجموع سفارشات',
    colorClasses: { text: 'text-green-600', icon: 'text-green-600' },
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    )
  },
  {
    key: 'users',
    title: 'کاربران',
    description: 'مجموع کاربران',
    colorClasses: { text: 'text-purple-600', icon: 'text-purple-600' },
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    )
  },
  {
    key: 'reviews',
    title: 'نظرات',
    description: 'مجموع نظرات',
    colorClasses: { text: 'text-orange-600', icon: 'text-orange-600' },
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    )
  }
]

const QUICK_ACTIONS = [
  {
    href: '/admin/products',
    title: 'مدیریت محصولات',
    description: 'افزودن، ویرایش و حذف محصولات',
    bgClass: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30',
    textClass: 'text-blue-900 dark:text-blue-300',
    descClass: 'text-blue-600 dark:text-blue-400'
  },
  {
    href: '/admin/orders',
    title: 'مدیریت سفارشات',
    description: 'بررسی و پردازش سفارشات',
    bgClass: 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30',
    textClass: 'text-green-900 dark:text-green-300',
    descClass: 'text-green-600 dark:text-green-400'
  },
  {
    href: '/admin/users',
    title: 'مدیریت کاربران',
    description: 'مشاهده و مدیریت کاربران',
    bgClass: 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30',
    textClass: 'text-purple-900 dark:text-purple-300',
    descClass: 'text-purple-600 dark:text-purple-400'
  },
  {
    href: '/admin/reviews',
    title: 'مدیریت نظرات',
    description: 'مشاهده و حذف نظرات کاربران',
    bgClass: 'bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30',
    textClass: 'text-orange-900 dark:text-orange-300',
    descClass: 'text-orange-600 dark:text-orange-400'
  },
  {
    href: '/admin/activity-logs',
    title: 'لاگ فعالیت‌ها',
    description: 'مشاهده تمام فعالیت‌های انجام شده',
    bgClass: 'bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30',
    textClass: 'text-indigo-900 dark:text-indigo-300',
    descClass: 'text-indigo-600 dark:text-indigo-400'
  }
]

const fetchStat = async (key: string) => {
  try {
    switch (key) {
      case 'products':
        const productsRes = await api.getProducts({ limit: 1000 })
        return productsRes.products?.length || 0
      case 'orders':
        const ordersRes = await api.getOrders()
        return ordersRes?.orders?.length || ordersRes?.length || 0
      case 'users':
        const usersRes = await api.getUsers()
        return usersRes?.users?.length || usersRes?.length || 0
      case 'reviews':
        const reviewsRes = await api.getAllReviews()
        return reviewsRes?.reviews?.length || 0
      default:
        return 0
    }
  } catch {
    return 0
  }
}

export default function AdminPage() {
  const { user, checkAuth } = useAuthStore()
  const router = useRouter()
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, reviews: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  useEffect(() => {
    if (user?.role === 'admin') {
      Promise.all(STAT_CARDS.map(card => fetchStat(card.key)))
        .then(([products, orders, users, reviews]) => {
          setStats({ products, orders, users, reviews })
        })
        .finally(() => setLoading(false))
    }
  }, [user])

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">پنل مدیریت</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">خوش آمدید {user.name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
          {STAT_CARDS.map(card => (
            <div key={card.key} className="bg-white dark:bg-gray-800 rounded-lg shadow p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{card.title}</h3>
                  <p className={`text-3xl font-bold ${card.colorClasses.text}`}>
                    {loading ? '...' : stats[card.key as keyof typeof stats].toLocaleString('fa-IR')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.description}</p>
                </div>
                <div className={card.colorClasses.icon}>
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {card.icon}
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">عملیات سریع</h2>
            </div>
            <div className="p-3 space-y-4">
              {QUICK_ACTIONS.map(action => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`block w-full text-right px-4 py-2 ${action.bgClass} rounded-lg transition-colors`}
                >
                  <span className={`font-medium ${action.textClass}`}>
                    {action.title}
                  </span>
                  <p className={`text-sm ${action.descClass}`}>
                    {action.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">آخرین فعالیت‌ها</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { text: 'سیستم آماده است', time: 'الان', dotClass: 'bg-green-500' },
                  { text: `${stats.products} محصول در فروشگاه`, time: 'آپدیت شده', dotClass: 'bg-blue-500' },
                  { text: `${stats.users} کاربر عضو`, time: 'فعال', dotClass: 'bg-purple-500' },
                  { text: `${stats.reviews} نظر ثبت شده`, time: 'مجموع', dotClass: 'bg-orange-500' }
                ].map((activity, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between py-2 ${idx < 3 ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 ${activity.dotClass} rounded-full`}></div>
                      <span className="text-gray-600 dark:text-gray-400">{activity.text}</span>
                    </div>
                    <span className="text-sm text-gray-400 dark:text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
