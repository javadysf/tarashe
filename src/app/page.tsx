import Link from 'next/link'
import ProductSlider from '@/components/ProductSlider'
import ServicesSection from '@/components/ServicesSection'
import CategoriesSection from '@/components/CategoriesSection'
import SearchSection from '@/components/SearchSection'

export default function Home() {
  return (
    <>
      {/* Product Slider */}
      <ProductSlider />
      
      {/* Search Section */}
      <SearchSection />
      
      {/* Categories Section */}
      <CategoriesSection />
      
      {/* Services Section */}
      <ServicesSection />
    </>
  )
}