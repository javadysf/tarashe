'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { api } from '@/lib/api'
import Head from 'next/head'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { toast } from 'react-toastify'

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

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      const response = await api.getProduct(id)
      setProduct(response)
      fetchReviews(id)
      fetchRelatedProducts(response.category._id, id)
      if (response.category._id) {
        fetchProductAttributes(response.category._id)
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

  const fetchProductAttributes = async (categoryId: string) => {
    try {
      const response = await api.getCategoryAttributes(categoryId)
      setProductAttributes(response)
    } catch (error) {
      console.error('Error fetching product attributes:', error)
    }
  }

  const fetchRelatedProducts = async (categoryId: string, currentProductId: string) => {
    try {
      const response = await api.getProducts({ category: categoryId, limit: 8 })
      const filtered = response.products.filter((p: Product) => p._id !== currentProductId)
      setRelatedProducts(filtered.slice(0, 4))
      console.log('Related products:', filtered.slice(0, 4))
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
                  ({product.rating.average}) • {product.rating.count} نظر
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

              {/* Stock */}
              <div className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${
                product.stock > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.stock > 0 ? `موجود در انبار (${product.stock} عدد)` : 'ناموجود'}
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

              {/* Quick Specs Grid */}
              {productAttributes.length > 0 && product.attributes && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">مشخصات کلیدی</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {productAttributes.slice(0, 6).map(attr => {
                      const value = (product as any).attributes?.[attr._id]
                      if (!value) return null
                      return (
                        <div key={attr._id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-gray-600 text-sm">{attr.name}</span>
                          <span className="text-gray-900 text-sm font-medium">{value}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">توضیحات محصول</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Dynamic Attributes - Table */}
              {product.attributes && (productAttributes.length > 0 || Object.keys((product as any).attributes || {}).length > 0) && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">جدول مشخصات</h3>
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <table className="w-full text-sm">
                      <tbody>
                        {(productAttributes.length > 0
                          ? productAttributes.map((attr: any) => ({
                              key: attr._id,
                              name: attr.name,
                              value: (product as any).attributes?.[attr._id]
                            }))
                          : Object.entries((product as any).attributes || {}).map(([key, value]: any) => ({ key, name: key, value }))
                        ).map((row: any) => {
                          if (!row.value) return null
                          return (
                            <tr key={row.key} className="odd:bg-white even:bg-gray-50">
                              <td className="w-1/3 text-gray-600 px-4 py-3">{row.name}</td>
                              <td className="px-4 py-3 text-gray-900">{row.value}</td>
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
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
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
      </div>
    </div>
  )
}