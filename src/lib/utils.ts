import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format price safely, handling NaN, undefined, and null values
 * @param price - Price to format
 * @returns Formatted price string in Persian locale, or "0" if invalid
 */
export function formatPrice(price: number | undefined | null): string {
  // Handle undefined, null, or NaN values
  if (price === undefined || price === null || isNaN(price)) {
    return new Intl.NumberFormat('fa-IR').format(0)
  }
  
  // Ensure price is a number
  const numPrice = typeof price === 'number' ? price : parseFloat(String(price))
  
  // Handle invalid parsed values
  if (isNaN(numPrice)) {
    return new Intl.NumberFormat('fa-IR').format(0)
  }
  
  return new Intl.NumberFormat('fa-IR').format(numPrice)
}