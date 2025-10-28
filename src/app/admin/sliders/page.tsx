'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/ImageUpload'

interface Slider {
  _id: string
  title: string
  subtitle: string
  backgroundImage: string
  buttonText: string
  buttonLink: string
  isActive: boolean
  displayOrder: number
  textColor: string
  buttonColor: string
  textPosition: 'left' | 'center' | 'right'
  overlayOpacity: number
  createdAt: string
  updatedAt: string
}

export default function SliderManagement() {
  const router = useRouter()
  const [sliders, setSliders] = useState<Slider[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    backgroundImage: '',
    buttonText: '',
    buttonLink: '',
    isActive: true,
    displayOrder: 0,
    textColor: '#ffffff',
    buttonColor: '#3b82f6',
    textPosition: 'center' as 'left' | 'center' | 'right',
    overlayOpacity: 0.4
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSliders()
  }, [])

  const fetchSliders = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3002/api/sliders/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSliders(data.sliders)
      }
    } catch (error) {
      console.error('Error fetching sliders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = localStorage.getItem('token')
      const url = editingSlider 
        ? `http://localhost:3002/api/sliders/${editingSlider._id}`
        : 'http://localhost:3002/api/sliders'
      
      const method = editingSlider ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert(editingSlider ? 'اسلایدر با موفقیت بروزرسانی شد' : 'اسلایدر با موفقیت ایجاد شد')
        setShowForm(false)
        setEditingSlider(null)
        resetForm()
        fetchSliders()
      } else {
        const error = await response.json()
        alert(`خطا: ${error.message}`)
      }
    } catch (error) {
      console.error('Error saving slider:', error)
      alert('خطا در ذخیره اسلایدر')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (slider: Slider) => {
    setEditingSlider(slider)
    setFormData({
      title: slider.title,
      subtitle: slider.subtitle,
      backgroundImage: slider.backgroundImage,
      buttonText: slider.buttonText,
      buttonLink: slider.buttonLink,
      isActive: slider.isActive,
      displayOrder: slider.displayOrder,
      textColor: slider.textColor,
      buttonColor: slider.buttonColor,
      textPosition: slider.textPosition,
      overlayOpacity: slider.overlayOpacity
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این اسلایدر را حذف کنید؟')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3002/api/sliders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        alert('اسلایدر با موفقیت حذف شد')
        fetchSliders()
      } else {
        const error = await response.json()
        alert(`خطا: ${error.message}`)
      }
    } catch (error) {
      console.error('Error deleting slider:', error)
      alert('خطا در حذف اسلایدر')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      backgroundImage: '',
      buttonText: '',
      buttonLink: '',
      isActive: true,
      displayOrder: 0,
      textColor: '#ffffff',
      buttonColor: '#3b82f6',
      textPosition: 'center',
      overlayOpacity: 0.4
    })
  }

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, backgroundImage: imageUrl }))
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎠</span>
            </div>
            <div>
              <h1 className="text-3xl max-sm:text-xl font-bold text-gray-900">مدیریت اسلایدرها</h1>
              <p className="text-gray-600">مدیریت اسلایدرهای صفحه اصلی</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingSlider(null)
              resetForm()
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + افزودن اسلایدر جدید
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editingSlider ? 'ویرایش اسلایدر' : 'افزودن اسلایدر جدید'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان اصلی
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="عنوان اسلایدر"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  زیرعنوان
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="زیرعنوان اسلایدر"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تصویر پس‌زمینه
              </label>
              <ImageUpload
                onImageUpload={handleImageUpload}
                currentImage={formData.backgroundImage}
                folder="sliders"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  متن دکمه
                </label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="متن دکمه"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  لینک دکمه
                </label>
                <input
                  type="text"
                  value={formData.buttonLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, buttonLink: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="/products"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  موقعیت متن
                </label>
                <select
                  value={formData.textPosition}
                  onChange={(e) => setFormData(prev => ({ ...prev, textPosition: e.target.value as 'left' | 'center' | 'right' }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="left">چپ</option>
                  <option value="center">وسط</option>
                  <option value="right">راست</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رنگ متن
                </label>
                <input
                  type="color"
                  value={formData.textColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                  className="w-full h-12 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رنگ دکمه
                </label>
                <input
                  type="color"
                  value={formData.buttonColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, buttonColor: e.target.value }))}
                  className="w-full h-12 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">فعال</span>
              </label>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">ترتیب نمایش:</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingSlider(null)
                  resetForm()
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'در حال ذخیره...' : (editingSlider ? 'بروزرسانی' : 'ایجاد')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6">
        {sliders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎠</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">هیچ اسلایدری یافت نشد</h3>
            <p className="text-gray-600 mb-6">برای شروع، اولین اسلایدر خود را ایجاد کنید</p>
            <button
              onClick={() => {
                setShowForm(true)
                setEditingSlider(null)
                resetForm()
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              افزودن اسلایدر جدید
            </button>
          </div>
        ) : (
          sliders.map((slider) => (
            <div key={slider._id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex max-sm:flex-col max-sm:gap-8 items-center justify-between mb-4">
                <div className="flex  items-center gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={slider.backgroundImage}
                      alt={slider.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{slider.title}</h3>
                    <p className="text-gray-600">{slider.subtitle}</p>
                    <p className="text-sm text-gray-500">
                      ترتیب: {slider.displayOrder} | 
                      موقعیت: {slider.textPosition === 'left' ? 'چپ' : slider.textPosition === 'center' ? 'وسط' : 'راست'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    slider.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {slider.isActive ? 'فعال' : 'غیرفعال'}
                  </span>
                  <button
                    onClick={() => handleEdit(slider)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    ویرایش
                  </button>
                  <button
                    onClick={() => handleDelete(slider._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    حذف
                  </button>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <strong>دکمه:</strong> {slider.buttonText} → {slider.buttonLink}
                </div>
                <div>
                  <strong>رنگ‌ها:</strong> متن: {slider.textColor} | دکمه: {slider.buttonColor}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}