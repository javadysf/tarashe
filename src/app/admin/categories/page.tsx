'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { toast } from 'react-toastify'
import Image from 'next/image'
import { Edit, Trash2, Plus, Eye, Search } from 'lucide-react'

export default function CategoriesPage() {
  const { user, checkAuth } = useAuthStore()
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [filteredCategories, setFilteredCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null as File | null,
    parent: ''
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
      
      fetchCategories()
    }
    
    initAuth()
  }, [checkAuth, router])

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories()
      setCategories(response)
      setFilteredCategories(response)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('خطا در دریافت دسته بندیها')
    } finally {
      setLoading(false)
    }
  }

  // Filter categories based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(categories)
      return
    }

    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredCategories(filtered)
  }, [searchTerm, categories])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('نام دسته بندی الزامی است')
      return
    }
    
    if (!formData.image) {
      toast.error('تصویر دسته بندی الزامی است')
      return
    }

    setUploading(true)
    try {
      const imageResponse = await api.uploadCategoryImage(formData.image, formData.name)
      
      // Show warning if image was saved locally
      if (imageResponse.warning) {
        toast.warning(`⚠️ ${imageResponse.warning}`, {
          position: 'top-right',
          autoClose: 6000,
        })
      }
      
      const response = await api.createCategory({
        name: formData.name,
        description: formData.description,
        image: imageResponse.image,
        parent: formData.parent || undefined
      })

      setCategories([...categories, response.category])
      setFormData({ name: '', description: '', image: null, parent: '' })
      setImagePreview('')
      setShowAddForm(false)
      
      toast.success('✅ دسته بندی با موفقیت ایجاد شد!')
    } catch (error: any) {
      console.error('Error creating category:', error)
      
      let errorMessage = 'خطا در ایجاد دسته بندی'
      
      // Extract error message from different possible error structures
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.map((e: any) => e.message || e.msg).join('. ')
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      toast.error(`❌ ${errorMessage}`, {
        autoClose: 6000,
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`آیا مطمئن هستید که میخواهید دسته بندی "${name}" را حذف کنید؟`)) {
      return
    }

    setDeleting(id)
    try {
      await api.deleteCategory(id)
      setCategories(categories.filter(cat => cat._id !== id))
      toast.success('✅ دسته بندی با موفقیت حذف شد')
    } catch (error: any) {
      let errorMessage = 'خطا در حذف دسته بندی'
      
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">دسترسی غیرمجاز</h1>
          <p className="text-gray-600 mb-4">شما باید به عنوان ادمین وارد شوید</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
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
              مدیریت دسته بندیها
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">مدیریت دسته بندیهای محصولات ({filteredCategories.length} از {categories.length} دسته)</p>
          </div>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            افزودن دسته بندی
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">افزودن دسته بندی جدید</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">نام دسته بندی *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                    placeholder="نام دسته بندی را وارد کنید"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">والد (اختیاری)</label>
                  <select
                    value={formData.parent}
                    onChange={(e) => setFormData(prev => ({ ...prev, parent: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">— بدون والد (دسته اصلی) —</option>
                    {categories
                      .filter(c => !c.parent)
                      .map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">توضیحات</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
                  placeholder="توضیحات اختیاری"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">تصویر دسته بندی *</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-blue-100 hover:bg-blue-200 px-6 py-3 rounded-xl border-2 border-dashed border-blue-300 transition-colors">
                    <span className="text-blue-700 font-medium">انتخاب تصویر</span>
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
                        className="w-20 h-20 object-cover rounded-xl border-2 border-blue-200"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, image: null }))
                          setImagePreview('')
                          URL.revokeObjectURL(imagePreview)
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
                      در حال ایجاد...
                    </>
                  ) : (
                    'ایجاد دسته بندی'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setFormData({ name: '', description: '', image: null, parent: '' })
                    if (imagePreview) {
                      URL.revokeObjectURL(imagePreview)
                      setImagePreview('')
                    }
                  }}
                  className="bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-400 transition-all duration-200"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">لیست دسته بندیها</h2>
            
            {/* Search Bar */}
            <div className="relative max-w-md w-full sm:w-auto">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="جستجو در دسته‌بندی‌ها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pr-10 pl-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 dark:border-blue-400 border-t-transparent mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">در حال بارگذاری...</p>
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filteredCategories.map((category) => (
                <div key={category._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center p-3">
                    {category.image?.url ? (
                      <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-600 flex items-center justify-center">
                        <Image
                          src={category.image.url}
                          alt={category.image.alt || category.name}
                          width={150}
                          height={150}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-gray-400 dark:text-gray-300 text-xs text-center px-2">{category.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-2">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1 line-clamp-1" title={category.name}>{category.name}</h3>
                    
                    <div className="flex flex-col gap-1.5 mb-2">
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          onClick={() => router.push(`/admin/categories/${category._id}/attributes`)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-1 py-1 rounded text-xs font-medium transition-colors flex items-center justify-center"
                          title="ویژگی‌ها"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        
                        <button
                          onClick={() => router.push(`/admin/categories/edit/${category._id}`)}
                          className="bg-green-500 hover:bg-green-600 text-white px-1 py-1 rounded text-xs font-medium transition-colors flex items-center justify-center"
                          title="ویرایش"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(category._id, category.name)}
                          disabled={deleting === category._id}
                          className="bg-red-500 hover:bg-red-600 text-white px-1 py-1 rounded text-xs font-medium transition-colors flex items-center justify-center disabled:opacity-50"
                          title="حذف"
                        >
                          {deleting === category._id ? (
                            <div className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-1.5 py-0.5 rounded text-center block">فعال</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">نتیجه‌ای یافت نشد</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">برای &quot;{searchTerm}&quot; دسته‌بندی‌ای یافت نشد</p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm"
              >
                پاک کردن جستجو
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">هیچ دسته بندی یافت نشد</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">اولین دسته بندی خود را ایجاد کنید</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                افزودن دسته بندی
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}