'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  ArrowRight, 
  Plus, 
  X, 
  Tag,
  Save,
  ArrowLeft,
  Edit
} from 'lucide-react'
import { toast } from 'react-toastify'

interface AttributeFormData {
  name: string
  type: 'text' | 'number' | 'select' | 'boolean'
  options: string[]
  unit: string
  isRequired: boolean
  isFilterable: boolean
}

export default function EditAttributePage() {
  const router = useRouter()
  const params = useParams()
  const attributeId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState<AttributeFormData>({
    name: '',
    type: 'text',
    options: [''],
    unit: '',
    isRequired: false,
    isFilterable: true
  })

  useEffect(() => {
    if (attributeId) {
      fetchAttribute()
    }
  }, [attributeId])

  const fetchAttribute = async () => {
    try {
      setInitialLoading(true)
      const attributes = await api.getAttributes()
      const attribute = attributes.find((attr: any) => attr._id === attributeId)
      
      if (!attribute) {
        toast.error('ویژگی یافت نشد')
        router.push('/admin/attributes')
        return
      }

      setFormData({
        name: attribute.name,
        type: attribute.type,
        options: attribute.options || [''],
        unit: attribute.unit || '',
        isRequired: attribute.isRequired,
        isFilterable: attribute.isFilterable
      })
    } catch (error) {
      console.error('Error fetching attribute:', error)
      toast.error('خطا در بارگذاری ویژگی')
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

    if (formData.type === 'select' && formData.options.every(opt => !opt.trim())) {
      toast.error('برای ویژگی انتخابی حداقل یک گزینه الزامی است')
      return
    }

    try {
      setLoading(true)
      
      const submitData = {
        ...formData,
        options: formData.type === 'select' ? formData.options.filter(opt => opt.trim()) : undefined,
        unit: formData.unit.trim() || undefined
      }

      await api.updateAttribute(attributeId, submitData)
      
      toast.success('🎉 ویژگی با موفقیت به‌روزرسانی شد!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }
      })
      
      setTimeout(() => {
        router.push('/admin/attributes')
      }, 1500)
    } catch (error: any) {
      console.error('Error updating attribute:', error)
      toast.error('❌ ' + (error.message || 'خطا در به‌روزرسانی ویژگی'), {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, '']
    })
  }

  const removeOption = (index: number) => {
    if (formData.options.length > 1) {
      setFormData({
        ...formData,
        options: formData.options.filter((_, i) => i !== index)
      })
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({
      ...formData,
      options: newOptions
    })
  }

  const getTypeDescription = (type: string) => {
    const descriptions = {
      text: 'برای متن‌های کوتاه و بلند',
      number: 'برای اعداد و مقادیر عددی',
      select: 'برای انتخاب از بین گزینه‌های از پیش تعریف شده',
      boolean: 'برای پاسخ‌های بله/خیر'
    }
    return descriptions[type as keyof typeof descriptions] || ''
  }

  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Edit className="w-5 h-5 text-white" />
            </div>
            ویرایش ویژگی
          </h1>
          <p className="text-gray-600 mt-2">
            ویرایش اطلاعات ویژگی "{formData.name}"
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-blue-600" />
                  اطلاعات اصلی
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    نام ویژگی *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: رنگ، ظرفیت، جنس"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                    نوع ویژگی *
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">متن</SelectItem>
                      <SelectItem value="number">عدد</SelectItem>
                      <SelectItem value="select">انتخابی</SelectItem>
                      <SelectItem value="boolean">بله/خیر</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {getTypeDescription(formData.type)}
                  </p>
                </div>

                <div>
                  <Label htmlFor="unit" className="text-sm font-medium text-gray-700">
                    واحد اندازه‌گیری
                  </Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="مثال: GB, MHz, کیلوگرم"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Options for Select Type */}
            {formData.type === 'select' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-purple-600" />
                    گزینه‌های انتخابی
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`گزینه ${index + 1}`}
                        className="flex-1"
                      />
                      {formData.options.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="p-2 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addOption}
                    className="w-full border-dashed"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    افزودن گزینه جدید
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">تنظیمات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isRequired" className="text-sm font-medium text-gray-700">
                      ویژگی الزامی
                    </Label>
                    <p className="text-xs text-gray-500">
                      آیا این ویژگی برای محصولات الزامی است؟
                    </p>
                  </div>
                  <Switch
                    id="isRequired"
                    checked={formData.isRequired}
                    onCheckedChange={(checked) => setFormData({ ...formData, isRequired: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isFilterable" className="text-sm font-medium text-gray-700">
                      قابل فیلتر
                    </Label>
                    <p className="text-xs text-gray-500">
                      آیا این ویژگی در فیلترها نمایش داده شود؟
                    </p>
                  </div>
                  <Switch
                    id="isFilterable"
                    checked={formData.isFilterable}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFilterable: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">پیش‌نمایش</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      {formData.name || 'نام ویژگی'}
                    </Label>
                    {formData.type === 'text' && (
                      <Input placeholder="مقدار متن..." disabled />
                    )}
                    {formData.type === 'number' && (
                      <Input type="number" placeholder="0" disabled />
                    )}
                    {formData.type === 'select' && (
                      <Select disabled>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب کنید" />
                        </SelectTrigger>
                      </Select>
                    )}
                    {formData.type === 'boolean' && (
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input type="radio" name="preview" disabled />
                          <span className="text-sm">بله</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="radio" name="preview" disabled />
                          <span className="text-sm">خیر</span>
                        </label>
                      </div>
                    )}
                    {formData.unit && (
                      <p className="text-xs text-gray-500 mt-1">
                        واحد: {formData.unit}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="px-6"
          >
            انصراف
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                در حال به‌روزرسانی...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                به‌روزرسانی ویژگی
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

