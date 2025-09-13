'use client'

import { useCartStore } from '@/store/cartStore'
import { XMarkIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function CartSidebar() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price)
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
          onClick={toggleCart}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 z-[9999] ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">سبد خرید</h2>
            <button
              onClick={toggleCart}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15.5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
                  </svg>
                </div>
                <p className="text-gray-500">سبد خرید شما خالی است</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 line-clamp-2 text-sm mb-2">
                        {item.name}
                      </h3>
                      <p className="text-primary font-bold text-sm">
                        {formatPrice(item.price)} تومان
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-6 space-y-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>مجموع:</span>
                <span className="text-primary">{formatPrice(getTotalPrice())} تومان</span>
              </div>
              
              <div className="space-y-3">
                <Link
                  href="/checkout"
                  onClick={toggleCart}
                  className="w-full bg-primary text-white py-3 rounded-xl hover:bg-primary-dark transition-colors font-medium text-center block"
                >
                  تسویه حساب
                </Link>
                <button
                  onClick={clearCart}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  پاک کردن سبد
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}