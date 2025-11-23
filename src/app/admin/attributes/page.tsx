'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
      text: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      number: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      select: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      boolean: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        {[...Array(8)].map((_, i) => (
                          <th key={i} className="px-6 py-3">
                            <Skeleton className="h-4 w-20" />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {[...Array(5)].map((_, i) => (
                        <tr key={i}>
                          {[...Array(8)].map((_, j) => (
                            <td key={j} className="px-6 py-4">
                              <Skeleton className="h-4 w-full" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-white" />
            </div>
            مدیریت ویژگی‌ها
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
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
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">کل ویژگی‌ها</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{attributes.length}</p>
              </div>
              <Tag className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">ویژگی‌های فیلترپذیر</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-200">
                  {attributes.filter(attr => attr.isFilterable).length}
                </p>
              </div>
              <Filter className="w-8 h-8 text-green-500 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-200 dark:border-purple-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">ویژگی‌های الزامی</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                  {attributes.filter(attr => attr.isRequired).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 border-orange-200 dark:border-orange-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">ویژگی‌های انتخابی</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-200">
                  {attributes.filter(attr => attr.type === 'select').length}
                </p>
              </div>
              <Settings className="w-8 h-8 text-orange-500 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attributes Table */}
      {attributes.length === 0 ? (
        <Card className="text-center py-12 bg-white dark:bg-gray-800">
          <CardContent>
            <Tag className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              هیچ ویژگی‌ای وجود ندارد
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
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
        <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      نام ویژگی
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      نوع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      واحد
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      گزینه‌ها
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الزامی
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      فیلترپذیر
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      تاریخ ایجاد
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {attributes.map((attribute) => (
                    <tr 
                      key={attribute._id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {attribute.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getTypeColor(attribute.type)}>
                          {getTypeLabel(attribute.type)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {attribute.unit || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {attribute.type === 'select' && attribute.options ? (
                            <div className="flex flex-wrap gap-1">
                              {attribute.options.length > 0 ? (
                                <>
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
                                </>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500">—</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {attribute.isRequired ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                              <span className="text-sm text-green-700 dark:text-green-400">بله</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                              <span className="text-sm text-gray-500 dark:text-gray-400">خیر</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {attribute.isFilterable ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                              <span className="text-sm text-blue-700 dark:text-blue-400">بله</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                              <span className="text-sm text-gray-500 dark:text-gray-400">خیر</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(attribute.createdAt).toLocaleDateString('fa-IR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/admin/attributes/edit/${attribute._id}`)}
                            className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          >
                            <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(attribute._id, attribute.name)}
                            disabled={deleting === attribute._id}
                            className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/30"
                          >
                            {deleting === attribute._id ? (
                              <div className="w-4 h-4 border-2 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
        </div>
      </div>
    </div>
  )
}