'use client'

import { toast } from 'react-toastify'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

export const showSuccessToast = (message: string) => {
  toast.success(
    <div className="flex items-center gap-3">
      <CheckCircle className="w-5 h-5 text-green-600" />
      <span className="font-medium">{message}</span>
    </div>,
    {
      position: 'top-center',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      className: 'bg-white border border-green-200 shadow-lg rounded-xl text-gray-800',
      progressClassName: 'bg-gradient-to-r from-green-500 to-emerald-500',
    }
  )
}

export const showErrorToast = (message: string) => {
  toast.error(
    <div className="flex items-center gap-3">
      <XCircle className="w-5 h-5 text-red-600" />
      <span className="font-medium">{message}</span>
    </div>,
    {
      position: 'top-center',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      className: 'bg-white border border-red-200 shadow-lg rounded-xl text-gray-800',
      progressClassName: 'bg-gradient-to-r from-red-500 to-pink-500',
    }
  )
}

export const showWarningToast = (message: string) => {
  toast.warning(
    <div className="flex items-center gap-3">
      <AlertCircle className="w-5 h-5 text-yellow-600" />
      <span className="font-medium">{message}</span>
    </div>,
    {
      position: 'top-center',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      className: 'bg-white border border-yellow-200 shadow-lg rounded-xl text-gray-800',
      progressClassName: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    }
  )
}

export const showInfoToast = (message: string) => {
  toast.info(
    <div className="flex items-center gap-3">
      <Info className="w-5 h-5 text-blue-600" />
      <span className="font-medium">{message}</span>
    </div>,
    {
      position: 'top-center',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      className: 'bg-white border border-blue-200 shadow-lg rounded-xl text-gray-800',
      progressClassName: 'bg-gradient-to-r from-blue-500 to-purple-500',
    }
  )
}