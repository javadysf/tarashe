// API Configuration
export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Client-side: use environment variable
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'
  }
  // Server-side: use environment variable
  return process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3002/api'
}

export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl()
  // Remove trailing slash from baseUrl and leading slash from endpoint
  const cleanBaseUrl = baseUrl.replace(/\/$/, '')
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${cleanBaseUrl}${cleanEndpoint}`
}

// For image URLs (uploads)
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return ''
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // If it's a Cloudinary URL, return as is
  if (imagePath.includes('cloudinary.com') || imagePath.includes('res.cloudinary.com')) {
    return imagePath
  }
  
  // For relative paths, construct full URL
  const baseUrl = getApiBaseUrl()
  // Remove /api from base URL for uploads
  const uploadBaseUrl = baseUrl.replace('/api', '')
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  return `${uploadBaseUrl}${cleanPath}`
}

