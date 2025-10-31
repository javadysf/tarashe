'use client'

import { useState } from 'react'

interface MapHelperProps {
  onEmbedCodeGenerated: (embedCode: string) => void
}

export default function MapHelper({ onEmbedCodeGenerated }: MapHelperProps) {
  const [address, setAddress] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateGoogleMapsLink = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
  }

  const handleGenerateEmbedCode = async () => {
    if (!address.trim()) return
    
    setIsGenerating(true)
    
    try {
      // Generate a basic embed code template
      const embedCode = `<iframe 
  src="https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(address)}" 
  width="100%" 
  height="300" 
  style="border:0;" 
  allowfullscreen="" 
  loading="lazy" 
  referrerpolicy="no-referrer-when-downgrade">
</iframe>`
      
      onEmbedCodeGenerated(embedCode)
    } catch (error) {
      console.error('Error generating embed code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="text-sm font-medium text-gray-700 mb-3">راهنمای سریع:</h4>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">آدرس شرکت:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="آدرس کامل شرکت را وارد کنید"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleGenerateEmbedCode}
              disabled={!address.trim() || isGenerating}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? '...' : 'تولید'}
            </button>
          </div>
        </div>
        
        <div className="text-xs text-gray-600">
          <p className="mb-2">یا برای دریافت کد کامل:</p>
          <ol className="space-y-1 list-decimal list-inside">
            <li>به <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Maps</a> بروید</li>
            <li>آدرس را جستجو کنید</li>
            <li>روی "اشتراک‌ گذاری" → "تعبیه نقشه" کلیک کنید</li>
            <li>کد HTML را کپی کنید</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
















