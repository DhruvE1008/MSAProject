// basically a notification component that will display messages to the user.
import React, { useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, XIcon } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
  duration?: number
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  // Automatically close the toast after the specified duration aka 3 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg min-w-80 max-w-md ${
      type === 'success' 
        ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700' 
        : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700'
    }`}>
      {/*If successful the colour will be green otherwise it will be red. */}
      {type === 'success' ? (
        <CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-400 mr-3" />
      ) : (
        <XCircleIcon className="w-5 h-5 text-red-500 dark:text-red-400 mr-3" />
      )}
      
      <span className={`flex-1 text-sm font-medium ${
        type === 'success' 
          ? 'text-green-800 dark:text-green-200' 
          : 'text-red-800 dark:text-red-200'
      }`}>
        {message}
      </span>
      
      <button
        onClick={onClose}
        className={`ml-3 p-1 rounded-full hover:bg-opacity-20 ${
          type === 'success' 
            ? 'hover:bg-green-500 text-green-600 dark:text-green-400' 
            : 'hover:bg-red-500 text-red-600 dark:text-red-400'
        }`}
      >
        <XIcon size={16} />
      </button>
    </div>
  )
}

export default Toast