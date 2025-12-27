'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateSliderPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin/sliders')
  }, [router])

  return null
}
