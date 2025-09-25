import Link from 'next/link'
import ProductSlider from '@/components/ProductSlider'
import ServicesSection from '@/components/ServicesSection'
import CategoriesSection from '@/components/CategoriesSection'
import SearchSection from '@/components/SearchSection'
import DiscountedProductsSection from '@/components/DiscountedProductsSection'
import CategorySidebar from '@/components/CategorySidebar'

export default function Home() {
  return (
    <>
      {/* Product Slider */}
      <ProductSlider />
      
      {/* Categories Section */}
      <CategoriesSection />
      
      {/* Discounted Products Section */}
      <DiscountedProductsSection />
      
      {/* Services Section */}
      <ServicesSection />
    </>
  )
}