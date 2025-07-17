// a hook is a reusable function that allows you to use state and other React features in functional components.
// This hook manages toast notifications in the application.
import { useState, useCallback } from 'react'

interface ToastState {
  id: string
  message: string
  type: 'success' | 'error'
}

export const useToast = () => {
  // State to hold the current toasts
  // Each toast has an id, message, type (success or error)
  const [toasts, setToasts] = useState<ToastState[]>([])

  // useCallBack is used to memoize the function so that it doesn't change on every render
  // This is useful for performance optimization, especially when passing the function as a prop.
  // showToast is a function that adds a new toast to the state.
  // It generates a unique id based on the current timestamp.
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // passes through 'success' and 'error' messages to the showToast function
  // showSuccess and showError are convenience functions to show success and error toasts respectively.
  // They use the showToast function defined above.
  const showSuccess = useCallback((message: string) => {
    showToast(message, 'success')
  }, [showToast])

  const showError = useCallback((message: string) => {
    showToast(message, 'error')
  }, [showToast])

  // Returns the toasts array and the functions to show/hide toasts
  // This allows components to access the current toasts and control their visibility.
  return {
    toasts,
    showSuccess,
    showError,
    hideToast
  }
}