'use client'

import dynamic from 'next/dynamic'
import { Suspense, useEffect } from 'react'
import { setupGlobalErrorHandlers } from '@/lib/errorHandler'

// Dynamically import components that might cause SSR issues
const DynamicThemeProvider = dynamic(
  () => import('@/contexts/ThemeContext').then(mod => ({ default: mod.ThemeProvider })),
  { ssr: false }
)

const DynamicConditionalLayout = dynamic(
  () => import('@/components/ConditionalLayout'),
  { ssr: false }
)

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Setup global error handlers on client side
    setupGlobalErrorHandlers()
  }, [])

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DynamicThemeProvider>
        <DynamicConditionalLayout>{children}</DynamicConditionalLayout>
      </DynamicThemeProvider>
    </Suspense>
  )
}
