'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'

interface Slider {
  _id: string
  title: string
  image: string
  link?: string
  isActive: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

interface SliderCardProps {
  slider: Slider
  onDelete: (id: string) => void
  onToggleActive: (id: string, isActive: boolean) => void
  deleting: string | null
  onDragStart: (e: React.DragEvent, id: string) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, id: string) => void
  isDragging: boolean
}

export default function SliderCard({
  slider,
  onDelete,
  onToggleActive,
  deleting,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging
}: SliderCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR')
  }

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : 'hover:shadow-lg'
      }`}
      draggable
      onDragStart={(e) => onDragStart(e, slider._id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, slider._id)}
    >
      <div className="md:flex">
        <div className="md:w-1/3 relative">
          <img
            src={slider.image}
            alt={slider.title}
            className="w-full h-48 md:h-full object-cover"
          />
          <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            ترتیب: {slider.displayOrder}
          </div>
        </div>
        <div className="md:w-2/3 p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {slider.title}
              </h3>
              {slider.link && (
                <p className="text-blue-600 dark:text-blue-400 mb-2">
                  لینک: {slider.link}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                slider.isActive 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {slider.isActive ? 'فعال' : 'غیرفعال'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              ایجاد شده در: {formatDate(slider.createdAt)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onToggleActive(slider._id, slider.isActive)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  slider.isActive
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300'
                    : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300'
                }`}
              >
                {slider.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
              </button>
              <a
                href={`/admin/sliders/edit/${slider._id}`}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 transition-colors"
              >
                ویرایش
              </a>
              <button
                onClick={() => onDelete(slider._id)}
                disabled={deleting === slider._id}
                className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm font-medium hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 transition-colors disabled:opacity-50"
              >
                {deleting === slider._id ? 'در حال حذف...' : 'حذف'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
