'use client'

import { Shield, Lock, CheckCircle, Truck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function SecurityBadges() {
  const badges = [
    {
      icon: Shield,
      text: 'پرداخت امن',
      color: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    {
      icon: Lock,
      text: 'رمزنگاری SSL',
      color: 'bg-green-100 text-green-700 border-green-200'
    },
    {
      icon: CheckCircle,
      text: 'تضمین کیفیت',
      color: 'bg-purple-100 text-purple-700 border-purple-200'
    },
    {
      icon: Truck,
      text: 'ارسال رایگان',
      color: 'bg-orange-100 text-orange-700 border-orange-200'
    }
  ]

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {badges.map((badge, index) => (
        <Badge 
          key={index}
          variant="secondary" 
          className={`flex items-center gap-2 px-3 py-2 ${badge.color} hover:scale-105 transition-transform duration-200`}
        >
          <badge.icon className="w-4 h-4" />
          {badge.text}
        </Badge>
      ))}
    </div>
  )
}