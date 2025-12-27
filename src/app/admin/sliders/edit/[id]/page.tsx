'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EditSliderPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin/sliders')
  }, [router])

  return null
}
