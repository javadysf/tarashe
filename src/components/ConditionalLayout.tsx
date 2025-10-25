'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SearchWithCategories from '@/components/SearchWithCategories'
import CartSidebar from '@/components/CartSidebar'
import SupportWidget from '@/components/SupportWidget'
import ClientOnly from '@/components/ClientOnly'
import ErrorBoundary from '@/components/ErrorBoundary'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    return <ErrorBoundary>{children}</ErrorBoundary>
  }

  return (
    <ErrorBoundary>
      <Navbar />
      
      {/* Search Bar with Categories (toggleable) */}
     
      
      <main className="flex-grow pt-40">
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
    </ErrorBoundary>
  )
}