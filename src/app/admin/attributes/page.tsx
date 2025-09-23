'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { toast } from 'react-toastify'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus, Settings } from 'lucide-react'

interface Attribute {
  _id: string
  name: string
  type: 'text' | 'number' | 'select'
  options?: string[]
}

interface Category {
  _id: string
  name: string
}

export default function AttributesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newAttribute, setNewAttribute] = useState({
    name: '',
    type: 'text' as 'text' | 'number' | 'select',
    options: ['']
  })
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categoryAttributes, setCategoryAttributes] = useState<any[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryAttributes(selectedCategory)
    }
  }, [selectedCategory])

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories()
      setCategories(response)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategoryAttributes = async (categoryId: string) => {
    try {
      const response = await api.getCategoryAttributes(categoryId)
      setCategoryAttributes(response)
    } catch (error) {
      console.error('Error fetching category attributes:', error)
    }
  }

  const handleCreateAttributeForCategory = async () => {
    if (!selectedCategory) {
      toast.error('ابتدا دسته بندی را انتخاب کنید')
      return
    }
    
    if (!newAttribute.name.trim()) {
      toast.error('نام ویژگی الزامی است')
      return
    }
    
    try {
      const attributeData = {
        ...newAttribute,
        options: newAttribute.type === 'select' ? newAttribute.options.filter(opt => opt.trim()) : undefined
      }
      
      const response = await api.createAttribute(attributeData)
      await api.assignAttributeToCategory(selectedCategory, response.attribute._id)
      
      fetchCategoryAttributes(selectedCategory)
      setNewAttribute({ name: '', type: 'text', options: [''] })
      
      toast.success('ویژگی جدید برای دسته ایجاد شد')
    } catch (error: any) {
      toast.error(error.message || 'خطا در ایجاد ویژگی')
    }
  }

  const handleRemoveAttribute = async (attributeId: string) => {
    if (!selectedCategory) return
    
    try {
      await api.removeAttributeFromCategory(selectedCategory, attributeId)
      toast.success('ویژگی از دسته حذف شد')
      fetchCategoryAttributes(selectedCategory)
    } catch (error: any) {
      toast.error(error.message || 'خطا در حذف ویژگی')
    }
  }

  const addOption = () => {
    setNewAttribute({
      ...newAttribute,
      options: [...newAttribute.options, '']
    })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...newAttribute.options]
    newOptions[index] = value
    setNewAttribute({
      ...newAttribute,
      options: newOptions
    })
  }

  const removeOption = (index: number) => {
    setNewAttribute({
      ...newAttribute,
      options: newAttribute.options.filter((_, i) => i !== index)
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">مدیریت ویژگیها</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>انتخاب دسته بندی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>دسته بندی</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="دسته بندی را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedCategory && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>ایجاد ویژگی جدید برای {categories.find(c => c._id === selectedCategory)?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">نام ویژگی</Label>
                  <Input
                    id="name"
                    value={newAttribute.name}
                    onChange={(e) => setNewAttribute({...newAttribute, name: e.target.value})}
                    placeholder="مثال: رنگ، اندازه، جنس"
                  />
                </div>

                <div>
                  <Label htmlFor="type">نوع ویژگی</Label>
                  <Select 
                    value={newAttribute.type} 
                    onValueChange={(value: 'text' | 'number' | 'select') => 
                      setNewAttribute({...newAttribute, type: value, options: value === 'select' ? [''] : []})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">متن</SelectItem>
                      <SelectItem value="number">عدد</SelectItem>
                      <SelectItem value="select">انتخابی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newAttribute.type === 'select' && (
                  <div>
                    <Label>گزینهها</Label>
                    <div className="space-y-2">
                      {newAttribute.options.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`گزینه ${index + 1}`}
                          />
                          {newAttribute.options.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeOption(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" onClick={addOption}>
                        <Plus className="w-4 h-4 mr-2" />
                        افزودن گزینه
                      </Button>
                    </div>
                  </div>
                )}

                <Button onClick={handleCreateAttributeForCategory} className="w-full">
                  ایجاد ویژگی
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ویژگیهای {categories.find(c => c._id === selectedCategory)?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categoryAttributes.length > 0 ? (
                  categoryAttributes.map((attribute) => (
                    <div key={attribute._id} className="flex items-center justify-between p-3 border rounded bg-blue-50">
                      <div>
                        <span className="font-medium">{attribute.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{attribute.type}</Badge>
                          {attribute.options && (
                            <span className="text-sm text-gray-500">
                              {attribute.options.length} گزینه
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveAttribute(attribute._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    این دسته هنوز ویژگی ندارد. برای ایجاد ویژگی جدید فرم بالا را استفاده کنید.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}