'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface Product {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
  rating: {
    rate: number
    count: number
  }
}

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product?: Product | null
  onSave: (product: Omit<Product, 'id' | 'rating'>) => void
}

export default function ProductModal({ isOpen, onClose, product, onSave }: ProductModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    price: 0,
    description: '',
    category: '',
    image: ''
  })

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        price: product.price,
        description: product.description,
        category: product.category,
        image: product.image
      })
    } else {
      setFormData({
        title: '',
        price: 0,
        description: '',
        category: '',
        image: ''
      })
    }
  }, [product, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const categories = [
    "men's clothing",
    "women's clothing", 
    "jewelery",
    "electronics"
  ]

  const translateCategory = (category: string) => {
    const translations: { [key: string]: string } = {
      "men's clothing": "پوشاک مردانه",
      "women's clothing": "پوشاک زنانه",
      "jewelery": "جواهرات",
      "electronics": "الکترونیک"
    }
    return translations[category] || category
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-right">
            {product ? 'ویرایش محصول' : 'افزودن محصول جدید'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-right block">نام محصول</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="نام محصول را وارد کنید"
                required
                className="text-right"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-right block">قیمت (دلار)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                placeholder="قیمت محصول"
                required
                className="text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-right block">دستهبندی</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm text-right"
                required
              >
                <option value="">انتخاب دستهبندی</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {translateCategory(category)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-right block">لینک تصویر</label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                placeholder="https://example.com/image.jpg"
                required
                className="text-right"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-right block">توضیحات</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="توضیحات محصول را وارد کنید"
              rows={4}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm text-right resize-none"
              required
            />
          </div>

          {formData.image && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-right block">پیش‌نمایش تصویر</label>
              <div className="flex justify-center">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.png'
                  }}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              لغو
            </Button>
            <Button type="submit">
              {product ? 'ویرایش محصول' : 'افزودن محصول'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}