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
      <button onClick={toggleCart} className='hidden md:flex border rounded-full w-fit p-4 gap-4 hover:bg-gray-50 transition-colors cursor-pointer'>
        <ShoppingCartIcon className='h-6 w-6 max-sm:w-8 max-sm:h-8'/>
        <span>
          سبد خرید
        </span>
        <div className="relative w-6 h-6 text-center bg-green-300 rounded-full text-black transition-colors shadow-lg">
          {totalItems > 0 && 
              totalItems > 99 ? '99+' : totalItems}
        </div>
      </button>
      
      {/* Mobile Version */}
      <button
        onClick={toggleCart}
        className="md:hidden relative p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <ShoppingCartIcon className='h-6 w-6'/>
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </button>
    </ClientOnly>
  )
}