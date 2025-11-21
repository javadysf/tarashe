"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ className, children, ...props }, ref) => {
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const items = React.Children.toArray(children).filter(React.isValidElement)
    const totalItems = items.length

    // Reset index if items change to avoid out-of-range or blank views
    React.useEffect(() => {
      setCurrentIndex((prev) => (totalItems === 0 ? 0 : Math.min(prev, totalItems - 1)))
    }, [totalItems])

    // Determine page direction if needed in future; not used for button mapping
    const rootDir = typeof document !== 'undefined'
      ? (document.documentElement.getAttribute('dir') || document.body.getAttribute('dir') || '')
      : ''
    const isRTL = rootDir.toLowerCase() === 'rtl'

    const next = () => {
      if (totalItems <= 1) return
      setCurrentIndex((prev) => (prev + 1) % totalItems)
    }

    const prev = () => {
      if (totalItems <= 1) return
      setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems)
    }

    if (totalItems === 0) return null

    return (
      <div
        ref={ref}
        className={cn("relative w-full", className)}
        data-testid="carousel"
        data-current-index={currentIndex}
        {...props}
      >
        <div className="overflow-hidden w-full">
          <div
            className="flex transition-transform duration-300 ease-in-out w-full"
            dir="ltr"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            data-testid="carousel-track"
          >
            {items.map((item, index) => (
              <div key={index} className="min-w-full shrink-0">
                {item}
              </div>
            ))}
          </div>
        </div>

        {totalItems > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous"
              type="button"
              className=" absolute max-sm:w-12 max-sm:h-12 left-4 top-1/2 -translate-y-1/2 bg-blue-400 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors pointer-events-auto z-40"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={next}
              aria-label="Next"
              type="button"
              className="absolute right-4 top-1/2 max-sm:w-12 max-sm:h-12 -translate-y-1/2  bg-blue-400 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors pointer-events-auto z-40"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}
      </div>
    )
  }
)
Carousel.displayName = "Carousel"