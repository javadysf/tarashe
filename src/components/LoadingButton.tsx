'use client'

import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingButtonProps {
  loading: boolean
  children: React.ReactNode
  loadingText?: string
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

export default function LoadingButton({ 
  loading, 
  children, 
  loadingText = 'در حال پردازش...', 
  className,
  onClick,
  type = 'button',
  disabled
}: LoadingButtonProps) {
  return (
    <Button
      type={type}
      disabled={loading || disabled}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]",
        loading && "animate-pulse-glow",
        className
      )}
    >
      <div className={cn(
        "flex items-center gap-2 transition-opacity duration-300",
        loading ? "opacity-0" : "opacity-100"
      )}>
        <CheckCircle className="w-5 h-5" />
        {children}
      </div>
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            {loadingText}
          </div>
        </div>
      )}
      
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse" />
      )}
    </Button>
  )
}