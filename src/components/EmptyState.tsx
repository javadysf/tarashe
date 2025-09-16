'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart, ArrowRight } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  actionText: string
  onAction: () => void
  icon?: React.ReactNode
}

export default function EmptyState({ 
  title, 
  description, 
  actionText, 
  onAction, 
  icon 
}: EmptyStateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
              {icon || <ShoppingCart className="w-10 h-10 text-white" />}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-600">{description}</p>
          </div>
          
          <Button
            onClick={onAction}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <span className="flex items-center gap-2">
              {actionText}
              <ArrowRight className="w-4 h-4" />
            </span>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}