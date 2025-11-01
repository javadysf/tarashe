'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { toast } from 'react-toastify'
import { ArrowRight, Plus, Trash2 } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default function EditAttributePage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    type: 'text' as 'text' | 'number' | 'select' | 'boolean',
    unit: '',
    isRequired: false,
    isFilterable: false,
    options: ['']
  })

  useEffect(() => {
    fetchAttribute()
  }, [id])

  const fetchAttribute = async () => {
    try {
      const attribute = await api.getAttribute(id)
      setFormData({
        name: attribute.name,
        type: attribute.type,
        unit: attribute.unit || '',
        isRequired: attribute.isRequired,
        isFilterable: attribute.isFilterable,
        options: attribute.options || ['']
      })
    } catch (error: any) {
      toast.error(error.message || 'خطا در بارگذاری ویژگی')
      router.push('/admin/attributes')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('نام ویژگی الزامی است')
      return
    }

    if (formData.type === 'select' && formData.options.filter(opt => opt.trim()).length < 2) {
      toast.error('برای نوع انتخابی حداقل 2 گزینه الزامی است')
      return
    }

    setLoading(true)
    try {
      const attributeData = {
        name: formData.name,
        type: formData.type,
        unit: formData.unit || undefined,
        isRequired: formData.isRequired,
        isFilterable: formData.isFilterable,
        options: formData.type === 'select' ? formData.options.filter(opt => opt.trim()) : undefined
      }

      await api.updateAttribute(id, attributeData)
      toast.success('ویژگی با موفقیت بهروزرسانی شد')
      router.push('/admin/attributes')
    } catch (error: any) {
      toast.error(error.message || 'خطا در بهروزرسانی ویژگی')
    } finally {
      setLoading(false)
    }
  }

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }))
  }

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }))
  }

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }))
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
              ویرایش ویژگی
            </h1>
            <p className="text-gray-600 mt-2">ویرایش ویژگی "{formData.name}"</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                نام ویژگی *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="مثال: رنگ، اندازه، وزن"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                نوع ویژگی *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  type: e.target.value as any,
                  options: e.target.value === 'select' ? (prev.options.length > 0 ? prev.options : ['']) : []
                }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="text">متن</option>
                <option value="number">عدد</option>
                <option value="select">انتخابی (لیست)</option>
                <option value="boolean">بله/خیر</option>
              </select>
            </div>

            {/* Unit (for number type) */}
            {formData.type === 'number' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  واحد (اختیاری)
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="مثال: کیلوگرم، سانتیمتر، لیتر"
                />
              </div>
            )}

            {/* Options (for select type) */}
            {formData.type === 'select' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  گزینه ها *
                </label>
                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder={`گزینه ${index + 1}`}
                      />
                      {formData.options.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOption}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    افزودن گزینه
                  </button>
                </div>
              </div>
            )}

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">تنظیمات</h3>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={formData.isRequired}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
                  className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isRequired" className="text-sm font-medium text-gray-700">
                  ویژگی الزامی (باید حتماً مقدار داشته باشد)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isFilterable"
                  checked={formData.isFilterable}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFilterable: e.target.checked }))}
                  className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isFilterable" className="text-sm font-medium text-gray-700">
                  قابل فیلتر (در صفحه محصولات قابل فیلتر باشد)
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    در حال بهروزرسانی...
                  </>
                ) : (
                  'بهروزرسانی ویژگی'
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