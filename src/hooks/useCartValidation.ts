import { useState, useCallback } from 'react'
import { useCartStore } from '@/store/cartStore'
import { toast } from 'react-toastify'

export const useCartValidation = () => {
  const [isValidating, setIsValidating] = useState(false)
  const { validateCart, items } = useCartStore()

  const validateAndProceed = useCallback(async (onSuccess?: (validatedData: any) => void) => {
    if (items.length === 0) {
      toast.error('سبد خرید خالی است')
      return false
    }

    setIsValidating(true)
    
    try {
      const result = await validateCart()
      
      if (result.isValid && result.validatedItems) {
        // Check if prices have changed
        const priceChanged = items.some(item => {
          const validatedItem = result.validatedItems?.find(v => v.id === item.id)
          return validatedItem && validatedItem.price !== item.price
        })
        
        if (priceChanged) {
          toast.warning('قیمت برخی محصولات تغییر کرده است. لطفاً مجدداً بررسی کنید')
        }
        
        onSuccess?.(result)
        return true
      } else {
        toast.error(result.error || 'خطا در اعتبارسنجی سبد خرید')
        return false
      }
    } catch (error) {
      toast.error('خطا در اعتبارسنجی سبد خرید')
      return false
    } finally {
      setIsValidating(false)
    }
  }, [items, validateCart])

  return {
    validateAndProceed,
    isValidating
  }
}