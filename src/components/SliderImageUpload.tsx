'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { getApiUrl } from '@/lib/config'

interface SliderImageUploadProps {
  onImageChange: (imageUrl: string) => void
  currentImage?: string
}

export default function SliderImageUpload({ onImageChange, currentImage }: SliderImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (currentImage) {
      setPreview(currentImage)
      setImageUrl(currentImage)
    }
  }, [currentImage])

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      setPreview(imageUrl)
      onImageChange(imageUrl)
      setError(null)
    } else {
      setError('لطفاً URL را وارد کنید')
    }
  }

  const refreshToken = async (refreshTokenValue: string): Promise<string | null> => {
    try {
      const res = await fetch(getApiUrl('/auth/refresh'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.accessToken) {
          localStorage.setItem('token', data.accessToken)
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken)
          }
          return data.accessToken
        }
      }
      return null
    } catch (error) {
      console.error('Token refresh error:', error)
      return null
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    if (!file.type.startsWith('image/')) {
      setError('فقط فایل‌های تصویری مجاز هستند')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم فایل باید حداکثر ۵ مگابایت باشد')
      return
    }

    // نمایش پیش‌نمایش محلی بلافاصله
    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)

    let token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      setError('توکن احراز هویت یافت نشد (لطفاً دوباره وارد شوید)')
      URL.revokeObjectURL(localPreview)
      setPreview(null)
      return
    }

    const formData = new FormData()
    formData.append('image', file)
    formData.append('folder', 'sliders')

    setUploading(true)
    try {
      let res = await fetch(getApiUrl('/upload'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      // اگر توکن منقضی شده، سعی کن refresh کنی
      if (res.status === 401) {
        const errorData = await res.json().catch(() => ({}))
        const isTokenExpired = errorData.code === 'TOKEN_EXPIRED' || errorData.message?.includes('منقضی')
        
        if (isTokenExpired) {
          const refreshTokenValue = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null
          if (refreshTokenValue) {
            const newToken = await refreshToken(refreshTokenValue)
            if (newToken) {
              // دوباره درخواست رو با توکن جدید بفرست
              token = newToken
              res = await fetch(getApiUrl('/upload'), {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: formData,
              })
            } else {
              // Refresh token هم منقضی شده یا نامعتبر است
              setError('توکن منقضی شده است. لطفاً دوباره وارد شوید')
              URL.revokeObjectURL(localPreview)
              setPreview(null)
              // هدایت به صفحه لاگین
              if (typeof window !== 'undefined') {
                window.location.href = '/login'
              }
              return
            }
          } else {
            setError('توکن منقضی شده است. لطفاً دوباره وارد شوید')
            URL.revokeObjectURL(localPreview)
            setPreview(null)
            if (typeof window !== 'undefined') {
              window.location.href = '/login'
            }
            return
          }
        }
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'خطا در آپلود تصویر')
      }

      const data = await res.json()
      const uploadedUrl = data.imageUrl as string

      if (!uploadedUrl) {
        throw new Error('آدرس تصویر از سرور دریافت نشد')
      }

      // پاک کردن پیش‌نمایش محلی
      URL.revokeObjectURL(localPreview)
      setPreview(uploadedUrl)
      setImageUrl(uploadedUrl)
      onImageChange(uploadedUrl)
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'خطا در آپلود تصویر')
      URL.revokeObjectURL(localPreview)
      setPreview(null)
    } finally {
      setUploading(false)
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  const handleRemoveImage = () => {
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview)
    }
    setPreview(null)
    setImageUrl('')
    onImageChange('')
  }

  const getImageSrc = () => {
    if (!preview) return null
    if (preview.startsWith('http') || preview.startsWith('blob:')) {
      return preview
    }
    return preview
  }

  return (
    <div className="space-y-4">
      {/* روش آپلود */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
        <button
          type="button"
          onClick={() => setUploadMethod('url')}
          className={`px-4 py-2 font-medium transition-colors ${
            uploadMethod === 'url'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          استفاده از URL
        </button>
        <button
          type="button"
          onClick={() => setUploadMethod('file')}
          className={`px-4 py-2 font-medium transition-colors ${
            uploadMethod === 'file'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          آپلود فایل
        </button>
      </div>

      {/* فرم URL */}
      {uploadMethod === 'url' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL تصویر
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleUrlSubmit()
                  }
                }}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="https://example.com/image.jpg"
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                اعمال
              </button>
            </div>
          </div>
        </div>
      )}

      {/* آپلود فایل */}
      {uploadMethod === 'file' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            انتخاب فایل
          </label>
          <label className="inline-flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer">
            {uploading ? 'در حال آپلود...' : 'انتخاب تصویر از سیستم'}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      )}

      {/* پیش‌نمایش */}
      {preview && (
        <div className="relative h-64 w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
          <Image
            src={getImageSrc() || ''}
            alt="Preview"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
            unoptimized={preview.startsWith('blob:') || preview.startsWith('http')}
            onError={() => {
              setError('خطا در بارگذاری تصویر')
            }}
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-white font-medium">در حال آپلود...</div>
            </div>
          )}
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}

