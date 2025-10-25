'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '@/lib/api'

interface Slider {
  _id: string
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
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [loading, setLoading] = useState(true)

  const fetchSliders = async () => {
    try {
      const response = await api.getSliders()
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

  useEffect(() => {
    if (!isAutoPlaying || sliders.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliders.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, sliders.length])

  const nextSlide = () => {
    const newSlide = (currentSlide + 1) % sliders.length
    setCurrentSlide(newSlide)
  }

  const prevSlide = () => {
    const newSlide = (currentSlide - 1 + sliders.length) % sliders.length
    setCurrentSlide(newSlide)
  }

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
      {/* Slider Container */}
      <div className="relative w-full h-full">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(${currentSlide * 100}%)` }}
        >
          {sliders.map((slider) => (
            <div key={slider._id} className="w-full flex-shrink-0">
              <div className="relative h-[450px] lg:h-[550px] bg-gradient-1 rounded-3xl">
                <Image
                  src={slider.backgroundImage}
                  alt={slider.title}
                  fill
                  className="object-cover rounded-3xl"
                  priority={sliders.indexOf(slider) === currentSlide}
                />
                
                {/* Simple overlay with title */}
                <div 
                  className="absolute inset-0 bg-black/40 rounded-3xl"
                  style={{ 
                    backgroundColor: `rgba(0, 0, 0, ${slider.overlayOpacity || 0.4})` 
                  }}
                />
                
                {/* Content */}
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
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {sliders.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg z-20"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg z-20"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-2 md:gap-4 z-20">
        {sliders.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white shadow-lg' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Auto-play Toggle */}
      <button
        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
        className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg z-20"
      >
        {isAutoPlaying ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6l5-3-5-3z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5h6v14h-6" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6l5-3-5-3z" />
          </svg>
        )}
      </button>
    </section>
  )
}
