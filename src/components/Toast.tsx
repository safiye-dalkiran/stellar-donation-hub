import { useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info' | null
  onClose: () => void
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    if (!type) return
    const timer = setTimeout(() => {
      onClose()
    }, 5000)
    return () => clearTimeout(timer)
  }, [type, onClose])

  if (!type) return null

  const typeStyles = {
    success: 'border-green-800 bg-green-950/40 text-green-400',
    error: 'border-red-800 bg-red-950/40 text-red-400',
    info: 'border-cyan-800 bg-cyan-950/40 text-cyan-400',
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border p-4 backdrop-blur-md shadow-2xl transition-all duration-300">
      <div className={`flex items-start gap-3 rounded-lg border p-3 ${typeStyles[type]}`}>
        <div className="flex-1 text-sm font-semibold">{message}</div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition">
          ✕
        </button>
      </div>
    </div>
  )
}
