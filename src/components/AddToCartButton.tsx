'use client'

import { useCartStore } from '@/store/cartStore'
import { useState } from 'react'

interface Product {
  id: number
  title: string
  price: number
  image: string
}

interface AddToCartButtonProps {
  product: Product
  quantity?: number
  className?: string
}

export default function AddToCartButton({ product, quantity = 1, className = "" }: AddToCartButtonProps) {
  const { addItem } = useCartStore()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    setIsAdding(true)
    
    // Add multiple items based on quantity
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image
      })
    }
    
    // Show success animation
    setTimeout(() => {
      setIsAdding(false)
    }, 1000)
  }

  return (
    <button 
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-bold text-lg transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <div className="flex items-center justify-center gap-2">
        {isAdding ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            اضافه شد!
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            افزودن به سبد خرید
          </>
        )}
      </div>
    </button>
  )
}