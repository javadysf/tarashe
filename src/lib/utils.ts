import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Global fallback for returnNaN if it's referenced somewhere
if (typeof window !== 'undefined') {
  (window as any).returnNaN = () => 0;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely parse a value to number, handling all edge cases
 * @param value - Value to parse
 * @returns Parsed number or 0 if invalid
 */
function safeParseNumber(value: any): number {
  if (value === null || value === undefined || value === '') {
    return 0
  }
  
  if (typeof value === 'number') {
    return isNaN(value) || !isFinite(value) ? 0 : value
  }
  
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') return 0
    
    // Remove Persian/Arabic digits and replace with English
    const normalized = trimmed
      .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
      .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
    
    const parsed = parseFloat(normalized)
    return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed
  }
  
  // Try to convert to number
  try {
    const num = Number(value)
    return isNaN(num) || !isFinite(num) ? 0 : num
  } catch {
    return 0
  }
}

/**
 * Format price safely, handling NaN, undefined, null, and all edge cases
 * @param price - Price to format
 * @returns Formatted price string in Persian locale, or "0" if invalid
 */
export function formatPrice(price: number | undefined | null | string | any): string {
  try {
    const numPrice = safeParseNumber(price)
    
    // Use try-catch for Intl.NumberFormat in case locale is not available
    try {
      return new Intl.NumberFormat('fa-IR').format(numPrice)
    } catch (localeError) {
      // Fallback to English formatting if Persian locale fails
      return numPrice.toLocaleString('en-US')
    }
  } catch (error) {
    // Ultimate fallback
    console.warn('formatPrice error:', error, 'value:', price)
    return '0'
  }
}