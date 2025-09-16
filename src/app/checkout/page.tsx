'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Head from 'next/head'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { api } from '@/lib/api'
import { showErrorToast } from '@/components/CustomToast'
import { iranProvinces } from '@/data/iranCities'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import CheckoutProgress from '@/components/CheckoutProgress'
import SecurityBadges from '@/components/SecurityBadges'
import OrderSummary from '@/components/OrderSummary'
import LoadingButton from '@/components/LoadingButton'
import EmptyState from '@/components/EmptyState'
import { Truck, CreditCard, MapPin, Phone, User, Package, CheckCircle, Clock, Shield, LogIn, ShoppingCart } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { user, checkAuth } = useAuthStore()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    notes: '',
    paymentMethod: 'online'
  })
  const [selectedProvince, setSelectedProvince] = useState('')
  const [availableCities, setAvailableCities] = useState<string[]>([])

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        street: user.address?.street || user.street || '',
        city: user.address?.city || user.city || '',
        state: user.address?.state || user.state || '',
        postalCode: user.address?.postalCode || user.postalCode || ''
      }))
      
      // Set province and cities if user has address
      const userState = user.address?.state || user.state
      if (userState) {
        const province = iranProvinces.find(p => p.name === userState)
        if (province) {
          setSelectedProvince(province.id.toString())
          setAvailableCities(province.cities)
        }
      }
    }
  }, [user])

  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvince(provinceId)
    const province = iranProvinces.find(p => p.id.toString() === provinceId)
    if (province) {
      setAvailableCities(province.cities)
      setFormData(prev => ({ ...prev, state: province.name, city: '' }))
    }
  }

  useEffect(() => {
    if (items.length === 0 && !loading) {
      router.push('/products')
    }
  }, [items, router, loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    setLoading(true)

    try {
      // Save address to user profile
      try {
        await api.updateProfile({
          phone: formData.phone,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode
          }
        })
      } catch (error) {
        console.log('Could not update user profile')
      }

      const orderData = {
        items: items.map(item => ({
          product: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: getTotalPrice(),
        shippingAddress: {
          name: formData.name,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode
        },
        notes: formData.notes || '',
        paymentMethod: formData.paymentMethod
      }

      const response = await api.createOrder(orderData)
      const orderId = response.order?._id || response._id
      
      if (orderId) {
        // پاک کردن سبد قبل از هدایت
        clearCart()
        // هدایت به صفحه موفقیت
        window.location.href = `/order-success?orderId=${orderId}`
      } else {
        throw new Error('شماره سفارش دریافت نشد')
      }
    } catch (error: any) {
      showErrorToast(error.message || 'خطا در ثبت سفارش')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price)
  }

  if (!user) {
    return (
      <EmptyState
        title="برای ادامه وارد شوید"
        description="برای تکمیل فرآیند خرید باید وارد حساب کاربری خود شوید"
        actionText="ورود به حساب"
        onAction={() => router.push('/auth/login')}
        icon={<LogIn className="w-10 h-10 text-white" />}
      />
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="سبد خرید خالی است"
        description="هیچ محصولی در سبد خرید شما وجود ندارد. ابتدا محصولات مورد نظر خود را اضافه کنید"
        actionText="مشاهده محصولات"
        onAction={() => router.push('/products')}
        icon={<ShoppingCart className="w-10 h-10 text-white" />}
      />
    )
  }

  return (
    <>
      <Head>
        <title>تسویه حساب - فروشگاه تراشه</title>
        <meta name="description" content="تکمیل خرید و تسویه حساب در فروشگاه تراشه. پرداخت امن و ارسال سریع" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <CheckoutProgress currentStep={2} />

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                تسویه حساب امن
              </h1>
            </div>
            <p className="text-gray-600 text-lg">اطلاعات تحویل و پرداخت خود را تکمیل کنید</p>
            <div className="mt-6">
              <SecurityBadges />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    اطلاعات تحویل
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-semibold">
                          <User className="w-4 h-4" />
                          نام گیرنده *
                        </Label>
                        <Input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="h-12 text-base"
                          placeholder="نام و نام خانوادگی"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-semibold">
                          <Phone className="w-4 h-4" />
                          شماره تماس *
                        </Label>
                        <Input
                          type="tel"
                          required
                          pattern="09[0-9]{9}"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="h-12 text-base"
                          placeholder="09123456789"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-semibold">
                        <MapPin className="w-4 h-4" />
                        آدرس کامل *
                      </Label>
                      <Textarea
                        required
                        rows={4}
                        value={formData.street}
                        onChange={(e) => setFormData({...formData, street: e.target.value})}
                        className="resize-none text-base"
                        placeholder="آدرس کامل شامل خیابان، کوچه، پلاک و جزئیات..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">استان *</Label>
                        <Select value={selectedProvince} onValueChange={handleProvinceChange}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="انتخاب استان" />
                          </SelectTrigger>
                          <SelectContent>
                            {iranProvinces.map(province => (
                              <SelectItem key={province.id} value={province.id.toString()}>
                                {province.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">شهر *</Label>
                        <Select 
                          value={formData.city} 
                          onValueChange={(value) => setFormData({...formData, city: value})}
                          disabled={!selectedProvince}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="انتخاب شهر" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCities.map(city => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">کد پستی *</Label>
                        <Input
                          type="text"
                          required
                          pattern="[0-9]{10}"
                          value={formData.postalCode}
                          onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                          className="h-12 text-base"
                          placeholder="1234567890"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">یادداشت (اختیاری)</Label>
                      <Textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="resize-none text-base"
                        placeholder="توضیحات اضافی برای سفارش..."
                      />
                    </div>

                    <div className="space-y-4">
                      <Label className="flex items-center gap-2 text-sm font-semibold">
                        <CreditCard className="w-4 h-4" />
                        روش پرداخت
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                          formData.paymentMethod === 'online' 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="online"
                            checked={formData.paymentMethod === 'online'}
                            onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                            className="mr-3 text-blue-600"
                          />
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="font-semibold">پرداخت آنلاین</div>
                              <div className="text-sm text-gray-500">پرداخت امن با کارت بانکی</div>
                            </div>
                          </div>
                        </label>

                        <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                          formData.paymentMethod === 'cash' 
                            ? 'border-green-500 bg-green-50 shadow-md' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cash"
                            checked={formData.paymentMethod === 'cash'}
                            onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                            className="mr-3 text-green-600"
                          />
                          <div className="flex items-center gap-3">
                            <Truck className="w-5 h-5 text-green-600" />
                            <div>
                              <div className="font-semibold">پرداخت در محل</div>
                              <div className="text-sm text-gray-500">پرداخت نقدی هنگام تحویل</div>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <LoadingButton
                      type="submit"
                      loading={loading}
                      loadingText="در حال ثبت سفارش..."
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl"
                    >
                      ثبت سفارش
                    </LoadingButton>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummary 
                items={items}
                totalPrice={getTotalPrice()}
                formatPrice={formatPrice}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}