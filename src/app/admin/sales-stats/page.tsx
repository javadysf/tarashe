'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function SalesStatsPage() {
  const { user, checkAuth } = useAuthStore()
  const router = useRouter()
  const [period, setPeriod] = useState('week')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.getSalesStats(period)
      setStats(data)
    } catch (error) {
      console.error('Error fetching sales stats:', error)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchStats()
    } else if (user && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, fetchStats, router])

  const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(price)
  const formatDate = (date: string) => new Date(date).toLocaleDateString('fa-IR')

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const maxRevenue = stats?.dailyChart.reduce((max: number, day: any) => 
    Math.max(max, day.revenue), 0) || 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">آمار فروش</h1>
          <div className="flex gap-2 mt-4">
            {['week', 'month', 'year'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {p === 'week' ? 'هفته' : p === 'month' ? 'ماه' : 'سال'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : stats ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-gray-500 dark:text-gray-400 mb-2">درآمد کل</h3>
                <p className="text-3xl font-bold text-green-600">
                  {formatPrice(stats.stats.totalRevenue)} تومان
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-gray-500 dark:text-gray-400 mb-2">تعداد سفارشات</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {formatPrice(stats.stats.totalOrders)}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-gray-500 dark:text-gray-400 mb-2">میانگین هر سفارش</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {formatPrice(stats.stats.averageOrderValue)} تومان
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">نمودار درآمد روزانه</h2>
              <div className="h-64 flex items-end justify-between gap-1">
                {stats.dailyChart.map((day: any, idx: number) => (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-t relative group">
                      <div
                        className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:opacity-80 cursor-pointer"
                        style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                      />
                      <div className="absolute -top-8 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                        {formatPrice(day.revenue)}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left truncate w-16">
                      {formatDate(day.date)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Top Products */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold">پرفروش‌ترین محصولات</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {stats.topProducts.slice(0, 5).map((product: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.quantity} عدد فروخته شده</p>
                        </div>
                        <div className="text-left ml-4">
                          <p className="font-bold text-green-600">{formatPrice(product.revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Customers */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold">بهترین مشتریان</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {stats.topCustomers.slice(0, 5).map((customer: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <div className="flex-1">
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                        </div>
                        <div className="text-left ml-4">
                          <p className="font-bold text-blue-600">{formatPrice(customer.total)}</p>
                          <p className="text-xs text-gray-500">{customer.orders} سفارش</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold">سفارشات اخیر</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300">تاریخ</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300">مشتری</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300">محصولات</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300">وضعیت</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300">مبلغ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {stats.recentOrders.slice(0, 10).map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(order.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="font-medium">{order.customer}</p>
                            <p className="text-xs text-gray-500">{order.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="max-w-md">
                            {order.items.slice(0, 2).map((item: any, idx: number) => (
                              <p key={idx} className="text-xs">{item.quantity}x {item.name}</p>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-xs text-gray-500">+{order.items.length - 2} محصول دیگر</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status === 'delivered' ? 'تحویل شده' :
                             order.status === 'shipped' ? 'ارسال شده' :
                             order.status === 'processing' ? 'در حال پردازش' :
                             'در انتظار'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                          {formatPrice(order.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}













