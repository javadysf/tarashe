'use client'

import { CheckCircle, Package, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckoutProgressProps {
  currentStep: number
}

const steps = [
  {
    id: 1,
    title: 'سبد خرید',
    icon: CheckCircle,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 2,
    title: 'تسویه حساب',
    icon: Package,
    color: 'from-blue-500 to-purple-500'
  },
  {
    id: 3,
    title: 'تایید نهایی',
    icon: Clock,
    color: 'from-purple-500 to-pink-500'
  }
]

export default function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center space-x-8 space-x-reverse">
          {steps.map((step, index) => {
            const isCompleted = step.id < currentStep
            const isCurrent = step.id === currentStep
            const isUpcoming = step.id > currentStep
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center group">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
                    isCompleted && "bg-gradient-to-r from-green-500 to-emerald-500 text-white group-hover:scale-110",
                    isCurrent && `bg-gradient-to-r ${step.color} text-white animate-pulse`,
                    isUpcoming && "bg-gray-300 text-gray-600"
                  )}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "mr-3 text-sm font-semibold transition-colors duration-300",
                    isCompleted && "text-green-600",
                    isCurrent && "text-blue-600",
                    isUpcoming && "text-gray-500"
                  )}>
                    {step.title}
                  </span>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-20 h-1 rounded-full mx-4 transition-all duration-500",
                    step.id < currentStep && "bg-gradient-to-r from-green-500 to-blue-500",
                    step.id === currentStep && "bg-gradient-to-r from-blue-500 to-purple-500",
                    step.id > currentStep && "bg-gray-300"
                  )} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}