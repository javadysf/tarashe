import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'درباره ما',
  description: 'آشنایی با تیم و ماموریت شرکت تراشه - پیشرو در ارائه بهترین محصولات و خدمات',
  openGraph: {
    title: 'درباره ما | تراشه',
    description: 'آشنایی با تیم و ماموریت شرکت تراشه - پیشرو در ارائه بهترین محصولات و خدمات'
  }
}

export default function About() {
  const stats = [
    { number: '10+', label: 'سال تجربه' },
    { number: '500+', label: 'پروژه موفق' },
    { number: '100+', label: 'مشتری راضی' },
    { number: '24/7', label: 'پشتیبانی' }
  ]

  const team = [
    { name: 'علی احمدی', role: 'مدیر عامل', description: 'بیش از 15 سال تجربه در صنعت فناوری' },
    { name: 'سارا محمدی', role: 'مدیر فنی', description: 'متخصص توسعه نرم‌افزار و معماری سیستم' },
    { name: 'حسن رضایی', role: 'مدیر فروش', description: 'خبره در روابط مشتریان و توسعه بازار' }
  ]

  return (
    <div className="py-16">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          درباره تراشه
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          ما در تراشه با بیش از یک دهه تجربه، به ارائه بهترین محصولات و خدمات فناوری 
          برای کسب‌وکارها و سازمان‌ها متعهد هستیم.
        </p>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-50 py-16 mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-700 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">ماموریت ما</h2>
            <p className="text-gray-600 leading-relaxed">
              ارائه راه‌حل‌های نوآورانه و با کیفیت که به کسب‌وکارها کمک می‌کند تا در عصر دیجیتال 
              پیشرو باشند و اهداف خود را محقق کنند.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">چشم‌انداز ما</h2>
            <p className="text-gray-600 leading-relaxed">
              تبدیل شدن به پیشروترین شرکت فناوری در منطقه و ایجاد تحول مثبت در زندگی 
              میلیون‌ها نفر از طریق فناوری‌های پیشرفته.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">تیم ما</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div key={index} className="text-center bg-white p-6 rounded-lg shadow-lg">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
              <p className="text-blue-600 font-medium mb-3">{member.role}</p>
              <p className="text-gray-600 text-sm">{member.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">آماده همکاری با ما هستید؟</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            با تیم متخصص ما در تماس باشید و پروژه بعدی خود را شروع کنید.
          </p>
          <Link
            href="/contact"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
          >
            تماس با ما
          </Link>
        </div>
      </section>
    </div>
  )
}