'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import ProductSlider from '@/components/ProductSlider'
import ServicesSection from '@/components/ServicesSection'
import HomeSlider from '@/components/HomeSlider'
import SearchSection from '@/components/SearchSection'
import CategorySidebar from '@/components/CategorySidebar'

export default function Home() {
  return (
    <div className="min-h-screen">

      {/* Product Slider */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <ProductSlider />
      </motion.div>
      
      {/* Home Slider - Categories, Latest Products, Discounted Products */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <HomeSlider />
      </motion.div>
      
      {/* Services Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        viewport={{ once: true }}
      >
        <ServicesSection />
      </motion.div>
    </div>
  )
}