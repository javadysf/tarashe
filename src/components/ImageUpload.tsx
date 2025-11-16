'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { getApiUrl, getImageUrl } from '@/lib/config'

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void
  currentImage?: string
  folder?: string
}

export default function ImageUpload({ onImageUpload, currentImage, folder = 'general' }: ImageUploadProps) {
  // preview همیشه «آدرسی است که در دیتابیس ذخیره می‌کنیم» (معمولاً relative مثل /uploads/.. یا یک URL کامل)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  // blob URL برای پیش‌نمایش محلی (تا زمانی که تصویر سرور لود نشده)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const imageLoadedRef = useRef(false)

  // وقتی currentImage از props تغییر می‌کند، preview را هم آپدیت کن
  useEffect(() => {
    if (currentImage) {
      setPreview(currentImage)
    }
  }, [currentImage])

  // Cleanup blob URLs وقتی کامپوننت unmount می‌شود یا blobUrl تغییر می‌کند
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }, [blobUrl])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // نوع و حجم فایل را بررسی کن
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
    setBlobUrl(localPreview)
    imageLoadedRef.current = false

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      setError('توکن احراز هویت یافت نشد (لطفاً دوباره وارد شوید)')
      URL.revokeObjectURL(localPreview)
      setBlobUrl(null)
      return
    }

    const formData = new FormData()
    formData.append('image', file)
    formData.append('folder', folder)

    setUploading(true)
    try {
      const res = await fetch(getApiUrl('/upload'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'خطا در آپلود تصویر')
      }

      const data = await res.json()
      // بک‌اند imageUrl را به صورت مسیر نسبی مثل /uploads/sliders/... برمی‌گرداند
      const imageUrl = data.imageUrl as string

      if (!imageUrl || imageUrl.trim() === '') {
        throw new Error('آدرس تصویر از سرور دریافت نشد')
      }

      // URL سرور را set کن (blob URL تا زمانی که تصویر لود نشده نگه داشته می‌شود)
      setPreview(imageUrl)
      onImageUpload(imageUrl)
      // blob URL بعد از اینکه تصویر سرور لود شد، در onLoad event revoke می‌شود
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'خطا در آپلود تصویر')
      // در صورت خطا، blob URL را نگه دار تا کاربر بتونه ببینه چه تصویری انتخاب کرده
    } finally {
      setUploading(false)
      // پاک کردن انتخاب فایل برای امکان انتخاب مجدد همان فایل
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  const handleManualUrl = () => {
    const url = prompt('لطفاً URL تصویر را وارد کنید:')
    if (url && url.trim()) {
      setPreview(url)
      onImageUpload(url)
    }
  }

  const handleRemoveImage = () => {
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl)
      setBlobUrl(null)
    }
    setPreview(null)
    onImageUpload('')
    imageLoadedRef.current = false
  }

  const handleImageLoad = () => {
    // اگر preview وجود داره (URL سرور) و blob نیست
    // و blobUrl هم وجود داره (یعنی قبلاً blob نمایش داده شده)
    // یعنی تصویر سرور لود شده و باید blob را revoke کنیم
    if (preview && !preview.startsWith('blob:') && blobUrl) {
      imageLoadedRef.current = true
      // یک تاخیر کوچک برای اطمینان از اینکه تصویر کاملاً render شده
      setTimeout(() => {
        if (blobUrl) {
          URL.revokeObjectURL(blobUrl)
          setBlobUrl(null)
        }
      }, 300)
    }
  }

  return (
    <div className="space-y-4">
      {(preview || blobUrl) && (() => {
        // اگر preview وجود داره (URL سرور)، از اون استفاده کن
        // در غیر این صورت از blobUrl استفاده کن (پیش‌نمایش محلی)
        const displayUrl = preview || blobUrl
        if (!displayUrl) return null

        // اگر blob URL باشد (پیش‌نمایش محلی) یا URL کامل باشد، مستقیماً استفاده می‌کنیم
        // اگر مسیر نسبی /uploads/... باشد، برای نمایش پیش‌نمایش، URL کامل سرور را می‌سازیم
        const isBlob = displayUrl.startsWith('blob:')
        const src = displayUrl.startsWith('http') || isBlob
          ? displayUrl
          : getImageUrl(displayUrl)

        const unoptimized = displayUrl.startsWith('/uploads') || isBlob
        const isServerImage = preview && !preview.startsWith('blob:') && displayUrl === preview

        return (
          <div className="relative h-48 w-full">
            <Image
              src={src}
              alt="Preview"
              fill
              className="object-cover rounded-lg border border-gray-300"
              sizes="(max-width: 768px) 100vw, 400px"
              unoptimized={unoptimized}
              onLoad={handleImageLoad}
              onError={(e) => {
                // فقط برای تصویر سرور خطا handle کن، نه برای blob
                if (isServerImage) {
                  console.error('Server image load error:', src)
                  // اگر تصویر سرور لود نشد و blobUrl وجود داره، از blob استفاده کن
                  if (blobUrl) {
                    setPreview(null)
                  } else {
                    setError('خطا در بارگذاری تصویر سرور')
                  }
                }
                // برای blob URL ها خطا handle نکن (آنها معمولاً کار می‌کنند)
              }}
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
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
        )
      })()}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="text-center">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <label className="inline-flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer">
            {uploading ? 'در حال آپلود...' : 'انتخاب تصویر از سیستم'}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
          </label>

          <button
            type="button"
            onClick={handleManualUrl}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            انتخاب تصویر با URL
          </button>
        </div>
      </div>

      {currentImage && !preview && (
        <div className="text-sm text-gray-500">
          تصویر فعلی: {currentImage}
        </div>
      )}
    </div>
  )
}