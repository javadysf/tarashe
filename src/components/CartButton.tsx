'use client'

import { useCartStore } from '@/store/cartStore'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import ClientOnly from './ClientOnly'

export default function CartButton() {
  const { toggleCart, getTotalItems } = useCartStore()
  const totalItems = getTotalItems()

  return (
    <ClientOnly>
      <div className='flex border rounded-full w-fit p-4 gap-4'>
        <ShoppingCartIcon className='h-6 w-6'/>
        <span>
          سبد خرید
        </span>
      <button
        onClick={toggleCart}
        className="relative  w-6 h-6 text-center bg-green-300 rounded-full text-black hover:bg-primary-dark transition-colors shadow-lg hover:shadow-xl"
      >
        {totalItems > 0 && 
            totalItems > 99 ? '99+' : totalItems}
      </button>
      </div>
    </ClientOnly>
  )
}