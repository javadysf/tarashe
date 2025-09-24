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
      {/* Category Sidebar */}
      <CategorySidebar />

      {/* Product Slider */}
      <ProductSlider />
      
      {/* Search Section */}
      <SearchSection />
      
      {/* Categories Section */}
      <CategoriesSection />
      
      {/* Discounted Products Section */}
      <DiscountedProductsSection />
      
      {/* Services Section */}
      <ServicesSection />
    </>
  )
}