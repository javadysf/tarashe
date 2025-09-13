'use client'

import { useState, useEffect } from 'react'
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

  if (user?.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">مدیریت کاربران</h1>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  <tr key={userData._id}>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
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
            
            {users.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                هیچ کاربری یافت نشد
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}