// Create hooks/useToast.ts
import { useState, useCallback } from 'react'

interface ToastState {
  id: string
  message: string
  type: 'success' | 'error'
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastState[]>([])

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showSuccess = useCallback((message: string) => {
    showToast(message, 'success')
  }, [showToast])

  const showError = useCallback((message: string) => {
    showToast(message, 'error')
  }, [showToast])

  return {
    toasts,
    showSuccess,
    showError,
    hideToast
  }
}