'use client'

import { useCartStore } from '@/store/cartStore'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import ClientOnly from './ClientOnly'

export default function CartButton() {
  const { toggleCart, getTotalItems } = useCartStore()
  const totalItems = getTotalItems()

  return (
    <ClientOnly>
      {/* Desktop Version */}
      <button 
        onClick={toggleCart} 
        className='hidden md:flex items-center border border-gray-300 dark:border-gray-600 rounded-full w-fit px-5 py-3 gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md group'
      >
        <div className="relative">
          <ShoppingCartIcon className='h-6 w-6 max-sm:w-8 max-sm:h-8 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'/>
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 dark:from-red-600 dark:to-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </div>
        <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          سبد خرید
        </span>
      </button>
      
      {/* Mobile Version */}
      <button
        onClick={toggleCart}
        className="md:hidden relative p-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <ShoppingCartIcon className='h-6 w-6'/>
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 dark:from-red-600 dark:to-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </button>
    </ClientOnly>
  )
}