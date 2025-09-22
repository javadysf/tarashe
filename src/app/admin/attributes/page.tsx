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
  const [attributes, setAttributes] = useState<Attribute[]>([])
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
    fetchAttributes()
    fetchCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryAttributes(selectedCategory)
    }
  }, [selectedCategory])

  const fetchAttributes = async () => {
    try {
      const response = await api.getAttributes()
      setAttributes(response)
    } catch (error) {
      console.error('Error fetching attributes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories()
      setCategories(response)
    } catch (error) {
      console.error('Error fetching categories:', error)
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

  const handleCreateAttribute = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const attributeData = {
        ...newAttribute,
        options: newAttribute.type === 'select' ? newAttribute.options.filter(opt => opt.trim()) : undefined
      }
      await api.createAttribute(attributeData)
      toast.success('ویژگی با موفقیت ایجاد شد')
      setNewAttribute({ name: '', type: 'text', options: [''] })
      fetchAttributes()
    } catch (error: any) {
      toast.error(error.message || 'خطا در ایجاد ویژگی')
    }
  }

  const handleDeleteAttribute = async (id: string) => {
    if (!confirm('آیا از حذف این ویژگی اطمینان دارید؟')) return
    
    try {
      await api.deleteAttribute(id)
      toast.success('ویژگی حذف شد')
      fetchAttributes()
    } catch (error: any) {
      toast.error(error.message || 'خطا در حذف ویژگی')
    }
  }

  const handleAssignAttribute = async (attributeId: string) => {
    if (!selectedCategory) return
    
    try {
      const currentIds = categoryAttributes.map(attr => attr._id)
      const newIds = [...currentIds, attributeId]
      await api.assignAttributesToCategory(selectedCategory, newIds)
      toast.success('ویژگی به دسته اختصاص داده شد')
      fetchCategoryAttributes(selectedCategory)
    } catch (error: any) {
      toast.error(error.message || 'خطا در اختصاص ویژگی')
    }
  }

  const handleRemoveAttribute = async (attributeId: string) => {
    if (!selectedCategory) return
    
    try {
      const currentIds = categoryAttributes.map(attr => attr._id)
      const newIds = currentIds.filter(id => id !== attributeId)
      await api.assignAttributesToCategory(selectedCategory, newIds)
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ایجاد ویژگی جدید</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAttribute} className="space-y-4">
              <div>
                <Label htmlFor="name">نام ویژگی</Label>
                <Input
                  id="name"
                  value={newAttribute.name}
                  onChange={(e) => setNewAttribute({...newAttribute, name: e.target.value})}
                  placeholder="مثال: رنگ، اندازه، جنس"
                  required
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

              <Button type="submit" className="w-full">
                ایجاد ویژگی
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>لیست ویژگیها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attributes.map((attribute) => (
                <div key={attribute._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{attribute.name}</h3>
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
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAttribute(attribute._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>مدیریت ویژگیهای دستهبندی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>انتخاب دستهبندی</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="دستهبندی را انتخاب کنید" />
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

            {selectedCategory && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">ویژگیهای موجود</h3>
                  <div className="space-y-2">
                    {attributes
                      .filter(attr => !categoryAttributes.find(ca => ca._id === attr._id))
                      .map((attribute) => (
                        <div key={attribute._id} className="flex items-center justify-between p-2 border rounded">
                          <span>{attribute.name}</span>
                          <Button
                            size="sm"
                            onClick={() => handleAssignAttribute(attribute._id)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">ویژگیهای اختصاص داده شده</h3>
                  <div className="space-y-2">
                    {categoryAttributes.map((attribute) => (
                      <div key={attribute._id} className="flex items-center justify-between p-2 border rounded bg-blue-50">
                        <span>{attribute.name}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveAttribute(attribute._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}