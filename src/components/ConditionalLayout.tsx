'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SearchWithCategories from '@/components/SearchWithCategories'
import CartSidebar from '@/components/CartSidebar'
import SupportWidget from '@/components/SupportWidget'
import ClientOnly from '@/components/ClientOnly'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      
      {/* Search Bar with Categories (toggleable) */}
      <div className="sticky top-20 z-40 bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm border-b border-gray-200/50 py-4">
        <div className="container mx-auto px-4">
          <SearchWithCategories />
        </div>
      </div>
      
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
      <ClientOnly>
        <CartSidebar />
        <SupportWidget />
      </ClientOnly>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastClassName="!font-sans"
      />
    </>
  )
}