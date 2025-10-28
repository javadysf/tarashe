'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'

interface Order {
  _id: string
  user: { name: string; email: string }
  totalAmount: number
  status: string
  createdAt: string
  items: { product: { name: string }; quantity: number }[]
  shippingAddress?: {
    address: string
    city: string
    postalCode: string
    phone: string
  }
  phone?: string
  address?: string
}

export default function AdminOrdersPage() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [sort, setSort] = useState('createdAt-desc')
  const limit = 10

  // Stable hook for pagination pages
  const pageNumbers = useMemo(() => {
    const pages: number[] = []
    const maxToShow = 5
    const half = Math.floor(maxToShow / 2)
    let start = Math.max(1, page - half)
    let end = Math.min(totalPages, start + maxToShow - 1)
    if (end - start + 1 < maxToShow) start = Math.max(1, end - maxToShow + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }, [page, totalPages])

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchOrders()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page, sort])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params: any = { page: String(page), limit: String(limit), sort }
      if (search) params.search = search
      if (status) params.status = status
      if (dateFrom) params.dateFrom = dateFrom
      if (dateTo) params.dateTo = dateTo
      if (minAmount) params.minAmount = minAmount
      if (maxAmount) params.maxAmount = maxAmount
      const response = await api.getOrders(params)
      setOrders(response.orders || [])
      setTotalPages(response.pagination?.totalPages || 1)
      setTotalOrders(response.pagination?.totalOrders || 0)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  // Debounce filters/search
  useEffect(() => {
    if (user?.role !== 'admin') return
    const t = setTimeout(() => {
      setPage(1)
      fetchOrders()
    }, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, dateFrom, dateTo, minAmount, maxAmount])

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status)
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status } : order
      ))
    } catch (error) {
      alert('خطا در بروزرسانی وضعیت')
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'در انتظار',
      confirmed: 'تایید شده',
      processing: 'در حال پردازش',
      shipped: 'ارسال شده',
      delivered: 'تحویل داده شده',
      cancelled: 'لغو شده'
    }
    return texts[status as keyof typeof texts] || status
  }

  if (user?.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">مدیریت سفارشات</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2 sm:gap-3">
          <input
            type="text"
            placeholder="جستجوی مشتری (نام/ایمیل)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm md:col-span-2"
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm">
            <option value="">همه وضعیت‌ها</option>
            <option value="pending">در انتظار</option>
            <option value="confirmed">تایید شده</option>
            <option value="processing">در حال پردازش</option>
            <option value="shipped">ارسال شده</option>
            <option value="delivered">تحویل داده شده</option>
            <option value="cancelled">لغو شده</option>
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input type="number" inputMode="numeric" placeholder="حداقل مبلغ" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input type="number" inputMode="numeric" placeholder="حداکثر مبلغ" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm md:col-span-2">
            <option value="createdAt-desc">جدیدترین</option>
            <option value="createdAt-asc">قدیمی‌ترین</option>
            <option value="amount-desc">مبلغ (زیاد به کم)</option>
            <option value="amount-asc">مبلغ (کم به زیاد)</option>
            <option value="status">وضعیت</option>
          </select>
          <button onClick={() => { setSearch(''); setStatus(''); setDateFrom(''); setDateTo(''); setMinAmount(''); setMaxAmount(''); setSort('createdAt-desc'); setPage(1); fetchOrders(); }} className="border border-gray-300 rounded px-3 py-2 text-sm">پاک‌سازی</button>
          <div className="text-sm text-gray-600 self-center md:col-span-2">{totalOrders} سفارش</div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">شماره</th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">مشتری</th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">مبلغ</th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">وضعیت</th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase hidden md:table-cell">تاریخ</th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900">
                      <button
                        onClick={() => {
                          setSelectedOrder(order)
                          setShowModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-xs sm:text-sm"
                      >
                        #{order._id.slice(-6)}
                      </button>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">
                      <div>
                        <div className="font-medium truncate max-w-32">{order?.user?.name}</div>
                        <div className="text-gray-400 text-xs truncate max-w-32">{order?.user?.email}</div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="text-xs sm:text-sm">{new Intl.NumberFormat('fa-IR').format(order.totalAmount)} ت</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-1 sm:px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="text-xs sm:text-sm border border-gray-300 rounded px-1 sm:px-2 py-1 w-full max-w-24 sm:max-w-none"
                      >
                        <option value="pending">در انتظار</option>
                        <option value="confirmed">تایید شده</option>
                        <option value="processing">در حال پردازش</option>
                        <option value="shipped">ارسال شده</option>
                        <option value="delivered">تحویل داده شده</option>
                        <option value="cancelled">لغو شده</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            
            {orders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                هیچ سفارشی یافت نشد
              </div>
            )}

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 sm:px-6 py-4 bg-white border-t gap-4">
              <div className="text-sm text-gray-600 text-center sm:text-right">صفحه {page} از {totalPages}</div>
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className={`px-2 sm:px-3 py-1 rounded-lg border text-xs sm:text-sm ${page <= 1 ? 'text-gray-300 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>قبلی</button>
                {pageNumbers.map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm border ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{p}</button>
                ))}
                <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className={`px-2 sm:px-3 py-1 rounded-lg border text-xs sm:text-sm ${page >= totalPages ? 'text-gray-300 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>بعدی</button>
              </div>
            </div>
          </div>
        )}
        
        {/* Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    جزئیات سفارش #{selectedOrder._id.slice(-6)}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Customer Info */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">اطلاعات مشتری</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><span className="font-medium">نام:</span> {selectedOrder?.user?.name}</p>
                    <p><span className="font-medium">ایمیل:</span> {selectedOrder?.user?.email}</p>
                    {(selectedOrder.phone || selectedOrder.shippingAddress?.phone) && (
                      <p><span className="font-medium">شماره تماس:</span> {selectedOrder.phone || selectedOrder.shippingAddress?.phone}</p>
                    )}
                  </div>
                </div>
                
                {/* Shipping Address */}
                {(selectedOrder.address || selectedOrder.shippingAddress) && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">آدرس ارسال</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      {selectedOrder.shippingAddress ? (
                        <>
                          <p><span className="font-medium">آدرس:</span> {selectedOrder.shippingAddress.address}</p>
                          <p><span className="font-medium">شهر:</span> {selectedOrder.shippingAddress.city}</p>
                          <p><span className="font-medium">کد پستی:</span> {selectedOrder.shippingAddress.postalCode}</p>
                        </>
                      ) : (
                        <p><span className="font-medium">آدرس:</span> {selectedOrder.address}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Order Info */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">اطلاعات سفارش</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><span className="font-medium">شماره سفارش:</span> #{selectedOrder._id}</p>
                    <p><span className="font-medium">تاریخ:</span> {new Date(selectedOrder.createdAt).toLocaleDateString('fa-IR')}</p>
                    <p><span className="font-medium">وضعیت:</span> 
                      <span className={`mr-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </p>
                    <p><span className="font-medium">مبلغ کل:</span> {new Intl.NumberFormat('fa-IR').format(selectedOrder.totalAmount)} تومان</p>
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">محصولات سفارش</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-gray-600">تعداد: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex justify-end space-x-3 space-x-reverse">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    بستن
                  </button>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      updateOrderStatus(selectedOrder._id, e.target.value)
                      setSelectedOrder({...selectedOrder, status: e.target.value})
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="pending">در انتظار</option>
                    <option value="confirmed">تایید شده</option>
                    <option value="processing">در حال پردازش</option>
                    <option value="shipped">ارسال شده</option>
                    <option value="delivered">تحویل داده شده</option>
                    <option value="cancelled">لغو شده</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}