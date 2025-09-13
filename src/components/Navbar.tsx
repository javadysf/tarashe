'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import logo from "../../public/pics/logo.jpg"
import login from "../../public/pics/login.png"
import CartButton from './CartButton'
import { useAuthStore } from '@/store/authStore'


export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  const navItems = [
    { href: '/', label: 'خانه' },
    { href: '/products', label: 'محصولات' },
    { href: '/about', label: 'درباره ما' },
    { href: '/contact', label: 'تماس با ما' }
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 h-20">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            <Image alt='logo' width={100} className='rounded-full' src={logo} />            </Link>
          </div>
          

          
          {/* Desktop Menu */}
          <div className="hidden md:flex justify-between w-full items-center gap-8">
            <div className='flex gap-6'>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-lg gap-2 font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-700 hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}
            </div>
            <div className="flex items-center gap-4">
              <CartButton />
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-700">سلام {user.name}</span>
                  <Link href="/profile" className="text-sm text-green-600 hover:text-green-700 px-3 py-1 rounded">
                    پروفایل
                  </Link>
                  {user.role === 'admin' && (
                    <Link href="/admin" className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1 rounded">
                      پنل ادمین
                    </Link>
                  )}
                  <button 
                    onClick={logout}
                    className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded"
                  >
                    خروج
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="bg-primary gap-2 text-white px-4 py-2 flex rounded-lg hover:bg-primary-dark transition-colors font-medium"
                >
                  ورود
                  <Image alt='login' src={login} width={32} height={16} />
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 rounded-md transition-colors"
              aria-label="منوی موبایل"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>



        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}