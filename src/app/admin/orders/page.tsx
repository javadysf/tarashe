'use client'

import { useState, useEffect } from 'react'
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

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const response = await api.getOrders()
      setOrders(response.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

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
        <h1 className="text-2xl font-bold mb-6">مدیریت سفارشات</h1>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">شماره سفارش</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">مشتری</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">مبلغ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">وضعیت</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاریخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <button
                        onClick={() => {
                          setSelectedOrder(order)
                          setShowModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        #{order._id.slice(-6)}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div className="font-medium">{order.user.name}</div>
                        <div className="text-gray-400">{order.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Intl.NumberFormat('fa-IR').format(order.totalAmount)} تومان
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
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
            
            {orders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                هیچ سفارشی یافت نشد
              </div>
            )}
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
                    <p><span className="font-medium">نام:</span> {selectedOrder.user.name}</p>
                    <p><span className="font-medium">ایمیل:</span> {selectedOrder.user.email}</p>
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