import Link from 'next/link'
import Image from 'next/image'

interface Service {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  image: string
  href: string
}

const services: Service[] = [
  {
    id: 1,
    title: 'تعمیرات لپ تاپ',
    description: 'تعمیر تخصصی انواع لپ تاپ با گارانتی معتبر',
    image: '/pics/battery.jpg',
    href: '/services/laptop-repair',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    id: 2,
    title: 'فروش قطعات',
    description: 'قطعات اصل و با کیفیت برای انواع دستگاه‌ها',
    image: '/pics/battery.jpg',
    href: '/services/parts-sale',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  {
    id: 3,
    title: 'انواع هارد',
    description: 'هارد دیسک و SSD با ظرفیت‌های مختلف',
    image: '/pics/battery.jpg',
    href: '/services/storage',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    )
  },
  {
    id: 4,
    title: 'محصولات شبکه',
    description: 'تجهیزات شبکه و ارتباطات با کیفیت بالا',
    image: '/pics/battery.jpg',
    href: '/services/network',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    )
  },
  {
    id: 5,
    title: 'باتری و قطعات موبایل',
    description: 'باتری و لوازم جانبی انواع گوشی موبایل',
    image: '/pics/battery.jpg',
    href: '/services/mobile-parts',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
      </svg>
    )
  }
]

export default function ServicesSection() {
  return (
    <section className="py-16 bg-gradient-8 relative">
      {/* Fade overlay at bottom - softer */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/80 via-white/40 to-transparent pointer-events-none z-10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-0">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">خدمات ما</h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto drop-shadow-md">
            ما در تراشه طیف گسترده‌ای از خدمات فنی و فروش قطعات را ارائه می‌دهیم
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {services.map((service) => (
            <Link
              key={service.id}
              href={service.href}
              className="group relative glass rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-white/20 hover:border-white/40 transform hover:-translate-y-2 animate-bounce-in"
            >
              {/* Image Background */}
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-primary/80 z-10"></div>
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Icon */}
                <div className="absolute top-4 right-4 z-20">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl text-white group-hover:bg-white/30 transition-colors">
                    {service.icon}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-300 transition-colors">
                  {service.title}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  {service.description}
                </p>
                
                {/* Arrow Icon */}
                <div className="mt-4 flex items-center text-white group-hover:text-yellow-300">
                  <span className="text-sm font-medium ml-2">مشاهده بیشتر</span>
                  <svg 
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-600/0 group-hover:from-blue-500/5 group-hover:to-purple-600/5 transition-all duration-300 pointer-events-none"></div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="glass rounded-3xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 drop-shadow-lg">
              نیاز به مشاوره دارید؟
            </h3>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md">
              تیم متخصص ما آماده ارائه بهترین راهکارها برای نیازهای شما است
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-gradient-4 text-white px-8 py-4 rounded-xl hover:shadow-2xl transition-all font-medium text-lg transform hover:scale-105"
              >
                تماس با ما
              </Link>
              <Link
                href="/services"
                className="border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-gray-900 transition-all font-medium text-lg transform hover:scale-105"
              >
                مشاهده همه خدمات
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}