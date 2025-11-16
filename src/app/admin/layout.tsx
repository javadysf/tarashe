'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import AdminSidebar from '@/components/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, checkAuth } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 pt-16 lg:pt-0 min-h-screen">
          <div className="p-2 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}