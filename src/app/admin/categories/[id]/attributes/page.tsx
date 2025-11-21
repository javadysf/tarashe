'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Tag,
  Settings,
  CheckCircle,
  XCircle,
  Filter,
  GripVertical
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
}

interface CategoryAttribute {
  _id: string
  category: string
  attribute: Attribute
  order: number
}

export default function CategoryAttributesPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string
  
  const [category, setCategory] = useState<any>(null)
  const [allAttributes, setAllAttributes] = useState<Attribute[]>([])
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch category, all attributes, and category attributes in parallel
      const [categoriesRes, attributesRes, categoryAttributesRes] = await Promise.all([
        api.getCategories(),
        api.getAttributes(),
        api.getCategoryAttributes(categoryId)
      ])
      
      const foundCategory = categoriesRes.find((cat: any) => cat._id === categoryId)
      if (!foundCategory) {
        toast.error('دسته‌بندی یافت نشد')
        router.push('/admin/categories')
        return
      }
      
      setCategory(foundCategory)
      setAllAttributes(attributesRes)
      setCategoryAttributes(categoryAttributesRes)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('خطا در بارگذاری اطلاعات')
    } finally {
      setLoading(false)
    }
  }, [categoryId, router])

  useEffect(() => {
    if (categoryId) {
      fetchData()
    }
  }, [categoryId, fetchData])

  const handleAssignAttribute = async (attributeId: string) => {
    try {
      setAssigning(attributeId)
      await api.assignAttributeToCategory(categoryId, attributeId)
      
      // Add to category attributes
      const attribute = allAttributes.find(attr => attr._id === attributeId)
      if (attribute) {
        const newCategoryAttribute: CategoryAttribute = {
          _id: `temp-${Date.now()}`,
          category: categoryId,
          attribute,
          order: categoryAttributes.length
        }
        setCategoryAttributes(prev => [...prev, newCategoryAttribute])
      }
      
      toast.success('ویژگی با موفقیت به دسته اختصاص داده شد')
    } catch (error: any) {
      console.error('Error assigning attribute:', error)
      toast.error(error.message || 'خطا در اختصاص ویژگی')
    } finally {
      setAssigning(null)
    }
  }

  const handleRemoveAttribute = async (attributeId: string) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این ویژگی را از دسته حذف کنید؟')) {
      return
    }

    try {
      setRemoving(attributeId)
      await api.removeAttributeFromCategory(categoryId, attributeId)
      
      // Remove from category attributes
      setCategoryAttributes(prev => prev.filter(ca => ca.attribute && ca.attribute._id !== attributeId))
      
      toast.success('ویژگی از دسته حذف شد')
    } catch (error: any) {
      console.error('Error removing attribute:', error)
      toast.error(error.message || 'خطا در حذف ویژگی')
    } finally {
      setRemoving(null)
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

  // Get attributes that are not yet assigned to this category
  const availableAttributes = allAttributes.filter(attr => 
    !categoryAttributes.some(ca => ca.attribute && ca.attribute._id === attr._id)
  )

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin/categories')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                ویژگی‌های دسته‌بندی
              </h1>
              <p className="text-gray-600 mt-2">
                مدیریت ویژگی‌های دسته‌بندی &quot;{category?.name}&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">ویژگی‌های اختصاص یافته</p>
                  <p className="text-2xl font-bold text-blue-900">{categoryAttributes.length}</p>
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
                    {categoryAttributes.filter(ca => ca.attribute && ca.attribute.isFilterable).length}
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
                    {categoryAttributes.filter(ca => ca.attribute && ca.attribute.isRequired).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assigned Attributes */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="bg-green-50 border-b border-green-200">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5 text-green-600" />
                ویژگی‌های اختصاص یافته ({categoryAttributes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {categoryAttributes.length === 0 ? (
                <div className="text-center py-8">
                  <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">هیچ ویژگی‌ای به این دسته اختصاص داده نشده</p>
                </div>
              ) : (
                categoryAttributes.filter(ca => ca.attribute).map((categoryAttribute) => (
                  <motion.div
                    key={categoryAttribute._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <GripVertical className="w-4 h-4 text-green-500" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">
                            {categoryAttribute.attribute.name}
                          </h4>
                          <Badge className={getTypeColor(categoryAttribute.attribute.type)}>
                            {getTypeLabel(categoryAttribute.attribute.type)}
                          </Badge>
                          {categoryAttribute.attribute.unit && (
                            <Badge variant="outline" className="text-xs">
                              {categoryAttribute.attribute.unit}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            {categoryAttribute.attribute.isRequired ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <XCircle className="w-3 h-3 text-gray-400" />
                            )}
                            <span>الزامی</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {categoryAttribute.attribute.isFilterable ? (
                              <CheckCircle className="w-3 h-3 text-blue-500" />
                            ) : (
                              <XCircle className="w-3 h-3 text-gray-400" />
                            )}
                            <span>فیلترپذیر</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveAttribute(categoryAttribute.attribute._id)}
                      disabled={removing === categoryAttribute.attribute._id}
                      className="p-2 hover:bg-red-100 text-red-600 hover:text-red-700"
                    >
                      {removing === categoryAttribute.attribute._id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </Button>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Available Attributes */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="bg-blue-50 border-b border-blue-200">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Plus className="w-5 h-5 text-blue-600" />
                ویژگی‌های موجود ({availableAttributes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {availableAttributes.length === 0 ? (
                <div className="text-center py-8">
                  <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">همه ویژگی‌ها به این دسته اختصاص داده شده‌اند</p>
                  <Button
                    onClick={() => router.push('/admin/attributes/create')}
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    ایجاد ویژگی جدید
                  </Button>
                </div>
              ) : (
                availableAttributes.map((attribute) => (
                  <motion.div
                    key={attribute._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">
                            {attribute.name}
                          </h4>
                          <Badge className={getTypeColor(attribute.type)}>
                            {getTypeLabel(attribute.type)}
                          </Badge>
                          {attribute.unit && (
                            <Badge variant="outline" className="text-xs">
                              {attribute.unit}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            {attribute.isRequired ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <XCircle className="w-3 h-3 text-gray-400" />
                            )}
                            <span>الزامی</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {attribute.isFilterable ? (
                              <CheckCircle className="w-3 h-3 text-blue-500" />
                            ) : (
                              <XCircle className="w-3 h-3 text-gray-400" />
                            )}
                            <span>فیلترپذیر</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAssignAttribute(attribute._id)}
                      disabled={assigning === attribute._id}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-2"
                    >
                      {assigning === attribute._id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </Button>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/categories')}
              className="px-6"
            >
              بازگشت به دسته‌بندی‌ها
            </Button>
            <Button
              onClick={() => router.push('/admin/attributes/create')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6"
            >
              <Plus className="w-4 h-4 ml-2" />
              ایجاد ویژگی جدید
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
