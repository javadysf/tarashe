import type { Metadata } from 'next'
import AdminSidebar from '@/components/AdminSidebar'

export const metadata: Metadata = {
  title: 'پنل مدیریت - تراشه',
  description: 'پنل مدیریت محصولات فروشگاه تراشه',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="mr-64">
        {children}
      </div>
    </div>
  )
}