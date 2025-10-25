import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartAccessory {
  accessoryId: string
  name: string
  price: number
  quantity: number
  originalPrice: number
  discountedPrice: number
}

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  accessories?: CartAccessory[]
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  isValidating: boolean
  addItem: (product: Omit<CartItem, 'quantity'> & { quantity: number, accessories?: CartAccessory[] }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  validateCart: () => Promise<{ isValid: boolean; validatedItems?: CartItem[]; totalPrice?: number; error?: string }>
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isValidating: false,
      
      addItem: (product) => {
        const items = get().items
        const existingItem = items.find(item => item.id === product.id)
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + product.quantity }
                : item
            )
          })
        } else {
          set({
            items: [...items, { ...product, quantity: product.quantity }]
          })
        }
      },
      
      removeItem: (id) => {
        set({
          items: get().items.filter(item => item.id !== id)
        })
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        
        set({
          items: get().items.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        })
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      toggleCart: () => {
        set({ isOpen: !get().isOpen })
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const itemTotal = item.price * item.quantity
          const accessoriesTotal = item.accessories?.reduce((accTotal, accessory) => 
            accTotal + (accessory.discountedPrice * accessory.quantity), 0) || 0
          return total + itemTotal + accessoriesTotal
        }, 0)
      },
      
      validateCart: async () => {
        const items = get().items
        
        if (items.length === 0) {
          return { isValid: true, validatedItems: [], totalPrice: 0 }
        }
        
        set({ isValidating: true })
        
        try {
          const { api } = await import('@/lib/api')
          const result = await api.validateCart(items)
          
          set({ isValidating: false })
          
          return {
            isValid: result.isValid,
            validatedItems: result.items,
            totalPrice: result.totalPrice
          }
        } catch (error: any) {
          set({ isValidating: false })
          
          return {
            isValid: false,
            error: error.message || 'خطا در اعتبارسنجی سبد خرید'
          }
        }
      }
    }),
    {
      name: 'cart-storage'
    }
  )
)