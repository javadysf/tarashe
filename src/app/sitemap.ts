import { MetadataRoute } from 'next'
import { api } from '@/lib/api'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tarasheh.net'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // In build time, API might not be available, so return static routes
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_URL) {
    return routes
  }

  let productRoutes: MetadataRoute.Sitemap = []
  let categoryRoutes: MetadataRoute.Sitemap = []

  // Fetch products for dynamic sitemap
  try {
    const productsResponse = await api.getProducts({ limit: 1000 })
    const products = productsResponse?.products || []

    // Add product pages
    productRoutes = products.map((product: any) => ({
      url: `${BASE_URL}/products/${product._id || product.id}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch (error) {
    // Silently handle products fetch error - continue with static routes
  }

  // Fetch categories for dynamic sitemap
  try {
    const categoriesResponse = await api.getCategories()
    const categories = categoriesResponse?.categories || categoriesResponse || []

    // Add category pages
    categoryRoutes = categories.map((category: any) => ({
      url: `${BASE_URL}/categories/${category._id || category.id}`,
      lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    // Silently handle categories fetch error - continue with available routes
  }

  // Return all available routes (static + dynamic if fetched successfully)
  return [...routes, ...productRoutes, ...categoryRoutes]
}

