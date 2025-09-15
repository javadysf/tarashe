'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import GlobalSearch from '@/components/GlobalSearch'
import CartSidebar from '@/components/CartSidebar'
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
      
      {/* Global Search Bar */}
      <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 py-3">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <GlobalSearch />
          </div>
        </div>
      </div>
      
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
      <ClientOnly>
        <CartSidebar />
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