'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface ActivityLog {
  _id: string
  user: {
    _id: string
    name: string
    email: string
    role: string
  } | null
  action: string
  entity: string
  entityId?: string
  description: string
  metadata: any
  createdAt: string
  ipAddress?: string
}

const ACTION_LABELS: Record<string, string> = {
  create: 'ایجاد',
  update: 'بروزرسانی',
  delete: 'حذف',
  view: 'مشاهده',
  export: 'خروجی',
  bulk_update: 'بروزرسانی دسته‌جمعی',
  bulk_delete: 'حذف دسته‌جمعی',
  login: 'ورود',
  logout: 'خروج',
  status_change: 'تغییر وضعیت',
  product_create: 'ایجاد محصول',
  product_update: 'بروزرسانی محصول',
  product_delete: 'حذف محصول',
  order_status_change: 'تغییر وضعیت سفارش'
}

const ENTITY_LABELS: Record<string, string> = {
  product: 'محصول',
  category: 'دسته‌بندی',
  order: 'سفارش',
  user: 'کاربر',
  review: 'نظر',
  brand: 'برند',
  system: 'سیستم'
}

const FILTER_ACTIONS = [
  { value: 'create', label: 'ایجاد' },
  { value: 'update', label: 'بروزرسانی' },
  { value: 'delete', label: 'حذف' },
  { value: 'export', label: 'خروجی' },
  { value: 'bulk_update', label: 'بروزرسانی دسته‌جمعی' },
  { value: 'bulk_delete', label: 'حذف دسته‌جمعی' }
]

const FILTER_ENTITIES = [
  { value: 'product', label: 'محصول' },
  { value: 'category', label: 'دسته‌بندی' },
  { value: 'order', label: 'سفارش' },
  { value: 'user', label: 'کاربر' },
  { value: 'system', label: 'سیستم' }
]

const TABLE_COLUMNS = [
  { key: 'date', label: 'تاریخ' },
  { key: 'user', label: 'کاربر' },
  { key: 'action', label: 'عملیات' },
  { key: 'entity', label: 'موجودیت' },
  { key: 'description', label: 'توضیحات' },
  { key: 'ip', label: 'IP' }
]

const INPUT_CLASSES = "w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
const LABEL_CLASSES = "block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2"
const BUTTON_CLASSES = "px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 text-sm"
const BUTTON_MOBILE_CLASSES = "px-3 py-1.5 bg-blue-600 text-white rounded-lg disabled:opacity-50 text-sm"

export default function ActivityLogsPage() {
  const { user, checkAuth } = useAuthStore()
  const router = useRouter()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    action: '',
    entity: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  })

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const fetchLogs = useCallback(async () => {
    if (!user || user.role !== 'admin') return
    
    try {
      setLoading(true)
      const params: any = { page: String(page), limit: '50' }
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value
      })

      const data = await api.getActivityLogs(params)
      setLogs(data.logs || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error fetching activity logs:', error)
    } finally {
      setLoading(false)
    }
  }, [user, page, filters])

  const fetchStats = useCallback(async () => {
    if (!user || user.role !== 'admin') return
    
    try {
      const data = await api.getActivityLogsStats()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }, [user])

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchLogs()
      fetchStats()
    } else if (user && user.role !== 'admin') {
      router.push('/')
    }
  }, [user, fetchLogs, fetchStats, router])

  useEffect(() => {
    if (user?.role === 'admin') {
      setPage(1)
      fetchLogs()
    }
  }, [filters])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 sm:p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">لاگ فعالیت‌ها</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">مشاهده تمام فعالیت‌های انجام شده در پنل مدیریت</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
            {[
              { label: 'کل لاگ‌ها', value: stats.totalLogs || 0, color: 'text-blue-600' },
              ...(stats.logsByAction?.slice(0, 3).map((item: any) => ({
                label: ACTION_LABELS[item.action] || item.action,
                value: item.count,
                color: 'text-green-600'
              })) || [])
            ].map((stat, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-6">
                <h3 className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">{stat.label}</h3>
                <p className={`text-lg sm:text-2xl lg:text-3xl font-bold ${stat.color}`}>
                  {stat.value.toLocaleString('fa-IR')}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Action Filter */}
            <div>
              <label className={LABEL_CLASSES}>نوع عملیات</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className={INPUT_CLASSES}
              >
                <option value="">همه</option>
                {FILTER_ACTIONS.map(action => (
                  <option key={action.value} value={action.value}>{action.label}</option>
                ))}
              </select>
            </div>
            
            {/* Entity Filter */}
            <div>
              <label className={LABEL_CLASSES}>موجودیت</label>
              <select
                value={filters.entity}
                onChange={(e) => setFilters({ ...filters, entity: e.target.value })}
                className={INPUT_CLASSES}
              >
                <option value="">همه</option>
                {FILTER_ENTITIES.map(entity => (
                  <option key={entity.value} value={entity.value}>{entity.label}</option>
                ))}
              </select>
            </div>
            
            {/* Date From */}
            <div>
              <label className={LABEL_CLASSES}>از تاریخ</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className={INPUT_CLASSES}
              />
            </div>
            
            {/* Date To */}
            <div>
              <label className={LABEL_CLASSES}>تا تاریخ</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className={INPUT_CLASSES}
              />
            </div>
            
            {/* Search */}
            <div>
              <label className={LABEL_CLASSES}>جستجو</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="جستجو..."
                className={INPUT_CLASSES}
              />
            </div>
          </div>
        </div>

        {/* Mobile View - Cards */}
        <div className="lg:hidden space-y-3">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center text-gray-500">
              هیچ لاگی یافت نشد
            </div>
          ) : (
            logs.map((log) => {
              const badges = [
                { text: ACTION_LABELS[log.action] || log.action, classes: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' },
                { text: ENTITY_LABELS[log.entity] || log.entity, classes: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' }
              ]
              
              return (
                <div key={log._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{log.user?.name || 'نامشخص'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{log.user?.email || ''}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      {badges.map((badge, idx) => (
                        <span key={idx} className={`px-2 py-0.5 rounded-full text-xs ${badge.classes}`}>
                          {badge.text}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{log.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatDate(log.createdAt)}</span>
                    {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {TABLE_COLUMNS.map(col => (
                      <th key={col.key} className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.map((log) => {
                    const renderCell = (col: typeof TABLE_COLUMNS[0]) => {
                      switch (col.key) {
                        case 'date':
                          return <span className="text-sm text-gray-600 dark:text-gray-300">{formatDate(log.createdAt)}</span>
                        case 'user':
                          return (
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{log.user?.name || 'نامشخص'}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{log.user?.email || ''}</p>
                            </div>
                          )
                        case 'action':
                          return (
                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                              {ACTION_LABELS[log.action] || log.action}
                            </span>
                          )
                        case 'entity':
                          return (
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                              {ENTITY_LABELS[log.entity] || log.entity}
                            </span>
                          )
                        case 'description':
                          return <span className="text-sm text-gray-600 dark:text-gray-300 max-w-md">{log.description}</span>
                        case 'ip':
                          return <span className="text-sm text-gray-500 dark:text-gray-400">{log.ipAddress || '-'}</span>
                        default:
                          return null
                      }
                    }
                    
                    return (
                      <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        {TABLE_COLUMNS.map(col => (
                          <td key={col.key} className={`px-6 py-4 ${col.key === 'description' ? '' : 'whitespace-nowrap'}`}>
                            {renderCell(col)}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              {[
                { label: 'قبلی', onClick: () => setPage(p => Math.max(1, p - 1)), disabled: page === 1 },
                { label: 'بعدی', onClick: () => setPage(p => Math.min(totalPages, p + 1)), disabled: page === totalPages }
              ].map((btn, idx) => (
                <button key={idx} onClick={btn.onClick} disabled={btn.disabled} className={BUTTON_CLASSES}>
                  {btn.label}
                </button>
              ))}
              <span className="text-sm text-gray-600 dark:text-gray-400">
                صفحه {page.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
              </span>
            </div>
          )}
        </div>

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="lg:hidden flex items-center justify-between mt-4 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            {[
              { label: 'قبلی', onClick: () => setPage(p => Math.max(1, p - 1)), disabled: page === 1 },
              { label: 'بعدی', onClick: () => setPage(p => Math.min(totalPages, p + 1)), disabled: page === totalPages }
            ].map((btn, idx) => (
              <button key={idx} onClick={btn.onClick} disabled={btn.disabled} className={BUTTON_MOBILE_CLASSES}>
                {btn.label}
              </button>
            ))}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {page} / {totalPages}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
