'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { api } from '@/lib/api'
import Head from 'next/head'
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
  user: { name: string }
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

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
      fetchProductStats(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
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
        // Fetch product attributes after setting the product
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
  }

  const fetchProductStats = async (id: string) => {
    try {
      const likesResponse = await api.getProductLikesCount(id)
      setLikesCount(likesResponse.count || 0)
    } catch (error) {
      console.error('Error fetching product stats:', error)
    }
  }

  const fetchProductAttributes = async (categoryId: string, productData?: any) => {
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
          console.log('Missing attribute IDs:', missingIds)
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
      
      console.log('Final attribute names mapping:', nameMap)
      setAttributeNames(nameMap)
    } catch (error) {
      console.error('Error fetching product attributes:', error)
    }
  }

  const fetchRelatedProducts = async (categoryId: string, currentProductId: string) => {
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
        console.log('Same level products found:', sameLevelFiltered.length)
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
          console.log('Parent level products found:', parentFiltered.length)
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
            console.log('Grandparent level products found:', grandparentFiltered.length)
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
            console.log('Root level products found:', rootFiltered.length)
          }
        } catch (error) {
          console.error('Error fetching root level products:', error)
        }
      }
      
      // Set final related products (max 4)
      setRelatedProducts(relatedProducts.slice(0, 4))
      console.log('Final related products:', relatedProducts.slice(0, 4))
    } catch (error) {
      console.error('Error fetching related products:', error)
    }
  }

  const fetchReviews = async (productId: string) => {
    try {
      const response = await api.getProductReviews(productId)
      setReviews(response.reviews || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const fetchProductAccessories = async (productId: string) => {
    try {
      const response = await api.getProductAccessories(productId)
      setAccessories(response.accessories || [])
    } catch (error) {
      // Silently handle if accessories endpoint doesn't exist
      setAccessories([])
    }
  }

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
      <div style={{ display: 'flex', flexDirection:'column',alignItems:'center', gap: '12px', padding: '2px' }}>
        <div style={{ flex: 1, textAlign: 'right' }}>
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
            alignItems: 'center',
            gap: '6px'
          }}
        >
          🛒 مشاهده سبد
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">محصول یافت نشد</h1>
          <p className="text-gray-600">محصول مورد نظر وجود ندارد یا حذف شده است</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta + JSON-LD */}
      <Head>
        <title>{product.name} | تراشه</title>
        <meta name="description" content={product.description?.slice(0, 150)} />
        <meta property="og:title" content={`${product.name} | تراشه`} />
        <meta property="og:description" content={product.description?.slice(0, 150)} />
        <meta property="og:type" content="product" />
        <meta property="og:image" content={product.images?.[0]?.url} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: product.name,
              image: product.images?.map(i => i.url).filter(Boolean),
              description: product.description,
              brand: typeof (product.brand as any) === 'string' ? { '@type': 'Brand', name: product.brand } : { '@type': 'Brand', name: (product.brand as any)?.name },
              category: categoryInfo?.name,
              aggregateRating: product.rating?.average ? {
                '@type': 'AggregateRating',
                ratingValue: product.rating.average,
                reviewCount: product.rating.count || reviews.length
              } : undefined,
              offers: {
                '@type': 'Offer',
                priceCurrency: 'IRR',
                price: product.price,
                availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
              }
            })
          }}
        />
      </Head>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 flex-wrap">
            <li><a href="/" className="hover:text-blue-600">خانه</a></li>
            {parentCategoryInfo && (
              <>
                <li>›</li>
                <li><a href={`/products?category=${parentCategoryInfo._id}`} className="hover:text-blue-600">{parentCategoryInfo.name}</a></li>
              </>
            )}
            {categoryInfo && (
              <>
                <li>›</li>
                <li><a href={`/products?category=${categoryInfo._id}`} className="hover:text-blue-600">{categoryInfo.name}</a></li>
              </>
            )}
            <li>›</li>
            <li className="text-gray-700">{product.name}</li>
          </ol>
        </nav>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <Image
                  src={product.images[selectedImage]?.url || '/pics/battery.jpg'}
                  alt={product.images[selectedImage]?.alt || product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-blue-500' : 'border-gray-200'
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
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    {product.category.name}
                  </span>
                  {brandName && (
                    <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
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
                  className={`ml-auto inline-flex items-center justify-center w-10 h-10 rounded-full border ${isFavorite ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-200'} hover:shadow`}
                  aria-label="like"
                  title="پسندیدن"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                
                {product.model && (
                  <p className="text-lg text-gray-600">مدل: {product.model}</p>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating.average) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({product.rating.average.toFixed(1)}) • {reviews.length || product.rating.count} نظر
                </span>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-blue-600">
                    {formatPrice(product.price)} تومان
                  </span>
                  {product.originalPrice && (
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.originalPrice)} تومان
                    </span>
                  )}
                </div>
                
                {product.originalPrice && (
                  <div className="text-sm text-green-600 font-medium">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% تخفیف
                  </div>
                )}
              </div>

              {/* Stock & Share */}
              <div className="flex items-center justify-between">
                <div className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${
                  product.stock > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock > 0 ? `موجود در انبار (${product.stock} عدد)` : 'ناموجود'}
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
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">تعداد:</label>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 text-gray-600 hover:text-gray-800"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-3 py-2 text-gray-600 hover:text-gray-800"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                  >
                    افزودن به سبد خرید
                  </button>
                </div>
              )}


              {/* Description */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">توضیحات محصول</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Dynamic Attributes - Table */}
              {product.attributes && Object.keys(product.attributes).length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">جدول مشخصات</h3>
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <table className="w-full text-sm">
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
                          
                          console.log(`Attribute key: ${key}, isObjectId: ${isObjectId}, name: ${attributeName}, value: ${value}`)
                          return (
                            <tr key={key} className="odd:bg-white even:bg-gray-50">
                              <td className="w-1/3 text-gray-600 px-4 py-3 font-medium">{attributeName}</td>
                              <td className="px-4 py-3 text-gray-900">{value}</td>
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
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">مشخصات فنی</h3>
                  <div className="space-y-2">
                    {product.specifications.map((spec, index) => (
                      <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">{spec.key}:</span>
                        <span className="font-medium text-gray-900">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-lg mt-8 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">نظرات کاربران</h2>
          
          {/* Add Review Form */}
          {user && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">نظر خود را بنویسید</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">امتیاز:</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({...newReview, rating: star})}
                        className={`w-8 h-8 ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نظر:</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="نظر خود را بنویسید..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submittingReview ? 'در حال ثبت...' : 'ثبت نظر'}
                </button>
              </form>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-200 pb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {review.user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{review.user.name}</h4>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
                  
                  {/* Like/Dislike buttons */}
                  {user && (
                    <div className="flex items-center gap-4 mb-3">
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
                        className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        <span>{(review as any).likesCount || 0}</span>
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
                        className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                        </svg>
                        <span>{(review as any).dislikesCount || 0}</span>
                      </button>
                    </div>
                  )}
                  
                  {/* Admin replies */}
                  {(review as any).replies && (review as any).replies.length > 0 && (
                    <div className="mr-8 mt-4 space-y-3">
                      {(review as any).replies.map((reply: any) => (
                        <div key={reply._id} className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">
                                {reply.user.name.charAt(0)}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-blue-700">{reply.user.name}</span>
                            <span className="text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded-full">پاسخ ادمین</span>
                          </div>
                          <p className="text-sm text-gray-700">{reply.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">هنوز نظری ثبت نشده است</p>
                {!user && (
                  <p className="text-sm text-gray-400 mt-2">
                    برای ثبت نظر <a href="/auth/login" className="text-blue-600 hover:underline">وارد شوید</a>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Accessories Section */}
        {accessories.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg mt-8 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">متعلقات این محصول</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {accessories.slice(0, 4).map((accessory) => {
                const originalPrice = accessory.accessory.price
                const discountAmount = (originalPrice * accessory.bundleDiscount) / 100
                const discountedPrice = originalPrice - discountAmount
                
                return (
                  <div key={accessory.accessory._id} className="group border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                    <a href={`/products/${accessory.accessory._id}`} className="block">
                      <div className="bg-gray-100 rounded-xl overflow-hidden mb-4 aspect-square">
                        <Image
                          src={accessory.accessory.images[0]?.url || '/pics/battery.jpg'}
                          alt={accessory.accessory.name}
                          width={300}
                          height={300}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {accessory.accessory.name}
                        </h3>
                        
                        <div className="flex items-center gap-2">
                          {accessory.bundleDiscount > 0 ? (
                            <>
                              <span className="text-lg font-bold text-blue-600">
                                {formatPrice(discountedPrice)} تومان
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(originalPrice)}
                              </span>
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                {accessory.bundleDiscount}% تخفیف
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-blue-600">
                              {formatPrice(originalPrice)} تومان
                            </span>
                          )}
                        </div>
                        
                        {accessory.isSuggested && (
                          <div className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
                      className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      افزودن به سبد
                    </button>
                  </div>
                )
              })}
            </div>
            
            {accessories.length > 4 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setShowAccessorySelector(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  مشاهده همه متعلقات ({accessories.length})
                </button>
              </div>
            )}
          </div>
        )}

        {/* Related Products Section */}
        <div className="bg-white rounded-2xl shadow-lg mt-8 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">محصولات مشابه</h2>
          
          {relatedProducts.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-lg mt-8 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">محصولات مشابه</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct._id} className="group">
                  <a href={`/products/${relatedProduct._id}`} className="block">
                    <div className="bg-gray-100 rounded-xl overflow-hidden mb-4 aspect-square">
                      <Image
                        src={relatedProduct.images[0]?.url || '/pics/battery.jpg'}
                        alt={relatedProduct.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(relatedProduct.rating.average) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-sm text-gray-500 mr-1">({relatedProduct.rating.count})</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-blue-600">
                          {formatPrice(relatedProduct.price)} تومان
                        </span>
                        {relatedProduct.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(relatedProduct.originalPrice)}
                          </span>
                        )}
                      </div>
                      
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        relatedProduct.stock > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {relatedProduct.stock > 0 ? 'موجود' : 'ناموجود'}
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <a
                href={`/products?category=${product?.category?._id}`}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                مشاهده همه محصولات {product?.category.name}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </a>
            </div>
          </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">محصول مشابهی یافت نشد</p>
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