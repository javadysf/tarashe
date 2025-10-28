'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { toast } from 'react-toastify'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default function EditCategoryPage({ params }: Props) {
  const { id } = use(params)
  const { user, checkAuth } = useAuthStore()
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null as File | null,
    parent: ''
  })
  const [currentImage, setCurrentImage] = useState('')
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
      
      fetchCategory()
      fetchCategories()
    }
    
    initAuth()
  }, [checkAuth, router, id])

  const fetchCategory = async () => {
    try {
      const category = await api.getCategory(id)
      setFormData({
        name: category.name,
        description: category.description || '',
        image: null,
        parent: category.parent || ''
      })
      setCurrentImage(category.image?.url || '')
    } catch (error: any) {
      toast.error(error.message || 'خطا در بارگذاری دسته بندی')
      router.push('/admin/categories')
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories()
      setCategories(response)
    } catch (error) {
      console.error('Error fetching categories:', error)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('نام دسته بندی الزامی است')
      return
    }

    setLoading(true)
    try {
      let imageData = null
      
      // Upload new image if selected
      if (formData.image) {
        setUploading(true)
        const imageResponse = await api.uploadCategoryImage(formData.image, formData.name)
        imageData = imageResponse.image
        setUploading(false)
      }

      const updateData = {
        name: formData.name,
        description: formData.description,
        parent: formData.parent || undefined,
        ...(imageData && { image: imageData })
      }

      await api.updateCategory(id, updateData)
      toast.success('✅ دسته بندی با موفقیت بهروزرسانی شد!')
      router.push('/admin/categories')
    } catch (error: any) {
      toast.error('❌ ' + (error.message || 'خطا در بهروزرسانی دسته بندی'))
    } finally {
      setLoading(false)
      setUploading(false)
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

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <ArrowRight className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ویرایش دسته بندی
            </h1>
            <p className="text-gray-600 mt-2">ویرایش دسته بندی "{formData.name}"</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">نام دسته بندی *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="نام دسته بندی را وارد کنید"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">والد (اختیاری)</label>
                <select
                  value={formData.parent}
                  onChange={(e) => setFormData(prev => ({ ...prev, parent: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">— بدون والد (دسته اصلی) —</option>
                  {categories
                    .filter(c => !c.parent && c._id !== id)
                    .map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">توضیحات</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="توضیحات اختیاری"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">تصویر دسته بندی</label>
              
              {/* Current Image */}
              {currentImage && !imagePreview && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">تصویر فعلی:</p>
                  <Image
                    src={currentImage}
                    alt="تصویر فعلی"
                    width={120}
                    height={120}
                    className="object-cover rounded-xl border-2 border-gray-200"
                  />
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <label className="cursor-pointer bg-blue-100 hover:bg-blue-200 px-6 py-3 rounded-xl border-2 border-dashed border-blue-300 transition-colors">
                  <span className="text-blue-700 font-medium">
                    {currentImage ? 'تغییر تصویر' : 'انتخاب تصویر'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="sr-only"
                  />
                </label>
                
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="پیشنمایش"
                      className="w-20 h-20 object-cover rounded-xl border-2 border-blue-200"
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

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading || uploading}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                {loading || uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    {uploading ? 'در حال آپلود...' : 'در حال بهروزرسانی...'}
                  </>
                ) : (
                  'بهروزرسانی دسته بندی'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-400 transition-all duration-200"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}