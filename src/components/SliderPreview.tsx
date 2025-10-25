'use client'

import Image from 'next/image'

interface SliderPreviewProps {
  slider: {
    title: string
    image: string
    link?: string
  }
}

export default function SliderPreview({ slider }: SliderPreviewProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        پیش‌نمایش اسلایدر
      </h3>
      
      <div className="relative h-64 bg-gradient-1 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          {slider.image && (
            <Image
              src={slider.image}
              alt={slider.title}
              fill
              className="object-cover"
            />
          )}
        </div>
        
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {slider.title}
            </h2>
            {slider.link && (
              <button className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                مشاهده بیشتر
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
