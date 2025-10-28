'use client'

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'

interface User {
  _id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

export default function AdminUsersPage() {
  const { user } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersPage, setOrdersPage] = useState(1)
  const ordersPerPage = 5

  const paginatedOrders = useMemo(() => {
    const start = (ordersPage - 1) * ordersPerPage
    return orders.slice(start, start + ordersPerPage)
  }, [orders, ordersPage])

  const totalOrdersPages = useMemo(() => {
    return Math.max(1, Math.ceil((orders?.length || 0) / ordersPerPage))
  }, [orders])

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers()
    }
  }, [user])

  const fetchUsers = async () => {
    try {
      const response = await api.getUsers()
      setUsers(response.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await api.updateUser(userId, { isActive: !isActive })
      setUsers(users.map(u => 
        u._id === userId ? { ...u, isActive: !isActive } : u
      ))
    } catch (error) {
      alert('خطا در تغییر وضعیت کاربر')
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return
    
    try {
      await api.deleteUser(userId)
      setUsers(users.filter(u => u._id !== userId))
    } catch (error) {
      alert('خطا در حذف کاربر')
    }
  }

  const openUserModal = async (u: User) => {
    setSelectedUser(u)
    setOrders([])
    setOrdersLoading(true)
    setOrdersPage(1)
    try {
      const res = await api.getOrdersByUser(u._id)
      setOrders(res.orders || [])
    } catch (e) {
      // noop
    } finally {
      setOrdersLoading(false)
    }
  }

  const closeUserModal = () => {
    setSelectedUser(null)
    setOrders([])
  }

  if (user?.role !== 'admin') return null

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">مدیریت کاربران</h1>

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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نام</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ایمیل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نقش</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">وضعیت</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاریخ عضویت</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((userData) => (
                  <tr key={userData._id} className="cursor-pointer hover:bg-gray-50" onClick={() => openUserModal(userData)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {userData.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userData.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        userData.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {userData.role === 'admin' ? 'ادمین' : 'کاربر'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        userData.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {userData.isActive ? 'فعال' : 'غیرفعال'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(userData.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleUserStatus(userData._id, userData.isActive)}
                        className={`ml-4 ${
                          userData.isActive 
                            ? 'text-red-600 hover:text-red-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {userData.isActive ? 'غیرفعال' : 'فعال'}
                      </button>
                      
                      {userData.role !== 'admin' && (
                        <button
                          onClick={() => deleteUser(userData._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          حذف
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            
            {users.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                هیچ کاربری یافت نشد
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {/* User details modal */}
    {selectedUser && (
      <Dialog open={!!selectedUser} onOpenChange={(open) => { if (!open) closeUserModal() }}>
        <DialogContent className="max-w-3xl pt-10">
          <DialogHeader>
            <DialogTitle className="pr-8">جزئیات کاربر</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">نام:</span> <span className="font-medium">{selectedUser.name}</span></div>
              <div><span className="text-gray-500">ایمیل:</span> <span className="font-medium">{selectedUser.email}</span></div>
              <div><span className="text-gray-500">نقش:</span> <span className="font-medium">{selectedUser.role === 'admin' ? 'ادمین' : 'کاربر'}</span></div>
              <div><span className="text-gray-500">وضعیت:</span> <span className={`font-medium ${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>{selectedUser.isActive ? 'فعال' : 'غیرفعال'}</span></div>
              <div><span className="text-gray-500">تاریخ عضویت:</span> <span className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString('fa-IR')}</span></div>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">سفارش‌ها</h3>
              {ordersLoading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-gray-500 text-sm">سفارشی یافت نشد</div>
              ) : (
                <div className="max-h-80 overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-right font-medium text-gray-500">کد</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-500">تاریخ</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-500">مبلغ</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-500">وضعیت</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {paginatedOrders.map((o) => (
                        <tr key={o._id}>
                          <td className="px-3 py-2 font-mono">{o._id.slice(-6).toUpperCase()}</td>
                          <td className="px-3 py-2">{new Date(o.createdAt).toLocaleString('fa-IR')}</td>
                          <td className="px-3 py-2">{new Intl.NumberFormat('fa-IR').format(o.totalAmount)} تومان</td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              o.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              o.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Orders pagination */}
                  <div className="flex items-center justify-between px-1 py-3">
                    <div className="text-xs text-gray-500">صفحه {ordersPage} از {totalOrdersPages}</div>
                    <div className="flex items-center gap-2">
                      <button
                        className={`px-2 py-1 rounded border text-xs ${ordersPage <= 1 ? 'text-gray-300 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        disabled={ordersPage <= 1}
                        onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                      >
                        قبلی
                      </button>
                      {useMemo(() => {
                        const pages: number[] = []
                        const maxToShow = 5
                        const half = Math.floor(maxToShow / 2)
                        let start = Math.max(1, ordersPage - half)
                        let end = Math.min(totalOrdersPages, start + maxToShow - 1)
                        if (end - start + 1 < maxToShow) start = Math.max(1, end - maxToShow + 1)
                        for (let i = start; i <= end; i++) pages.push(i)
                        return pages
                      }, [ordersPage, totalOrdersPages]).map(p => (
                        <button
                          key={p}
                          onClick={() => setOrdersPage(p)}
                          className={`px-2 py-1 rounded border text-xs ${p === ordersPage ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        className={`px-2 py-1 rounded border text-xs ${ordersPage >= totalOrdersPages ? 'text-gray-300 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                        disabled={ordersPage >= totalOrdersPages}
                        onClick={() => setOrdersPage(p => Math.min(totalOrdersPages, p + 1))}
                      >
                        بعدی
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  )
}