'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Carousel } from '@/components/ui/carousel'

interface Slider {
  _id: string
  type?: 'main' | 'promo'
  title: string
  subtitle?: string
  description?: string
  backgroundImage: string
  buttonText?: string
  buttonLink?: string
  isActive: boolean
  displayOrder: number
  textColor?: string
  buttonColor?: string
  textPosition?: 'left' | 'center' | 'right'
  overlayOpacity?: number
  createdAt: string
  updatedAt: string
}

export default function MainSlider() {
  const [sliders, setSliders] = useState<Slider[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSliders = async () => {
    try {
      const response = await api.getSliders('main')
      const activeSliders = (response.sliders || []).filter((slider: Slider) => slider.isActive)
      setSliders(activeSliders.sort((a: Slider, b: Slider) => a.displayOrder - b.displayOrder))
    } catch (error) {
      console.error('Error fetching sliders:', error)
      // Fallback to default slider if API fails
      setSliders([{
        _id: 'default',
        title: 'بهترین باتری‌های لپ تاپ',
        subtitle: 'کیفیت بالا، قیمت مناسب',
        description: 'انواع باتری لپ تاپ برندهای معتبر با گارانتی و کیفیت تضمینی',
        backgroundImage: '/pics/battery.jpg',
        buttonText: 'مشاهده محصولات',
        buttonLink: '/products',
        isActive: true,
        displayOrder: 1,
        textColor: '#ffffff',
        buttonColor: '#3b82f6',
        textPosition: 'center',
        overlayOpacity: 0.4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSliders()
  }, [])



  if (loading) {
    return (
      <div className="relative h-[450px] lg:h-[550px] bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  if (sliders.length === 0) {
    return null
  }

  return (
    <section className="relative h-[450px] lg:h-[550px] overflow-hidden rounded-3xl mb-8">
      <Carousel className="w-full h-full">
        {sliders.map((slider) => (
          <div key={slider._id} className="relative w-full h-[450px] lg:h-[550px] bg-gradient-1 rounded-3xl">
            <Image
              src={slider.backgroundImage}
              alt={slider.title}
              fill
              className="object-cover rounded-3xl"
              priority
            />
            <div
              className="absolute inset-0 bg-black/40 rounded-3xl pointer-events-none"
              style={{
                backgroundColor: `rgba(0, 0, 0, ${slider.overlayOpacity || 0.4})`
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center max-w-4xl">
                <h1
                  className="text-4xl lg:text-6xl font-bold mb-4 drop-shadow-lg"
                  style={{ color: slider.textColor || '#ffffff' }}
                >
                  {slider.title}
                </h1>
                {slider.subtitle && (
                  <p
                    className="text-xl lg:text-2xl mb-6 drop-shadow-md"
                    style={{ color: slider.textColor || '#ffffff' }}
                  >
                    {slider.subtitle}
                  </p>
                )}
                {slider.description && (
                  <p
                    className="text-lg mb-8 max-w-2xl mx-auto drop-shadow-md"
                    style={{ color: slider.textColor || '#ffffff' }}
                  >
                    {slider.description}
                  </p>
                )}
                {slider.buttonText && slider.buttonLink && (
                  <Link
                    href={slider.buttonLink}
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                    style={{
                      backgroundColor: slider.buttonColor || '#3b82f6'
                    }}
                  >
                    {slider.buttonText}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </section>
  )
}
