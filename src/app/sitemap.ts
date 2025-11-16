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

  try {
    // Fetch products for dynamic sitemap
    const productsResponse = await api.getProducts({ limit: 1000 })
    const products = productsResponse.products || []

    // Add product pages
    const productRoutes = products.map((product: any) => ({
      url: `${BASE_URL}/products/${product._id || product.id}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Fetch categories for dynamic sitemap
    try {
      const categoriesResponse = await api.getCategories()
      const categories = categoriesResponse.categories || categoriesResponse || []

      // Add category pages
      const categoryRoutes = categories.map((category: any) => ({
        url: `${BASE_URL}/categories/${category._id || category.id}`,
        lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))

      return [...routes, ...productRoutes, ...categoryRoutes]
    } catch (error) {
      // If categories fail, return routes with products
      return [...routes, ...productRoutes]
    }
  } catch (error) {
    // If products fail, return static routes only
    console.error('Error generating sitemap:', error)
    return routes
  }
}

