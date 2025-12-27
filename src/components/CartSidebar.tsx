'use client'

import { useCartStore } from '@/store/cartStore'
import { XMarkIcon, MinusIcon, PlusIcon, TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'

export default function CartSidebar() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore()

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[9998] transition-opacity"
          onClick={toggleCart}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-96 max-w-[90vw] bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-[9999] ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white border-b border-blue-700 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 dark:bg-white/10 rounded-lg">
                <ShoppingBagIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">سبد خرید</h2>
                {items.length > 0 && (
                  <p className="text-xs text-blue-100 dark:text-blue-200 mt-0.5">
                    {items.length} آیتم
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={toggleCart}
              className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800/50">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full mb-6">
                  <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15.5M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">سبد خرید شما خالی است</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">محصولات را به سبد خرید اضافه کنید</p>
                <Link
                  href="/products"
                  onClick={toggleCart}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  <ShoppingBagIcon className="h-5 w-5" />
                  مشاهده محصولات
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="space-y-3">
                    {/* Main Product */}
                    <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={item.image || '/pics/battery.jpg'}
                          alt={item.name || 'محصول'}
                          fill
                          className="object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                          sizes="80px"
                          unoptimized={item.image?.startsWith('data:') || item.image?.startsWith('blob:')}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 text-sm mb-2 leading-tight">
                          {item.name}
                        </h3>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-primary dark:text-blue-400 font-bold text-base">
                            {formatPrice(item.price)} تومان
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatPrice(item.price * item.quantity)} تومان
                          </p>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <MinusIcon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                            </button>
                            <span className="w-10 text-center font-bold text-gray-900 dark:text-gray-100">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-l-lg transition-colors"
                            >
                              <PlusIcon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="حذف از سبد"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Accessories */}
                    {item.accessories && item.accessories.length > 0 && (
                      <div className="mr-4 space-y-2">
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-2 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                          متعلقات:
                        </div>
                        {item.accessories.map((accessory, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {accessory.name}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                تعداد: {accessory.quantity}
                              </div>
                            </div>
                            <div className="text-sm font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">
                              {formatPrice(accessory.price * accessory.quantity)} ت
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">مجموع کل</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {formatPrice(getTotalPrice())} تومان
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link
                  href="/checkout"
                  onClick={toggleCart}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white py-3.5 rounded-xl hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 transition-all duration-200 font-semibold text-center block shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  ادامه و تسویه حساب
                </Link>
                <button
                  onClick={clearCart}
                  className="w-full text-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium border border-gray-200 dark:border-gray-700"
                >
                  پاک کردن سبد خرید
                </button>
              </div>
              
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  {items.reduce((sum, item) => sum + item.quantity, 0)} قلم کالا
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}