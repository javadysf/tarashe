'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { toast } from 'react-toastify'

export default function AddProductPage() {
  const { user, token, checkAuth } = useAuthStore()
  const router = useRouter()

  // Check authentication on component mount
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth()
      const currentUser = useAuthStore.getState().user
      
      if (!currentUser || currentUser.role !== 'admin') {
        toast.error('❌ دسترسی غیرمجاز - لطفاً به عنوان ادمین وارد شوید')
        router.push('/auth/login')
      }
    }
    
    initAuth()
  }, [checkAuth, router])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [formData, setFormData] = useState<{
    name: string
    description: string
    price: string
    originalPrice: string
    category: string
    brand: string
    model: string
    stock: string
    images: Array<{
      url: string
      alt: string
      isUploading?: boolean
      previewId?: string
      public_id?: string
    }>
  }>({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    brand: '',
    model: '',
    stock: '',
    images: []
  })

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchCategories()
    }
  }, [user])

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories()
      setCategories(response)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const productData = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        stock: Number(formData.stock)
      }

      await api.createProduct(productData)
      toast.success('✨ محصول با موفقیت ایجاد شد!', {
        position: 'top-right',
        autoClose: 2000,
      })
      router.push('/admin/products')
    } catch (error: any) {
      toast.error('❌ ' + (error.message || 'خطا در ایجاد محصول'), {
        position: 'top-right',
        autoClose: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    console.log('Files selected:', files.length)
    
    if (files.length === 0) return

    // Check if user is logged in and is admin
    if (!user || user.role !== 'admin') {
      toast.error('❌ شما باید به عنوان ادمین وارد شوید')
      router.push('/auth/login')
      return
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB
      
      if (!isValidType) {
        toast.error(`فایل ${file.name} نوع مجاز نیست`)
        return false
      }
      if (!isValidSize) {
        toast.error(`فایل ${file.name} بیش از 5MB است`)
        return false
      }
      return true
    })

    console.log('Valid files:', validFiles.length)
    if (validFiles.length === 0) return

    // Show preview immediately
    const previews = validFiles.map((file, index) => {
      const previewUrl = URL.createObjectURL(file)
      console.log('Created preview URL:', previewUrl)
      return {
        url: previewUrl,
        alt: file.name,
        isUploading: true,
        previewId: `preview_${Date.now()}_${index}`
      }
    })
    
    console.log('Setting previews:', previews)
    setFormData(prev => {
      const newData = {
        ...prev,
        images: [...prev.images, ...previews]
      }
      console.log('New formData images:', newData.images)
      return newData
    })

    setUploadingImages(true)
    
    try {
      console.log('Starting upload...')
      const response = await api.uploadProductImages(validFiles, formData.name || 'محصول')
      console.log('Upload response:', response)
      
      // Replace preview images with uploaded URLs
      setFormData(prev => ({
        ...prev,
        images: [
          ...prev.images.filter(img => !img.isUploading),
          ...response.images
        ]
      }))
      
      // Clean up preview URLs
      previews.forEach(preview => {
        if (preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url)
        }
      })
      
      toast.success(`✅ ${validFiles.length} تصویر با موفقیت آپلود شد!`)
    } catch (error: any) {
      console.error('Upload error:', error)
      
      // Remove preview images on error
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(img => !img.isUploading)
      }))
      
      // Clean up preview URLs
      previews.forEach(preview => {
        if (preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url)
        }
      })
      
      
      toast.error('❌ ' + (error.message || 'خطا در آپلود تصاویر'))
    } finally {
      setUploadingImages(false)
      // Reset file input
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    
    try {
      const response = await api.createCategory({ name: newCategoryName })
      setCategories([...categories, response.category])
      setFormData({...formData, category: response.category._id})
      setNewCategoryName('')
      setShowNewCategory(false)
      toast.success('دستهبندی جدید ایجاد شد!')
    } catch (error: any) {
      toast.error(error.message || 'خطا در ایجاد دستهبندی')
    }
  }

  const removeImage = (index: number) => {
    const imageToRemove = formData.images[index]
    
    // Clean up preview URL if it's a local preview
    if (imageToRemove?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url)
    }
    
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    
    toast.info('🗑️ تصویر حذف شد')
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            افزودن محصول جدید
          </h1>
          <p className="text-gray-600">اطلاعات محصول خود را وارد کنید</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 space-y-8">
          {/* Basic Info Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              اطلاعات پایه
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">نام محصول *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70"
                  placeholder="نام محصول را وارد کنید"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">توضیحات *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 resize-none"
                  placeholder="توضیحات کامل محصول را بنویسید"
                />
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              قیمت گذاری
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">قیمت فروش (تومان) *</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/70 pl-16"
                    placeholder="0"
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">تومان</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">قیمت اصلی (اختیاری)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/70 pl-16"
                    placeholder="0"
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">تومان</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category & Details Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              دستهبندی و جزئیات
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">دستهبندی *</label>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(!showNewCategory)}
                    className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    دستهبندی جدید
                  </button>
                </div>
                
                {showNewCategory && (
                  <div className="mb-4 p-4 bg-white/60 rounded-lg border border-purple-200">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="نام دستهبندی جدید"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium"
                      >
                        ایجاد
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewCategory(false)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all duration-200 font-medium"
                      >
                        انصراف
                      </button>
                    </div>
                  </div>
                )}
                
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/70"
                >
                  <option value="">انتخاب دستهبندی</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">برند *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/70"
                    placeholder="نام برند"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">مدل</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/70"
                    placeholder="مدل محصول"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">موجودی *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/70"
                    placeholder="تعداد"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Images Upload Section */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
            <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              تصاویر محصول
            </h3>
            
            <div className="border-2 border-dashed border-orange-200 rounded-xl p-8 bg-white/50 hover:bg-white/70 transition-all duration-200">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <div className="mb-4">
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl">
                      {uploadingImages ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          در حال آپلود...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          انتخاب تصاویر
                        </>
                      )}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImages}
                      className="sr-only"
                      id="image-upload"
                    />
                  </label>
                </div>
                
                <p className="text-sm text-gray-600">حداکثر 20 تصویر • JPG, PNG, WEBP</p>
                
                {/* Debug buttons */}
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Current user:', user)
                      console.log('Current token:', token)
                      console.log('Images count:', formData.images.length)
                    }}
                    className="text-xs bg-gray-200 px-3 py-1 rounded"
                  >
                    تست اطلاعات
                  </button>
                  
                  {!user && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await useAuthStore.getState().login('admin@tarashe.com', 'admin123')
                          toast.success('✅ ورود موفق')
                        } catch (error: any) {
                          toast.error('❌ ' + error.message)
                        }
                      }}
                      className="text-xs bg-blue-200 px-3 py-1 rounded"
                    >
                      ورود سریع ادمین
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Enhanced Image Preview */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  تصاویر ({formData.images.length})
                </h4>
                {formData.images.length > 0 && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    کلیک برای مشاهده کامل
                  </span>
                )}
              </div>
              
              {formData.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-80 overflow-y-auto p-4 bg-white/60 rounded-xl border border-orange-100">
                  {formData.images.map((image, index) => (
                    <div key={`${image.previewId || index}`} className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 group-hover:border-orange-300 transition-all duration-200">
                        <img
                          src={image.url}
                          alt={image.alt || `تصویر ${index + 1}`}
                          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 cursor-pointer ${
                            image.isUploading ? 'opacity-50' : ''
                          }`}
                          onClick={() => !image.isUploading && window.open(image.url, '_blank')}
                          title={image.isUploading ? 'در حال آپلود...' : 'کلیک برای مشاهده کامل'}
                          onError={(e) => {
                            console.error('Image load error:', image.url)
                            e.currentTarget.src = '/pics/battery.jpg'
                          }}
                        />
                        
                        {image.isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                            <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"></div>
                          </div>
                        )}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        disabled={image.isUploading}
                        className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:from-red-600 hover:to-pink-600 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg disabled:opacity-30"
                        title="حذف تصویر"
                      >
                        ×
                      </button>
                      
                      <div className="absolute bottom-2 left-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-xs px-2 py-1 rounded-full font-medium">
                        {index + 1}
                      </div>
                      
                      {image.isUploading && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                          آپلود...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>هنوز تصویری انتخاب نشده</p>
                  <p className="text-sm mt-1">تصاویر انتخاب شده اینجا نمایش داده میشوند</p>
                  <p className="text-xs mt-2 text-blue-600">تعداد تصاویر: {formData.images.length}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading || uploadingImages}
              className="flex-1 inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  در حال ایجاد...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ایجاد محصول
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 border border-gray-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}