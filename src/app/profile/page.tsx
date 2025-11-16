'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import Image from 'next/image'
import { toast } from 'react-toastify'

interface Order {
  _id: string
  totalAmount: number
  status: string
  createdAt: string
  items: { product: { name: string }; quantity: number }[]
}

export default function ProfilePage() {
  const { user, checkAuth } = useAuthStore()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState<any[]>([])
  const [likedLoading, setLikedLoading] = useState(false)
  const [ordersPage, setOrdersPage] = useState(1)
  const [ordersTotalPages, setOrdersTotalPages] = useState(1)
  const [ordersTotal, setOrdersTotal] = useState(0)
  const [likesPage, setLikesPage] = useState(1)
  const [likesTotalPages, setLikesTotalPages] = useState(1)
  const [likesTotal, setLikesTotal] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    phone: '',
    postalCode: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: ''
    }
  })

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.getOrders({ page: String(ordersPage), limit: '10' })
      setOrders(response.orders || [])
      setOrdersTotalPages(response.pagination?.totalPages || 1)
      setOrdersTotal(response.pagination?.totalOrders || 0)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }, [ordersPage])

  const fetchLiked = useCallback(async () => {
    try {
      setLikedLoading(true)
      const res = await api.getLikedProducts({ page: String(likesPage), limit: '10' })
      setLiked(res.products || [])
      setLikesTotalPages(res.pagination?.totalPages || 1)
      setLikesTotal(res.pagination?.totalProducts || 0)
    } catch (e) {
      // silent
    } finally {
      setLikedLoading(false)
    }
  }, [likesPage])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        postalCode: user.postalCode || '',
        address: {
          street: user.address?.street ?? '',
          city: user.address?.city ?? '',
          state: user.address?.state ?? '',
          postalCode: user.address?.postalCode ?? ''
        }
      })
      fetchOrders()
      fetchLiked()
    } else {
      router.push('/auth/login')
    }
  }, [fetchOrders, fetchLiked, router, user])

  useEffect(() => {
    if (!user) return
    fetchLiked()
  }, [fetchLiked, user])

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      confirmed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      processing: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      shipped: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300',
      delivered: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Don't send phone in update request - it's not allowed to be changed
      const { phone, ...updateData } = formData
      await api.updateProfile(updateData)
      setEditMode(false)
      // Refresh user data to get updated information
      await checkAuth()
      toast.success('✨ پروفایل با موفقیت بروزرسانی شد!', {
        position: 'top-right',
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    } catch (error: any) {
      console.error('Update profile error:', error)
      toast.error('❌ ' + (error.message || 'خطا در بروزرسانی پروفایل'), {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  }



  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Card with Gradient */}
        <div className="relative bg-blue-200 rounded-3xl shadow-2xl p-8 mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="flex-1 text-center sm:text-right">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-2 drop-shadow-lg">
                {user.name} {user.lastName || ''}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                <svg className="w-5 h-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                <p className="text-white/90 text-lg">{user.email}</p>
            </div>
              <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                <span className={`inline-flex items-center px-4 py-2 text-sm font-bold rounded-full shadow-lg ${
                  user.role === 'admin' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-green-500 text-white'
                }`}>
                  {user.role === 'admin' ? '👑 ادمین' : '👤 کاربر'}
                </span>
                {user.phoneVerified && (
                  <span className="inline-flex items-center px-4 py-2 text-sm font-bold rounded-full bg-white/20 backdrop-blur-sm text-white shadow-lg">
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    ✓ تایید شده
                  </span>
                )}
                {user.phone && (
                  <span className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full bg-white/20 backdrop-blur-sm text-white">
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {user.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
          <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
            <nav className="flex space-x-8 space-x-reverse px-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-5 px-4 border-b-3 font-semibold text-sm transition-all duration-300 relative ${
                  activeTab === 'profile'
                    ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                اطلاعات شخصی
                </span>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-5 px-4 border-b-3 font-semibold text-sm transition-all duration-300 relative ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                سفارشات من
                </span>
              </button>
              <button
                onClick={() => setActiveTab('liked')}
                className={`py-5 px-4 border-b-3 font-semibold text-sm transition-all duration-300 relative ${
                  activeTab === 'liked'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                پسندیده‌ها
                </span>
              </button>
            </nav>
          </div>

          <div className="p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {!editMode ? (
                  /* ID Card Design - Compact */
                  <div className="max-w-2xl mx-auto">
                    <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden transform hover:scale-[1.01] transition-all duration-300">
                      {/* Decorative Background Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16"></div>
                      </div>
                      
                      {/* Card Content */}
                      <div className="relative p-6">
                        {/* Header Section */}
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/20">
                          <div>
                            <h2 className="text-lg font-bold text-white">کارت شناسایی کاربر</h2>
                            <p className="text-white/70 text-xs">Identity Card</p>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/30">
                            <p className="text-white/60 text-[10px] mb-0.5">شماره عضویت</p>
                            <p className="text-white font-bold text-sm font-mono">{user.id.slice(-8).toUpperCase()}</p>
                          </div>
                        </div>

                        {/* Main Info Grid - Compact */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {/* Name */}
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-white/80 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <div className="min-w-0 flex-1">
                                <p className="text-white/60 text-[10px] mb-0.5">نام</p>
                                <p className="text-white font-bold text-sm truncate">{user.name} {user.lastName || ''}</p>
                              </div>
                            </div>
                          </div>

                          {/* Email */}
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-white/80 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <div className="min-w-0 flex-1">
                                <p className="text-white/60 text-[10px] mb-0.5">ایمیل</p>
                                <p className="text-white font-semibold text-xs truncate">{user.email}</p>
                              </div>
                            </div>
                          </div>

                          {/* Phone */}
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-white/80 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <div className="min-w-0 flex-1">
                                <p className="text-white/60 text-[10px] mb-0.5">تماس</p>
                                <div className="flex items-center gap-1.5">
                                  <p className="text-white font-bold text-sm">{user.phone || 'وارد نشده'}</p>
                                  {user.phoneVerified && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
                                      <svg className="w-2.5 h-2.5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      ✓
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Role */}
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-white/80 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              <div className="min-w-0 flex-1">
                                <p className="text-white/60 text-[10px] mb-0.5">نقش</p>
                                <p className="text-white font-bold text-sm">{user.role === 'admin' ? '👑 ادمین' : '👤 کاربر'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Address Section - Compact */}
                        {(user.address && (user.address.street || user.address.city || user.address.state || user.address.postalCode)) && (
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 mb-3">
                            <div className="flex items-start gap-2">
                              <svg className="w-4 h-4 text-white/80 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <div className="min-w-0 flex-1">
                                <p className="text-white/60 text-[10px] mb-1">آدرس</p>
                                <p className="text-white font-semibold text-xs leading-relaxed">
                                  {user.address.street && `${user.address.street}, `}
                                  {user.address.city && `${user.address.city}, `}
                                  {user.address.state && `${user.address.state}`}
                                  {user.address.postalCode && ` - ${user.address.postalCode}`}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Additional Info - Compact */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          {user.postalCode && (
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                              <p className="text-white/60 text-[10px] mb-0.5">کد پستی</p>
                              <p className="text-white font-bold text-xs">{user.postalCode}</p>
                            </div>
                          )}
                          {user.createdAt && (
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                              <p className="text-white/60 text-[10px] mb-0.5">عضویت</p>
                              <p className="text-white font-bold text-xs">
                                {new Date(user.createdAt).toLocaleDateString('fa-IR', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Footer with Edit Button - Compact */}
                        <div className="pt-3 border-t border-white/20 flex justify-center">
                          <button
                            onClick={() => setEditMode(true)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            ویرایش
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Edit Mode */
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ویرایش اطلاعات شخصی
                      </h2>
                  <button
                        onClick={() => setEditMode(false)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 bg-gray-500 hover:bg-gray-600 text-white"
                  >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        انصراف
                  </button>
                </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نام</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نام خانوادگی</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          شماره تماس
                          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">(غیرقابل تغییر)</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">کد پستی</label>
                        <input
                          type="text"
                          value={formData.postalCode}
                          onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                          maxLength={10}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="1234567890"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">آدرس</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">خیابان</label>
                          <input
                            type="text"
                            value={formData.address.street}
                            onChange={(e) => setFormData({
                              ...formData, 
                              address: {...formData.address, street: e.target.value}
                            })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">شهر</label>
                          <input
                            type="text"
                            value={formData.address.city}
                            onChange={(e) => setFormData({
                              ...formData, 
                              address: {...formData.address, city: e.target.value}
                            })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">استان</label>
                          <input
                            type="text"
                            value={formData.address.state}
                            onChange={(e) => setFormData({
                              ...formData, 
                              address: {...formData.address, state: e.target.value}
                            })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">کد پستی</label>
                          <input
                            type="text"
                            value={formData.address.postalCode}
                            onChange={(e) => setFormData({
                              ...formData, 
                              address: {...formData.address, postalCode: e.target.value}
                            })}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        ذخیره تغییرات
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditMode(false)}
                        className="flex items-center gap-2 bg-gray-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        انصراف
                      </button>
                    </div>
                  </form>
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">سفارشات من</h2>
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">سفارش #{order._id.slice(-6)}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                            </p>
                          </div>
                          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                       
                        <div className="space-y-2 mb-4">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                              <span>{item?.product?.name}</span>
                              <span>تعداد: {item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-900 dark:text-gray-100">مجموع:</span>
                            <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                              {new Intl.NumberFormat('fa-IR').format(order.totalAmount)} تومان
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 dark:text-gray-500 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">هیچ سفارشی یافت نشد</h3>
                    <p className="text-gray-600 dark:text-gray-400">شما هنوز هیچ سفارشی ثبت نکرده‌اید</p>
                  </div>
                )}

                {/* Orders Pagination */}
                {ordersTotalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">{ordersTotal} سفارش • صفحه {ordersPage} از {ordersTotalPages}</div>
                    <div className="flex items-center gap-2">
                      <button disabled={ordersPage <= 1} onClick={() => setOrdersPage(p => Math.max(1, p - 1))} className={`px-3 py-1 rounded-lg border text-sm ${ordersPage <= 1 ? 'text-gray-300 dark:text-gray-600 border-gray-200 dark:border-gray-700' : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>قبلی</button>
                      {Array.from({ length: Math.min(5, ordersTotalPages) }, (_, i) => {
                        const half = 2
                        let start = Math.max(1, ordersPage - half)
                        let end = Math.min(ordersTotalPages, start + 4)
                        if (end - start < 4) start = Math.max(1, end - 4)
                        const pageNum = start + i
                        return pageNum <= ordersTotalPages ? (
                          <button key={pageNum} onClick={() => setOrdersPage(pageNum)} className={`px-3 py-1 rounded-lg text-sm border ${pageNum === ordersPage ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>{pageNum}</button>
                        ) : null
                      })}
                      <button disabled={ordersPage >= ordersTotalPages} onClick={() => setOrdersPage(p => Math.min(ordersTotalPages, p + 1))} className={`px-3 py-1 rounded-lg border text-sm ${ordersPage >= ordersTotalPages ? 'text-gray-300 dark:text-gray-600 border-gray-200 dark:border-gray-700' : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>بعدی</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'liked' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">محصولات پسندیده</h2>
                {likedLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : liked.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {liked.map((p) => (
                      <div key={p._id} className="border border-gray-200 rounded-lg p-4 flex items-center gap-4">
                        <Image src={p.images?.[0]?.url || '/pics/battery.jpg'} alt={p.name} width={64} height={64} className="rounded object-cover" />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 line-clamp-1">{p.name}</div>
                          <div className="text-sm text-gray-600 mt-1">{new Intl.NumberFormat('fa-IR').format(p.price)} تومان</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-600">محصولی پسندیده نشده است</div>
                )}

                {/* Likes Pagination */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-gray-600">{likesTotal} محصول • صفحه {likesPage} از {likesTotalPages}</div>
                  <div className="flex items-center gap-2">
                    <button disabled={likesPage <= 1} onClick={() => setLikesPage(p => Math.max(1, p - 1))} className={`px-3 py-1 rounded-lg border text-sm ${likesPage <= 1 ? 'text-gray-300 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>قبلی</button>
                    {Array.from({ length: Math.min(5, likesTotalPages) }, (_, i) => {
                      const half = 2
                      let start = Math.max(1, likesPage - half)
                      let end = Math.min(likesTotalPages, start + 4)
                      if (end - start < 4) start = Math.max(1, end - 4)
                      const pageNum = start + i
                      return pageNum <= likesTotalPages ? (
                        <button key={pageNum} onClick={() => setLikesPage(pageNum)} className={`px-3 py-1 rounded-lg text-sm border ${pageNum === likesPage ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{pageNum}</button>
                      ) : null
                    })}
                    <button disabled={likesPage >= likesTotalPages} onClick={() => setLikesPage(p => Math.min(likesTotalPages, p + 1))} className={`px-3 py-1 rounded-lg border text-sm ${likesPage >= likesTotalPages ? 'text-gray-300 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>بعدی</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}