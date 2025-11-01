'use client'

import { useState } from 'react'
import { Share2, Copy, MessageCircle, Send, Instagram, Twitter } from 'lucide-react'
import { toast } from 'react-toastify'

interface ShareButtonProps {
  productName: string
  productUrl: string
  productImage?: string
  productPrice: number
}

export default function ShareButton({ productName, productUrl, productImage, productPrice }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const shareText = `${productName} - ${new Intl.NumberFormat('fa-IR').format(productPrice)} تومان`
  const fullUrl = `${window.location.origin}${productUrl}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      toast.success('لینک کپی شد!')
      setIsOpen(false)
    } catch (error) {
      toast.error('خطا در کپی لینک')
    }
  }

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${fullUrl}`)}`
    window.open(whatsappUrl, '_blank')
    setIsOpen(false)
  }

  const handleTelegramShare = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(shareText)}`
    window.open(telegramUrl, '_blank')
    setIsOpen(false)
  }

  const handleInstagramShare = () => {
    // Instagram doesn't support direct URL sharing, so we copy the link and show a message
    navigator.clipboard.writeText(`${shareText}\n${fullUrl}`)
    toast.info('لینک کپی شد! در اینستاگرام پیست کنید')
    setIsOpen(false)
  }

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`
    window.open(twitterUrl, '_blank')
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        title="اشتراک گذاری"
      >
        <Share2 className="w-5 h-5" />
        <span className="text-sm font-medium">اشتراک گذاری</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Share Menu */}
          <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50 min-w-[200px]">
            <div className="space-y-2">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Copy className="w-5 h-5" />
                <span>کپی لینک</span>
              </button>

              <button
                onClick={handleWhatsAppShare}
                className="w-full flex items-center gap-3 px-3 py-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>واتساپ</span>
              </button>

              <button
                onClick={handleTelegramShare}
                className="w-full flex items-center gap-3 px-3 py-2 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Send className="w-5 h-5" />
                <span>تلگرام</span>
              </button>

              <button
                onClick={handleInstagramShare}
                className="w-full flex items-center gap-3 px-3 py-2 text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition-colors"
              >
                <Instagram className="w-5 h-5" />
                <span>اینستاگرام</span>
              </button>

              <button
                onClick={handleTwitterShare}
                className="w-full flex items-center gap-3 px-3 py-2 text-blue-400 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Twitter className="w-5 h-5" />
                <span>توییتر</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}