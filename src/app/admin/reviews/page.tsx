'use client'

import React, { useState, useEffect } from 'react'
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
  replies?: Review[]
  likesCount?: number
  dislikesCount?: number
  isAdminReply?: boolean
  parentReview?: string
}

export default function AdminReviewsPage() {
  const { user } = useAuthStore()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)
  const [editingReply, setEditingReply] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchReviews()
    }
  }, [user])

  const fetchReviews = async () => {
    try {
      const response = await api.getAllReviews()
      // Group reviews with their replies
      const mainReviews = (response.reviews || []).filter((r: Review) => !r.parentReview)
      const replies = (response.reviews || []).filter((r: Review) => r.parentReview)
      
      const reviewsWithReplies = mainReviews.map((review: Review) => ({
        ...review,
        replies: replies.filter((r: Review) => r.parentReview === review._id)
      }))
      
      setReviews(reviewsWithReplies)
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

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return
    
    setSubmittingReply(true)
    try {
      await api.replyToReview(reviewId, replyText)
      toast.success('پاسخ با موفقیت ثبت شد')
      setReplyingTo(null)
      setReplyText('')
      fetchReviews()
    } catch (error: any) {
      toast.error(error.message || 'خطا در ثبت پاسخ')
    } finally {
      setSubmittingReply(false)
    }
  }

  const handleEditReply = async (replyId: string) => {
    if (!editText.trim()) return
    
    try {
      await api.updateReview(replyId, { comment: editText })
      toast.success('پاسخ با موفقیت ویرایش شد')
      setEditingReply(null)
      setEditText('')
      fetchReviews()
    } catch (error: any) {
      toast.error(error.message || 'خطا در ویرایش پاسخ')
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
                  <React.Fragment key={review._id}>
                  <tr>
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
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          {!review.isAdminReply && !review.replies?.some(r => r.isAdminReply) && (
                            <button
                              onClick={() => setReplyingTo(replyingTo === review._id ? null : review._id)}
                              className="text-green-600 hover:text-green-900 px-2 py-1 rounded bg-green-50 hover:bg-green-100 transition-colors"
                            >
                              پاسخ
                            </button>
                          )}
                          <button
                            onClick={() => deleteReview(review._id)}
                            className="text-red-600 hover:text-red-900 px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors"
                          >
                            حذف
                          </button>
                        </div>
                        <a
                          href={`/products/${review.product._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 text-xs"
                        >
                          مشاهده محصول
                        </a>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Show existing replies */}
                  {review.replies && review.replies.map((reply) => (
                    <tr key={`reply-${reply._id}`}>
                      <td colSpan={6} className="px-6 py-4 bg-green-50 border-r-4 border-green-400">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-green-900">پاسخ ادمین: {reply.user.name}</h5>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingReply(editingReply === reply._id ? null : reply._id)
                                  setEditText(reply.comment)
                                }}
                                className="text-blue-600 hover:text-blue-900 text-sm px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 transition-colors"
                              >
                                ویرایش
                              </button>
                              <button
                                onClick={() => deleteReview(reply._id)}
                                className="text-red-600 hover:text-red-900 text-sm px-2 py-1 rounded bg-red-100 hover:bg-red-200 transition-colors"
                              >
                                حذف
                              </button>
                            </div>
                          </div>
                          
                          {editingReply === reply._id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditReply(reply._id)}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                                >
                                  ذخیره
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingReply(null)
                                    setEditText('')
                                  }}
                                  className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition-colors"
                                >
                                  انصراف
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-green-800">{reply.comment}</p>
                          )}
                          
                          <div className="text-xs text-green-600">
                            {new Date(reply.createdAt).toLocaleDateString('fa-IR')}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Reply Form */}
                  {replyingTo === review._id && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-blue-50">
                        <div className="space-y-3">
                          <h4 className="font-medium text-blue-900">پاسخ به نظر {review.user.name}</h4>
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="پاسخ خود را بنویسید..."
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReply(review._id)}
                              disabled={submittingReply || !replyText.trim()}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                              {submittingReply ? 'در حال ارسال...' : 'ارسال پاسخ'}
                            </button>
                            <button
                              onClick={() => {
                                setReplyingTo(null)
                                setReplyText('')
                              }}
                              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                              انصراف
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
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