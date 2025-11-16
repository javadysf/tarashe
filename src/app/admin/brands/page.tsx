'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { toast } from 'react-toastify'
import Image from 'next/image'
import { Edit, Trash2, Plus } from 'lucide-react'

export default function BrandsPage() {
  const { user, checkAuth } = useAuthStore()
  const router = useRouter()
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingBrand, setEditingBrand] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null as File | null,
  })
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth()
      const currentUser = useAuthStore.getState().user
      
      if (!currentUser || currentUser.role !== 'admin') {
        toast.error('❌ دسترسی غیرمجاز')
        router.push('/auth/login')
        return
      }
      
      fetchBrands()
    }
    
    initAuth()
  }, [checkAuth, router])

  const fetchBrands = async () => {
    try {
      const response = await api.getBrands()
      setBrands(response)
    } catch (error) {
      console.error('Error fetching brands:', error)
      toast.error('خطا در دریافت برندها')
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('فقط فایلهای تصویری مجاز هستند')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم فایل باید کمتر از 5MB باشد')
        return
      }
      setFormData(prev => ({ ...prev, image: file }))
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', image: null })
    setImagePreview('')
    setShowAddForm(false)
    setEditingBrand(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
  }

  const handleEdit = (brand: any) => {
    setEditingBrand(brand._id)
    setFormData({
      name: brand.name,
      description: brand.description || '',
      image: null,
    })
    setImagePreview(brand.image?.url || '')
    setShowAddForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('نام برند الزامی است')
      return
    }
    
    if (!editingBrand && !formData.image) {
      toast.error('تصویر برند الزامی است')
      return
    }

    setUploading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      if (formData.description) {
        formDataToSend.append('description', formData.description)
      }
      if (formData.image) {
        formDataToSend.append('image', formData.image)
      }

      if (editingBrand) {
        const response = await api.updateBrand(editingBrand, formDataToSend)
        setBrands(brands.map(b => b._id === editingBrand ? response.brand : b))
        toast.success('✅ برند با موفقیت به‌روزرسانی شد!')
      } else {
        const response = await api.createBrand(formDataToSend)
        setBrands([...brands, response.brand])
        toast.success('✅ برند با موفقیت ایجاد شد!')
      }

      resetForm()
    } catch (error: any) {
      toast.error('❌ ' + (error.message || 'خطا در ذخیره برند'))
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`آیا مطمئن هستید که می‌خواهید برند "${name}" را حذف کنید؟`)) {
      return
    }

    setDeleting(id)
    try {
      await api.deleteBrand(id)
      setBrands(brands.filter(b => b._id !== id))
      toast.success('✅ برند با موفقیت حذف شد')
    } catch (error: any) {
      let errorMessage = 'خطا در حذف برند'
      
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      toast.error(`❌ ${errorMessage}`, {
        autoClose: 5000,
      })
    } finally {
      setDeleting(null)
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">دسترسی غیرمجاز</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">شما باید به عنوان ادمین وارد شوید</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ورود
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              مدیریت برندها
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">مدیریت برندهای محصولات ({brands.length} برند)</p>
          </div>
          
          <button
            onClick={() => {
              resetForm()
              setShowAddForm(true)
            }}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            افزودن برند
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {editingBrand ? 'ویرایش برند' : 'افزودن برند جدید'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">نام برند *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                  placeholder="نام برند را وارد کنید"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">توضیحات</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                  placeholder="توضیحات اختیاری"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  تصویر برند {!editingBrand && '*'}
                </label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 px-6 py-3 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-600 transition-colors">
                    <span className="text-blue-700 dark:text-blue-300 font-medium">انتخاب تصویر</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="sr-only"
                    />
                  </label>
                  
                  {imagePreview && (
                    <div className="relative">
                      <Image
                        src={imagePreview}
                        alt="پیشنمایش"
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-xl border-2 border-blue-200 dark:border-blue-600"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, image: null }))
                          if (imagePreview.startsWith('blob:')) {
                            URL.revokeObjectURL(imagePreview)
                          }
                          setImagePreview('')
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      {editingBrand ? 'در حال به‌روزرسانی...' : 'در حال ایجاد...'}
                    </>
                  ) : (
                    editingBrand ? 'به‌روزرسانی برند' : 'ایجاد برند'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all duration-200"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Brands List */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">لیست برندها</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 dark:border-blue-400 border-t-transparent mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">در حال بارگذاری...</p>
            </div>
          ) : brands.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {brands.map((brand) => (
                <div key={brand._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow duration-200">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700">
                    {brand.image?.url ? (
                      <Image
                        src={brand.image.url}
                        alt={brand.image.alt || brand.name}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-gray-400 dark:text-gray-300 text-sm">{brand.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">{brand.name}</h3>
                    {brand.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{brand.description}</p>
                    )}
                    
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => handleEdit(brand)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        ویرایش
                      </button>
                      
                      <button
                        onClick={() => handleDelete(brand._id, brand.name)}
                        disabled={deleting === brand._id}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {deleting === brand._id ? (
                          <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        حذف
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">فعال</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">هیچ برندی یافت نشد</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">اولین برند خود را ایجاد کنید</p>
              <button
                onClick={() => {
                  resetForm()
                  setShowAddForm(true)
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                افزودن برند
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

