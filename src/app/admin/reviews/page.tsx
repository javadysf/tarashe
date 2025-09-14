'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { toast } from 'react-toastify'

interface Review {
  _id: string
  user: { name: string; email: string }
  product: { name: string; _id: string }
  rating: number
  comment: string
  createdAt: string
}

export default function AdminReviewsPage() {
  const { user } = useAuthStore()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchReviews()
    }
  }, [user])

  const fetchReviews = async () => {
    try {
      const response = await api.getAllReviews()
      setReviews(response.reviews || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteReview = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return
    
    try {
      await api.deleteReview(id)
      setReviews(reviews.filter(r => r._id !== id))
      toast.success('🗑️ نظر با موفقیت حذف شد!', {
        position: 'top-right',
        autoClose: 2000,
      })
    } catch (error) {
      toast.error('❌ خطا در حذف نظر', {
        position: 'top-right',
        autoClose: 3000,
      })
    }
  }

  if (user?.role !== 'admin') return null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">مدیریت نظرات</h1>
          <div className="text-sm text-gray-600">
            مجموع: {reviews.length} نظر
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">کاربر</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">محصول</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">امتیاز</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نظر</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاریخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reviews.map((review) => (
                  <tr key={review._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{review.user.name}</div>
                        <div className="text-sm text-gray-500">{review.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {review.product.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="mr-2 text-sm text-gray-600">({review.rating})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md">
                        <p className="line-clamp-3">{review.comment}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => deleteReview(review._id)}
                        className="text-red-600 hover:text-red-900 ml-4"
                      >
                        حذف
                      </button>
                      <a
                        href={`/products/${review.product._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        مشاهده محصول
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {reviews.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                هیچ نظری یافت نشد
              </div>
            )}
          </div>
        )}
    </div>
  )
}