'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Tag,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react'
import { toast } from 'react-toastify'

interface Attribute {
  _id: string
  name: string
  type: 'text' | 'number' | 'select' | 'boolean'
  options?: string[]
  unit?: string
  isRequired: boolean
  isFilterable: boolean
  createdAt: string
  updatedAt: string
}

export default function AttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchAttributes()
  }, [])

  const fetchAttributes = async () => {
    try {
      setLoading(true)
      const response = await api.getAttributes()
      setAttributes(response)
    } catch (error) {
      console.error('Error fetching attributes:', error)
      toast.error('خطا در بارگذاری ویژگی‌ها')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`آیا مطمئن هستید که می‌خواهید ویژگی "${name}" را حذف کنید؟`)) {
      return
    }

    try {
      setDeleting(id)
      await api.deleteAttribute(id)
      setAttributes(attributes.filter(attr => attr._id !== id))
      toast.success('ویژگی با موفقیت حذف شد')
    } catch (error: any) {
      console.error('Error deleting attribute:', error)
      toast.error(error.message || 'خطا در حذف ویژگی')
    } finally {
      setDeleting(null)
    }
  }

  const getTypeLabel = (type: string) => {
    const types = {
      text: 'متن',
      number: 'عدد',
      select: 'انتخابی',
      boolean: 'بله/خیر'
    }
    return types[type as keyof typeof types] || type
  }

  const getTypeColor = (type: string) => {
    const colors = {
      text: 'bg-blue-100 text-blue-800',
      number: 'bg-green-100 text-green-800',
      select: 'bg-purple-100 text-purple-800',
      boolean: 'bg-orange-100 text-orange-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-white" />
            </div>
            مدیریت ویژگی‌ها
          </h1>
          <p className="text-gray-600 mt-2">
            ایجاد و مدیریت ویژگی‌های محصولات برای دسته‌بندی‌های مختلف
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/attributes/create')}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="w-5 h-5 ml-2" />
          ایجاد ویژگی جدید
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">کل ویژگی‌ها</p>
                <p className="text-2xl font-bold text-blue-900">{attributes.length}</p>
              </div>
              <Tag className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">ویژگی‌های فیلترپذیر</p>
                <p className="text-2xl font-bold text-green-900">
                  {attributes.filter(attr => attr.isFilterable).length}
                </p>
              </div>
              <Filter className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">ویژگی‌های الزامی</p>
                <p className="text-2xl font-bold text-purple-900">
                  {attributes.filter(attr => attr.isRequired).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">ویژگی‌های انتخابی</p>
                <p className="text-2xl font-bold text-orange-900">
                  {attributes.filter(attr => attr.type === 'select').length}
                </p>
              </div>
              <Settings className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attributes List */}
      {attributes.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              هیچ ویژگی‌ای وجود ندارد
            </h3>
            <p className="text-gray-500 mb-6">
              برای شروع، اولین ویژگی خود را ایجاد کنید
            </p>
            <Button
              onClick={() => router.push('/admin/attributes/create')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              <Plus className="w-4 h-4 ml-2" />
              ایجاد ویژگی جدید
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attributes.map((attribute) => (
            <motion.div
              key={attribute._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {attribute.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getTypeColor(attribute.type)}>
                          {getTypeLabel(attribute.type)}
                        </Badge>
                        {attribute.unit && (
                          <Badge variant="outline" className="text-xs">
                            {attribute.unit}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/admin/attributes/edit/${attribute._id}`)}
                        className="h-8 w-8 p-0 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(attribute._id, attribute.name)}
                        disabled={deleting === attribute._id}
                        className="h-8 w-8 p-0 hover:bg-red-50"
                      >
                        {deleting === attribute._id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-600" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Options for select type */}
                    {attribute.type === 'select' && attribute.options && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">گزینه‌ها:</p>
                        <div className="flex flex-wrap gap-1">
                          {attribute.options.slice(0, 3).map((option, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {option}
                            </Badge>
                          ))}
                          {attribute.options.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{attribute.options.length - 3} بیشتر
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Settings */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        {attribute.isRequired ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={attribute.isRequired ? 'text-green-700' : 'text-gray-500'}>
                          الزامی
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {attribute.isFilterable ? (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                        <span className={attribute.isFilterable ? 'text-blue-700' : 'text-gray-500'}>
                          فیلترپذیر
                        </span>
                      </div>
                    </div>

                    {/* Created date */}
                    <p className="text-xs text-gray-500">
                      ایجاد شده در: {new Date(attribute.createdAt).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}