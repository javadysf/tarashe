'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { toast } from 'react-toastify'
import { Heart } from 'lucide-react'
import ShareButton from '@/components/ShareButton'
import AccessorySelector from '@/components/AccessorySelector'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  brand: string | { _id: string; name: string; image?: string }
  model: string
  stock: number
  images: { url: string; alt: string }[]
  rating: { average: number; count: number }
  category: { _id: string; name: string }
  specifications: { key: string; value: string }[]
  attributes: { [key: string]: string }
}

interface Review {
  _id: string
  user: { name: string } | null
  rating: number
  comment: string
  createdAt: string
  replies?: Review[]
  likesCount?: number
  dislikesCount?: number
  isAdminReply?: boolean
}

export default function ProductDetailPage() {
  const params = useParams()
  const { user } = useAuthStore()
  const { addItem, toggleCart } = useCartStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [productAttributes, setProductAttributes] = useState<any[]>([])
  const [categoryInfo, setCategoryInfo] = useState<any | null>(null)
  const [parentCategoryInfo, setParentCategoryInfo] = useState<any | null>(null)
  const [attributeNames, setAttributeNames] = useState<{[key: string]: string}>({})
  const [isFavorite, setIsFavorite] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [viewsCount, setViewsCount] = useState(0)
  const [accessories, setAccessories] = useState<any[]>([])
  const [showAccessorySelector, setShowAccessorySelector] = useState(false)

  const fetchProductStats = useCallback(async (id: string) => {
    try {
      const likesResponse = await api.getProductLikesCount(id)
      setLikesCount(likesResponse.count || 0)
    } catch (error) {
      console.error('Error fetching product stats:', error)
    }
  }, [])

  const fetchReviews = useCallback(async (productId: string) => {
    try {
      const response = await api.getProductReviews(productId)
      setReviews(response.reviews || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }, [])

  const fetchProductAccessories = useCallback(async (productId: string) => {
    try {
      const response = await api.getProductAccessories(productId)
      setAccessories(response.accessories || [])
    } catch (error) {
      // Silently handle if accessories endpoint doesn't exist
      setAccessories([])
    }
  }, [])

  const fetchRelatedProducts = useCallback(async (categoryId: string, currentProductId: string) => {
    try {
      let relatedProducts: Product[] = []
      
      // Get current category info to understand hierarchy
      const currentCategory = await api.getCategory(categoryId)
      if (!currentCategory) {
        console.error('Category not found')
        return
      }
      
      // Priority 1: Same level (current category)
      try {
        const sameLevelResponse = await api.getProducts({ category: categoryId, limit: 8 })
        const sameLevelFiltered = sameLevelResponse.products.filter((p: Product) => p._id !== currentProductId)
        relatedProducts = [...relatedProducts, ...sameLevelFiltered]
      } catch (error) {
        console.error('Error fetching same level products:', error)
      }
      
      // If we don't have enough products, try parent level
      if (relatedProducts.length < 4 && currentCategory.parent) {
        try {
          const parentResponse = await api.getProducts({ category: currentCategory.parent, limit: 8 })
          const parentFiltered = parentResponse.products.filter((p: Product) => 
            p._id !== currentProductId && !relatedProducts.some(rp => rp._id === p._id)
          )
          relatedProducts = [...relatedProducts, ...parentFiltered]
        } catch (error) {
          console.error('Error fetching parent level products:', error)
        }
      }
      
      // If we still don't have enough products, try grandparent level
      if (relatedProducts.length < 4 && currentCategory.parent) {
        try {
          const parentCategory = await api.getCategory(currentCategory.parent)
          if (parentCategory && parentCategory.parent) {
            const grandparentResponse = await api.getProducts({ category: parentCategory.parent, limit: 8 })
            const grandparentFiltered = grandparentResponse.products.filter((p: Product) => 
              p._id !== currentProductId && !relatedProducts.some(rp => rp._id === p._id)
            )
            relatedProducts = [...relatedProducts, ...grandparentFiltered]
          }
        } catch (error) {
          console.error('Error fetching grandparent level products:', error)
        }
      }
      
      // If we still don't have enough products, try root level (level 1)
      if (relatedProducts.length < 4) {
        try {
          // Find root category by traversing up the hierarchy
          let rootCategory = currentCategory
          while (rootCategory.parent) {
            const parent = await api.getCategory(rootCategory.parent)
            if (parent) {
              rootCategory = parent
            } else {
              break
            }
          }
          
          if (rootCategory._id !== categoryId) {
            const rootResponse = await api.getProducts({ category: rootCategory._id, limit: 8 })
            const rootFiltered = rootResponse.products.filter((p: Product) => 
              p._id !== currentProductId && !relatedProducts.some(rp => rp._id === p._id)
            )
            relatedProducts = [...relatedProducts, ...rootFiltered]
          }
        } catch (error) {
          console.error('Error fetching root level products:', error)
        }
      }
      
      // Set final related products (max 4)
      setRelatedProducts(relatedProducts.slice(0, 4))
    } catch (error) {
      console.error('Error fetching related products:', error)
    }
  }, [])

  const fetchProductAttributes = useCallback(async (categoryId: string, productData?: any) => {
    try {
      const response = await api.getCategoryAttributes(categoryId)
      setProductAttributes(response)
      
      // Create a mapping of attribute IDs to names
      const nameMap: {[key: string]: string} = {}
      response.forEach((categoryAttr: any) => {
        if (categoryAttr.attribute && categoryAttr.attribute._id) {
          nameMap[categoryAttr.attribute._id] = categoryAttr.attribute.name
        }
      })
      
      // If we have product attributes but some are missing from category attributes,
      // fetch all attributes to get missing names
      const currentProduct = productData || product
      if (currentProduct && currentProduct.attributes) {
        const missingIds = Object.keys(currentProduct.attributes).filter(key => 
          /^[0-9a-fA-F]{24}$/.test(key) && !nameMap[key]
        )
        
        if (missingIds.length > 0) {
          try {
            const allAttributes = await api.getAttributes()
            allAttributes.forEach((attr: any) => {
              if (missingIds.includes(attr._id)) {
                nameMap[attr._id] = attr.name
              }
            })
          } catch (error) {
            console.error('Error fetching all attributes:', error)
          }
        }
      }
      
      setAttributeNames(nameMap)
    } catch (error) {
      console.error('Error fetching product attributes:', error)
    }
  }, [product])

  const fetchProduct = useCallback(async (id: string) => {
    try {
      const response = await api.getProduct(id)
      setProduct(response)
      
      // Check if user has liked this product
      if (user) {
        try {
          const likedProducts = await api.getLikedProducts()
          const isLiked = likedProducts.products?.some((p: any) => p._id === id)
          setIsFavorite(isLiked || false)
        } catch (error) {
          console.error('Error checking like status:', error)
        }
      }
      
      fetchReviews(id)
      fetchRelatedProducts(response.category._id, id)
      fetchProductAccessories(id)
      if (response.category._id) {
        await fetchProductAttributes(response.category._id, response)
        try {
          const cat = await api.getCategory(response.category._id)
          setCategoryInfo(cat)
          if (cat?.parent) {
            const parent = await api.getCategory(cat.parent)
            setParentCategoryInfo(parent)
          } else {
            setParentCategoryInfo(null)
          }
        } catch (e) {
          // ignore
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }, [fetchProductAccessories, fetchProductAttributes, fetchRelatedProducts, fetchReviews, user])

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
      fetchProductStats(params.id as string)
    }
  }, [fetchProduct, fetchProductStats, params.id])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('برای ثبت نظر وارد شوید')
      return
    }
    
    setSubmittingReview(true)
    try {
      await api.createReview(product!._id, newReview)
      toast.success('نظر شما با موفقیت ثبت شد!')
      setNewReview({ rating: 5, comment: '' })
      fetchReviews(product!._id)
    } catch (error: any) {
      toast.error(error.message || 'خطا در ثبت نظر')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    
    // If product has accessories, show selector first
    if (accessories.length > 0) {
      setShowAccessorySelector(true)
      return
    }
    
    // Otherwise add directly to cart
    addProductToCart()
  }

  const addProductToCart = () => {
    if (!product) return
    
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || '/pics/battery.jpg',
      quantity
    })
    
    const toastContent = (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2px' }}>
        <div style={{ flex: 1, textAlign: 'right', marginBottom: '12px' }}>
          <div style={{ fontWeight: '600', color: 'white', marginBottom: '4px' }}>
            محصول به سبد اضافه شد
          </div>
          <div style={{ fontSize: '14px', color: 'red' }}>
            {quantity} عدد {product.name}
          </div>
        </div>
        <button
          onClick={() => {
            toast.dismiss()
            toggleCart()
          }}
          style={{
            backgroundColor: '#16a34a',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          🛒 <span style={{ marginRight: '6px' }}>مشاهده سبد</span>
        </button>
      </div>
    )

    toast.success(toastContent, {
      position: 'top-center',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
    })
  }

  const handleAccessorySelection = (selectedAccessories: any[]) => {
    // Add main product to cart
    addProductToCart()
    
    // Add selected accessories to cart
    selectedAccessories.forEach(accessory => {
      addItem({
        id: accessory.accessoryId,
        name: accessory.name,
        price: accessory.discountedPrice,
        image: '/pics/battery.jpg', // Default image for accessories
        quantity: accessory.quantity
      })
    })
    
    setShowAccessorySelector(false)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price)
  }

  const brandName = typeof product?.brand === 'string' ? product?.brand : product?.brand?.name

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">محصول یافت نشد</h1>
          <p className="text-gray-600 dark:text-gray-400">محصول مورد نظر وجود ندارد یا حذف شده است</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 py-4 sm:py-6 md:py-8">
        {/* Breadcrumbs */}
        <nav className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <li>
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 text-xs sm:text-sm">
                خانه
              </Link>
            </li>
            {parentCategoryInfo && (
              <>
                <li>›</li>
                <li>
                  <Link
                    href={`/products?category=${parentCategoryInfo._id}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {parentCategoryInfo.name}
                  </Link>
                </li>
              </>
            )}
            {categoryInfo && (
              <>
                <li>›</li>
                <li>
                  <Link
                    href={`/products?category=${categoryInfo._id}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {categoryInfo.name}
                  </Link>
                </li>
              </>
            )}
            <li>›</li>
            <li className="text-gray-700 dark:text-gray-300">{product.name}</li>
          </ol>
        </nav>
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
                <Image
                  src={product.images[selectedImage]?.url || '/pics/battery.jpg'}
                  alt={product.images[selectedImage]?.alt || product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {product.images.length > 1 && (
                <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Image
                        src={image.url}
                        alt={image.alt}
                        width={80}
                        height={80}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs sm:text-sm font-medium px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
                    {product.category.name}
                  </span>
                  {brandName && (
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs sm:text-sm font-medium px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
                      {brandName}
                    </span>
                  )}
                <button
                  onClick={async () => {
                    if (!user) {
                      toast.info('برای پسندیدن وارد شوید')
                      return
                    }
                    try {
                      if (isFavorite) {
                        await api.unlikeProduct(product._id)
                        setIsFavorite(false)
                        toast.success('از پسندیده‌ها حذف شد')
                      } else {
                        await api.likeProduct(product._id)
                        setIsFavorite(true)
                        toast.success('به پسندیده‌ها اضافه شد')
                      }
                    } catch (e: any) {
                      toast.error(e?.message || 'خطا در ثبت پسند')
                    }
                  }}
                  className={`ml-auto inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border ${isFavorite ? 'bg-red-500 text-white border-red-500' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'} hover:shadow`}
                  aria-label="like"
                  title="پسندیدن"
                >
                  <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                </div>
                
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1.5 sm:mb-2 leading-tight">{product.name}</h1>
                
                {product.model && (
                  <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400">مدل: {product.model}</p>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ${
                        i < Math.floor(product.rating.average) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  ({product.rating.average.toFixed(1)}) • {reviews.length || product.rating.count} نظر
                </span>
              </div>

              {/* Price */}
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap">
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(product.price)} تومان
                  </span>
                  {product.originalPrice && (
                    <span className="text-base sm:text-lg md:text-xl text-gray-500 dark:text-gray-400 line-through">
                      {formatPrice(product.originalPrice)} تومان
                    </span>
                  )}
                </div>
                
                {product.originalPrice && (
                  <div className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% تخفیف
                  </div>
                )}
              </div>

              {/* Stock & Share */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className={`inline-flex px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-full text-xs sm:text-sm font-medium ${
                  product.stock > 0 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                }`}>
                  <span className="hidden sm:inline">{product.stock > 0 ? `موجود در انبار (${product.stock} عدد)` : 'ناموجود'}</span>
                  <span className="sm:hidden">{product.stock > 0 ? `موجود (${product.stock})` : 'ناموجود'}</span>
                </div>
                
                <ShareButton
                  productName={product.name}
                  productUrl={`/products/${product._id}`}
                  productImage={product.images[0]?.url}
                  productPrice={product.price}
                />
              </div>

              {/* Quantity & Add to Cart */}
              {product.stock > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">تعداد:</label>
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm sm:text-base"
                      >
                        -
                      </button>
                      <span className="px-3 py-1.5 sm:px-4 sm:py-2 border-x border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm sm:text-base">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm sm:text-base"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors font-medium text-sm sm:text-base md:text-lg"
                  >
                    افزودن به سبد خرید
                  </button>
                </div>
              )}


              {/* Description */}
              <div className="border-t dark:border-gray-700 pt-4 sm:pt-5 md:pt-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">توضیحات محصول</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>
              </div>

              {/* Dynamic Attributes - Table */}
              {product.attributes && Object.keys(product.attributes).length > 0 && (
                <div className="border-t dark:border-gray-700 pt-4 sm:pt-5 md:pt-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">جدول مشخصات</h3>
                  <div className="overflow-hidden rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm min-w-full">
                      <tbody>
                        {Object.entries(product.attributes).map(([key, value]: [string, any]) => {
                          if (!value || value === '') return null
                          
                          // Check if key is an ObjectId (24 character hex string)
                          const isObjectId = /^[0-9a-fA-F]{24}$/.test(key)
                          let attributeName = key
                          
                          if (isObjectId) {
                            // Key is an ObjectId, try to get name from mapping
                            attributeName = attributeNames[key] || key
                          } else {
                            // Key is already a readable name
                            attributeName = key
                          }
                          
                          return (
                            <tr key={key} className="odd:bg-white dark:odd:bg-gray-800 even:bg-gray-50 dark:even:bg-gray-700/50">
                              <td className="w-1/3 text-gray-600 dark:text-gray-400 px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3 font-medium text-xs sm:text-sm">{attributeName}</td>
                              <td className="px-2 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3 text-gray-900 dark:text-gray-100 text-xs sm:text-sm">{value}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Specifications */}
              {product.specifications && product.specifications.length > 0 && (
                <div className="border-t dark:border-gray-700 pt-4 sm:pt-5 md:pt-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">مشخصات فنی</h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    {product.specifications.map((spec, index) => (
                      <div key={index} className="flex justify-between py-1.5 sm:py-2 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{spec.key}:</span>
                        <span className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100 text-left">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg mt-4 sm:mt-6 md:mt-8 p-4 sm:p-5 md:p-6 lg:p-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-5 md:mb-6">نظرات کاربران</h2>
          
          {/* Add Review Form */}
          {user && (
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">نظر خود را بنویسید</h3>
              <form onSubmit={handleSubmitReview} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">امتیاز:</label>
                  <div className="flex gap-0.5 sm:gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({...newReview, rating: star})}
                        className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                      >
                        <svg fill="currentColor" viewBox="0 0 20 20" className="w-full h-full">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">نظر:</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    rows={3}
                    className="w-full px-2.5 py-2 sm:px-3 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    placeholder="نظر خود را بنویسید..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 text-xs sm:text-sm md:text-base"
                >
                  {submittingReview ? 'در حال ثبت...' : 'ثبت نظر'}
                </button>
              </form>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-200 dark:border-gray-700 pb-4 sm:pb-5 md:pb-6">
                  <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs sm:text-sm">
                          {review.user?.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-xs sm:text-sm md:text-base truncate">{review.user?.name || 'کاربر ناشناس'}</h4>
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {new Date(review.createdAt).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-2 sm:mb-3">{review.comment}</p>
                  
                  {/* Like/Dislike buttons */}
                  {user && (
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3">
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          try {
                            await api.likeReview(review._id)
                            fetchReviews(product!._id)
                          } catch (error: any) {
                            toast.error(error.message || 'خطا در لایک')
                          }
                        }}
                        className="flex items-center gap-1 px-1.5 py-1 sm:px-2 sm:py-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors cursor-pointer"
                      >
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        <span className="text-xs sm:text-sm">{(review as any).likesCount || 0}</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          try {
                            await api.dislikeReview(review._id)
                            fetchReviews(product!._id)
                          } catch (error: any) {
                            toast.error(error.message || 'خطا در دیسلایک')
                          }
                        }}
                        className="flex items-center gap-1 px-1.5 py-1 sm:px-2 sm:py-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                      >
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                        </svg>
                        <span className="text-xs sm:text-sm">{(review as any).dislikesCount || 0}</span>
                      </button>
                    </div>
                  )}
                  
                  {/* Admin replies */}
                  {(review as any).replies && (review as any).replies.length > 0 && (
                    <div className="mr-4 sm:mr-6 md:mr-8 mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                      {(review as any).replies.map((reply: any) => (
                        <div key={reply._id} className="bg-blue-50 dark:bg-blue-900/30 p-2 sm:p-3 rounded-lg">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-[10px] sm:text-xs font-semibold">
                                {reply.user?.name?.charAt(0) || '?'}
                              </span>
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300 truncate">{reply.user?.name || 'کاربر ناشناس'}</span>
                            <span className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 bg-blue-200 dark:bg-blue-800 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full flex-shrink-0">پاسخ ادمین</span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{reply.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">هنوز نظری ثبت نشده است</p>
                {!user && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    برای ثبت نظر <a href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:underline">وارد شوید</a>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Accessories Section */}
        {accessories.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg mt-4 sm:mt-6 md:mt-8 p-4 sm:p-5 md:p-6 lg:p-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-5 md:mb-6">متعلقات این محصول</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {accessories.slice(0, 4).map((accessory) => {
                const originalPrice = accessory.accessory.price
                const discountAmount = (originalPrice * accessory.bundleDiscount) / 100
                const discountedPrice = originalPrice - discountAmount
                
                return (
                  <div key={accessory.accessory._id} className="group border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 hover:shadow-lg transition-all duration-300">
                    <a href={`/products/${accessory.accessory._id}`} className="block">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg sm:rounded-xl overflow-hidden mb-2 sm:mb-3 md:mb-4 aspect-square">
                        <Image
                          src={accessory.accessory.images[0]?.url || '/pics/battery.jpg'}
                          alt={accessory.accessory.name}
                          width={300}
                          height={300}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      
                      <div className="space-y-1.5 sm:space-y-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-xs sm:text-sm md:text-base">
                          {accessory.accessory.name}
                        </h3>
                        
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          {accessory.bundleDiscount > 0 ? (
                            <>
                              <span className="text-sm sm:text-base md:text-lg font-bold text-blue-600 dark:text-blue-400">
                                {formatPrice(discountedPrice)}
                              </span>
                              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-through">
                                {formatPrice(originalPrice)}
                              </span>
                              <span className="text-[10px] sm:text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                                {accessory.bundleDiscount}%
                              </span>
                            </>
                          ) : (
                            <span className="text-sm sm:text-base md:text-lg font-bold text-blue-600 dark:text-blue-400">
                              {formatPrice(originalPrice)}
                            </span>
                          )}
                        </div>
                        
                        {accessory.isSuggested && (
                          <div className="inline-flex px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                            پیشنهادی
                          </div>
                        )}
                      </div>
                    </a>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        addItem({
                          id: accessory.accessory._id,
                          name: accessory.accessory.name,
                          price: discountedPrice,
                          image: accessory.accessory.images[0]?.url || '/pics/battery.jpg',
                          quantity: 1
                        })
                        toast.success('متعلق به سبد اضافه شد')
                      }}
                      className="w-full mt-2 sm:mt-3 bg-blue-600 dark:bg-blue-700 text-white py-1.5 px-2 sm:py-2 sm:px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors text-xs sm:text-sm font-medium"
                    >
                      افزودن به سبد
                    </button>
                  </div>
                )
              })}
            </div>
            
            {accessories.length > 4 && (
              <div className="text-center mt-4 sm:mt-5 md:mt-6">
                <button
                  onClick={() => setShowAccessorySelector(true)}
                  className="inline-flex items-center gap-1.5 sm:gap-2 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors font-medium text-xs sm:text-sm md:text-base"
                >
                  مشاهده همه متعلقات ({accessories.length})
                </button>
              </div>
            )}
          </div>
        )}

        {/* Related Products Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg mt-4 sm:mt-6 md:mt-8 p-4 sm:p-5 md:p-6 lg:p-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-5 md:mb-6">محصولات مشابه</h2>
          
          {relatedProducts.length > 0 ? (
            <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct._id} className="group">
                  <a href={`/products/${relatedProduct._id}`} className="block">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg sm:rounded-xl overflow-hidden mb-2 sm:mb-3 md:mb-4 aspect-square">
                      <Image
                        src={relatedProduct.images[0]?.url || '/pics/battery.jpg'}
                        alt={relatedProduct.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    <div className="space-y-1.5 sm:space-y-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 text-xs sm:text-sm md:text-base">
                        {relatedProduct.name}
                      </h3>
                      
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 ${
                              i < Math.floor(relatedProduct.rating.average) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mr-0.5 sm:mr-1">({relatedProduct.rating.count})</span>
                      </div>
                      
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        <span className="text-sm sm:text-base md:text-lg font-bold text-blue-600 dark:text-blue-400">
                          {formatPrice(relatedProduct.price)}
                        </span>
                        {relatedProduct.originalPrice && (
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-through">
                            {formatPrice(relatedProduct.originalPrice)}
                          </span>
                        )}
                      </div>
                      
                      <div className={`inline-flex px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                        relatedProduct.stock > 0 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}>
                        {relatedProduct.stock > 0 ? 'موجود' : 'ناموجود'}
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-4 sm:mt-6 md:mt-8">
              <a
                href={`/products?category=${product?.category?._id}`}
                className="inline-flex items-center gap-1.5 sm:gap-2 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors font-medium text-xs sm:text-sm md:text-base"
              >
                <span className="hidden sm:inline">مشاهده همه محصولات {product?.category.name}</span>
                <span className="sm:hidden">مشاهده همه</span>
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </a>
            </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">محصول مشابهی یافت نشد</p>
            </div>
          )}
        </div>

        {/* Accessory Selector Modal */}
        <AccessorySelector
          accessories={accessories}
          isOpen={showAccessorySelector}
          onClose={() => setShowAccessorySelector(false)}
          onAddToCart={handleAccessorySelection}
          productName={product.name}
        />
      </div>
    </div>
  )
}