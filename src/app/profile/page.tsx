'use client'

import { useState, useEffect } from 'react'
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: ''
    }
  })

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          postalCode: ''
        }
      })
      fetchOrders()
      fetchLiked()
    } else {
      router.push('/auth/login')
    }
  }, [user, router])

  const fetchOrders = async () => {
    try {
      const response = await api.getOrders({ page: String(ordersPage), limit: '10' })
      setOrders(response.orders || [])
      setOrdersTotalPages(response.pagination?.totalPages || 1)
      setOrdersTotal(response.pagination?.totalOrders || 0)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLiked = async () => {
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
  }

  useEffect(() => {
    if (!user) return
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordersPage])

  useEffect(() => {
    if (!user) return
    fetchLiked()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [likesPage])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.updateProfile(formData)
      setEditMode(false)
      toast.success('✨ پروفایل با موفقیت بروزرسانی شد!', {
        position: 'top-right',
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    } catch (error) {
      toast.error('❌ خطا در بروزرسانی پروفایل', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    try {
      const response = await api.uploadAvatar(file)
      toast.success('✨ تصویر پروفایل با موفقیت بروزرسانی شد!', {
        position: 'top-right',
        autoClose: 2500,
      })
      checkAuth()
    } catch (error: any) {
      toast.error('❌ ' + (error.message || 'خطا در آپلود تصویر'), {
        position: 'top-right',
        autoClose: 3000,
      })
    } finally {
      setUploadingAvatar(false)
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-6 space-x-reverse">
            <div className="relative">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.name.charAt(0)}
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                {uploadingAvatar ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center mt-2">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {user.role === 'admin' ? 'ادمین' : 'کاربر'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 space-x-reverse px-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                اطلاعات شخصی
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                سفارشات من
              </button>
              <button
                onClick={() => setActiveTab('liked')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'liked'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                پسندیده‌ها
              </button>
            </nav>
          </div>

          <div className="p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">اطلاعات شخصی</h2>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editMode ? 'انصراف' : 'ویرایش'}
                  </button>
                </div>

                {editMode ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">نام</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">شماره تماس</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        ذخیره تغییرات
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">نام</h3>
                        <p className="text-gray-600">{user.name}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">ایمیل</h3>
                        <p className="text-gray-600">{user.email}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">شماره تماس</h3>
                        <p className="text-gray-600">{user.phone || 'وارد نشده'}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">نقش</h3>
                        <p className="text-gray-600">{user.role === 'admin' ? 'ادمین' : 'کاربر'}</p>
                      </div>
                    </div>

                    {user.address && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">آدرس</h3>
                        <p className="text-gray-600">
                          {user.address.street && `${user.address.street}, `}
                          {user.address.city && `${user.address.city}, `}
                          {user.address.state && `${user.address.state}, `}
                          {user.address.postalCode && user.address.postalCode}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">سفارشات من</h2>
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">سفارش #{order._id.slice(-6)}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString('fa-IR')}
                            </p>
                          </div>
                          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.product.name}</span>
                              <span>تعداد: {item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">مجموع:</span>
                            <span className="font-bold text-lg text-blue-600">
                              {new Intl.NumberFormat('fa-IR').format(order.totalAmount)} تومان
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">هیچ سفارشی یافت نشد</h3>
                    <p className="text-gray-600">شما هنوز هیچ سفارشی ثبت نکرده‌اید</p>
                  </div>
                )}

                {/* Orders Pagination */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-gray-600">{ordersTotal} سفارش • صفحه {ordersPage} از {ordersTotalPages}</div>
                  <div className="flex items-center gap-2">
                    <button disabled={ordersPage <= 1} onClick={() => setOrdersPage(p => Math.max(1, p - 1))} className={`px-3 py-1 rounded-lg border text-sm ${ordersPage <= 1 ? 'text-gray-300 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>قبلی</button>
                    {Array.from({ length: Math.min(5, ordersTotalPages) }, (_, i) => {
                      const half = 2
                      let start = Math.max(1, ordersPage - half)
                      let end = Math.min(ordersTotalPages, start + 4)
                      if (end - start < 4) start = Math.max(1, end - 4)
                      const pageNum = start + i
                      return pageNum <= ordersTotalPages ? (
                        <button key={pageNum} onClick={() => setOrdersPage(pageNum)} className={`px-3 py-1 rounded-lg text-sm border ${pageNum === ordersPage ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{pageNum}</button>
                      ) : null
                    })}
                    <button disabled={ordersPage >= ordersTotalPages} onClick={() => setOrdersPage(p => Math.min(ordersTotalPages, p + 1))} className={`px-3 py-1 rounded-lg border text-sm ${ordersPage >= ordersTotalPages ? 'text-gray-300 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>بعدی</button>
                  </div>
                </div>
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