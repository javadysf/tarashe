'use client'

import { useCartStore } from '@/store/cartStore'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import ClientOnly from './ClientOnly'

export default function CartButton() {
  const { toggleCart, getTotalItems } = useCartStore()
  const totalItems = getTotalItems()

  return (
    <ClientOnly>
      <button
        onClick={toggleCart}
        className="relative p-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors shadow-lg hover:shadow-xl"
      >
        <ShoppingCartIcon className="h-6 w-6" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </button>
    </ClientOnly>
  )
}