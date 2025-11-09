'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'

interface User {
  _id: string
  name: string
  lastName?: string
  email: string
  phone?: string
  role: string
  isActive: boolean
  createdAt: string
  address?: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
  }
  postalCode?: string
}

export default function AdminUsersPage() {
  const { user } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

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
      // Refresh users list to get updated data
      await fetchUsers()
      // Update selected user if modal is open
      if (selectedUser && selectedUser._id === userId) {
        const updatedUsers = await api.getUsers()
        const updatedUser = updatedUsers.users?.find((u: User) => u._id === userId)
        if (updatedUser) {
          setSelectedUser(updatedUser)
        }
      }
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
    // Set user immediately for better UX
    setSelectedUser(u)
    // Fetch fresh user data in background to ensure it's up to date
    try {
      const freshUsers = await api.getUsers()
      const updatedUser = freshUsers.users?.find((user: User) => user._id === u._id)
      if (updatedUser) {
        setSelectedUser(updatedUser)
      }
    } catch (error) {
      // Keep using cached user if fetch fails
      console.error('Error fetching fresh user data:', error)
    }
  }

  const closeUserModal = () => {
    setSelectedUser(null)
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نام و نام خانوادگی</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ایمیل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">شماره تماس</th>
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
                      {userData.name} {userData.lastName || ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userData.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userData.phone || '-'}
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
              <div><span className="text-gray-500">نام خانوادگی:</span> <span className="font-medium">{selectedUser.lastName || '-'}</span></div>
              <div><span className="text-gray-500">ایمیل:</span> <span className="font-medium">{selectedUser.email}</span></div>
              <div><span className="text-gray-500">شماره تماس:</span> <span className="font-medium">{selectedUser.phone || '-'}</span></div>
              <div><span className="text-gray-500">نقش:</span> <span className="font-medium">{selectedUser.role === 'admin' ? 'ادمین' : 'کاربر'}</span></div>
              <div><span className="text-gray-500">وضعیت:</span> <span className={`font-medium ${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>{selectedUser.isActive ? 'فعال' : 'غیرفعال'}</span></div>
              <div><span className="text-gray-500">تاریخ عضویت:</span> <span className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString('fa-IR')}</span></div>
              {selectedUser.postalCode && (
                <div><span className="text-gray-500">کد پستی:</span> <span className="font-medium">{selectedUser.postalCode}</span></div>
              )}
            </div>
            {selectedUser.address && (selectedUser.address.street || selectedUser.address.city || selectedUser.address.state) && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">آدرس</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {selectedUser.address.street && <p>خیابان: {selectedUser.address.street}</p>}
                  {selectedUser.address.city && <p>شهر: {selectedUser.address.city}</p>}
                  {selectedUser.address.state && <p>استان: {selectedUser.address.state}</p>}
                  {selectedUser.address.postalCode && <p>کد پستی: {selectedUser.address.postalCode}</p>}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  )
}