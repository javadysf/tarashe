'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'

export default function AdminPage() {
  const { user, checkAuth } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (user.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">پنل مدیریت</h1>
          <p className="text-gray-600 mt-2">خوش آمدید {user.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">محصولات</h3>
            <p className="text-3xl font-bold text-blue-600">-</p>
            <p className="text-sm text-gray-500">مجموع محصولات</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">سفارشات</h3>
            <p className="text-3xl font-bold text-green-600">-</p>
            <p className="text-sm text-gray-500">سفارشات جدید</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">کاربران</h3>
            <p className="text-3xl font-bold text-purple-600">-</p>
            <p className="text-sm text-gray-500">کاربران فعال</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">فروش</h3>
            <p className="text-3xl font-bold text-orange-600">-</p>
            <p className="text-sm text-gray-500">فروش امروز</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">عملیات سریع</h2>
            </div>
            <div className="p-6 space-y-4">
              <Link href="/admin/products" className="block w-full text-right px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <span className="font-medium text-blue-900">مدیریت محصولات</span>
                <p className="text-sm text-blue-600">افزودن، ویرایش و حذف محصولات</p>
              </Link>
              
              <Link href="/admin/orders" className="block w-full text-right px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <span className="font-medium text-green-900">مدیریت سفارشات</span>
                <p className="text-sm text-green-600">بررسی و پردازش سفارشات</p>
              </Link>
              
              <Link href="/admin/users" className="block w-full text-right px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <span className="font-medium text-purple-900">مدیریت کاربران</span>
                <p className="text-sm text-purple-600">مشاهده و مدیریت کاربران</p>
              </Link>
              
              <Link href="/admin/reviews" className="block w-full text-right px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <span className="font-medium text-orange-900">مدیریت نظرات</span>
                <p className="text-sm text-orange-600">مشاهده و حذف نظرات کاربران</p>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">آخرین فعالیتها</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">سفارش جدید دریافت شد</span>
                  <span className="text-sm text-gray-400">2 دقیقه پیش</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">محصول جدید اضافه شد</span>
                  <span className="text-sm text-gray-400">1 ساعت پیش</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">کاربر جدید ثبت نام کرد</span>
                  <span className="text-sm text-gray-400">3 ساعت پیش</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}