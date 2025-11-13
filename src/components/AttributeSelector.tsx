'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
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

interface AttributeSelectorProps {
  categoryId?: string
  onAttributeAdd: (attributeId: string) => void
}

export default function AttributeSelector({ categoryId, onAttributeAdd }: AttributeSelectorProps) {
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [categoryAttributes, setCategoryAttributes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedAttribute, setSelectedAttribute] = useState('')

  const fetchAttributes = useCallback(async () => {
    try {
      const response = await api.getAttributes()
      setAttributes(response)
    } catch (error) {
      console.error('Error fetching attributes:', error)
    }
  }, [])

  const fetchCategoryAttributes = useCallback(async (id?: string) => {
    const targetCategoryId = id ?? categoryId
    if (!targetCategoryId) return

    try {
      const response = await api.getCategoryAttributes(targetCategoryId)
      const attributeIds = response
        .map((ca: any) => ca.attribute?._id)
        .filter(Boolean)
      setCategoryAttributes(Array.from(new Set(attributeIds)))
    } catch (error) {
      console.error('Error fetching category attributes:', error)
    }
  }, [categoryId])

  useEffect(() => {
    fetchAttributes()
  }, [fetchAttributes])

  useEffect(() => {
    if (categoryId) {
      fetchCategoryAttributes(categoryId)
    } else {
      setCategoryAttributes([])
    }
  }, [categoryId, fetchCategoryAttributes])

  const handleAddAttribute = async () => {
    if (!selectedAttribute || !categoryId) return

    setLoading(true)
    try {
      await api.assignAttributeToCategory(categoryId, selectedAttribute)
      onAttributeAdd(selectedAttribute)
      setSelectedAttribute('')
      fetchCategoryAttributes(categoryId)
    } catch (error: any) {
      toast.error(error.message || 'خطا در افزودن ویژگی')
    } finally {
      setLoading(false)
    }
  }

  const getAttributeKey = (attr: Attribute) => {
    const normalizedName = attr.name?.trim().toLowerCase()
    if (normalizedName) {
      return `${normalizedName}::${attr.type}`
    }
    return attr._id
  }

  const uniqueAttributes = Array.from(
    attributes.reduce((map, attr) => {
      const key = getAttributeKey(attr)
      if (!map.has(key)) {
        map.set(key, attr)
      }
      return map
    }, new Map<string, Attribute>())
  ).map(([_, value]) => value)

  const availableAttributes = uniqueAttributes.filter(attr => !categoryAttributes.includes(attr._id))

  if (availableAttributes.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        همه ویژگی‌های موجود به این دسته اضافه شده‌اند
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <select
          value={selectedAttribute}
          onChange={(e) => setSelectedAttribute(e.target.value)}
          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
        >
          <option value="">انتخاب ویژگی موجود</option>
          {availableAttributes.map((attr) => (
            <option key={attr._id} value={attr._id}>
              {attr.name} ({attr.type === 'text' ? 'متن' : attr.type === 'number' ? 'عدد' : attr.type === 'select' ? 'انتخابی' : 'بله/خیر'})
            </option>
          ))}
        </select>
        
        <button
          type="button"
          onClick={handleAddAttribute}
          disabled={!selectedAttribute || loading}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mx-auto"></div>
          ) : (
            'افزودن'
          )}
        </button>
      </div>
      
      <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-right">
        {availableAttributes.length} ویژگی موجود برای افزودن
      </p>
    </div>
  )
}