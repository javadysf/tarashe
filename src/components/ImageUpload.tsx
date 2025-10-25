'use client'

import { useState } from 'react'

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void
  currentImage?: string
  folder?: string
}

export default function ImageUpload({ onImageUpload, currentImage, folder = 'general' }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)

  const handleManualUrl = () => {
    const url = prompt('لطفاً URL تصویر را وارد کنید:')
    if (url && url.trim()) {
      setPreview(url)
      onImageUpload(url)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    onImageUpload('')
  }

  return (
    <div className="space-y-4">
      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-300"
          />
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

      <div className="text-center">
        <button
          type="button"
          onClick={handleManualUrl}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          انتخاب تصویر (URL)
        </button>
      </div>

      {currentImage && !preview && (
        <div className="text-sm text-gray-500">
          تصویر فعلی: {currentImage}
        </div>
      )}
    </div>
  )
}