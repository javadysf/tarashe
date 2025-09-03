import Link from 'next/link'
import ProductSlider from '@/components/ProductSlider'
import ServicesSection from '@/components/ServicesSection'

export default function Home() {
  return (
    <>

      {/* Product Slider */}
      <ProductSlider />
      
      {/* Services Section */}
      <ServicesSection />
    </>
  )
}