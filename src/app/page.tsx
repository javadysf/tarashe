'use client'

import { motion } from 'framer-motion'
import MainSlider from '@/components/MainSlider'
import ServicesSection from '@/components/ServicesSection'
import HomeSlider from '@/components/HomeSlider'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 md:py-8">
        {/* Main Slider */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <MainSlider />
        </motion.div>
      </div>
      
      {/* Home Slider - Categories, Latest Products, Discounted Products */}
      {/* Main Home Sections */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        viewport={{ once: true }}
      >
        <HomeSlider />
      </motion.div>


      
      {/* Services Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <ServicesSection />
      </motion.div>
    </div>
  )
}