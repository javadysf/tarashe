'use client'

import Link from 'next/link'
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
  const isAuthRoute = pathname?.startsWith('/auth')

  if (isAdminRoute || isAuthRoute) {
    return (
      <ErrorBoundary>
        {isAuthRoute && (
          <div className="absolute top-4 right-4 z-50">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-black/20 hover:bg-black/30 rounded-lg backdrop-blur-sm transition-colors"
            >
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              بازگشت به خانه
            </Link>
          </div>
        )}
        {children}
      </ErrorBoundary>
    )
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