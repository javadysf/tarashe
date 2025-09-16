import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Progress Steps Skeleton */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center space-x-8 space-x-reverse">
            <Skeleton className="w-32 h-10 rounded-full" />
            <Skeleton className="w-20 h-1 rounded-full" />
            <Skeleton className="w-32 h-10 rounded-full" />
            <Skeleton className="w-20 h-1 rounded-full" />
            <Skeleton className="w-32 h-10 rounded-full" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <Skeleton className="w-80 h-12 mx-auto mb-4" />
          <Skeleton className="w-96 h-6 mx-auto mb-6" />
          <div className="flex items-center justify-center gap-6">
            <Skeleton className="w-24 h-6 rounded-full" />
            <Skeleton className="w-24 h-6 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Skeleton */}
          <div className="lg:col-span-2">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader>
                <Skeleton className="w-48 h-8" />
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-full h-12" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-full h-12" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-full h-24" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="w-16 h-4" />
                    <Skeleton className="w-full h-12" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="w-16 h-4" />
                    <Skeleton className="w-full h-12" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="w-20 h-4" />
                    <Skeleton className="w-full h-12" />
                  </div>
                </div>

                <div className="space-y-4">
                  <Skeleton className="w-32 h-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="w-full h-20" />
                    <Skeleton className="w-full h-20" />
                  </div>
                </div>

                <Skeleton className="w-full h-14" />
              </CardContent>
            </Card>
          </div>

          {/* Summary Skeleton */}
          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader>
                <Skeleton className="w-32 h-6" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-xl">
                      <Skeleton className="w-16 h-16 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="w-full h-4" />
                        <div className="flex justify-between">
                          <Skeleton className="w-16 h-4" />
                          <Skeleton className="w-20 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="w-16 h-4" />
                    <Skeleton className="w-24 h-4" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="w-20 h-4" />
                    <Skeleton className="w-16 h-4" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="w-24 h-6" />
                    <Skeleton className="w-32 h-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}