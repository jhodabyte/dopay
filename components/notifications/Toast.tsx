'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  message: string
  type: ToastType
  onDismiss: () => void
}

const toastConfig: Record<ToastType, { icon: React.ReactNode; borderColor: string; iconColor: string; bg: string }> = {
  success: {
    icon: <CheckCircle className="w-5 h-5 shrink-0" />,
    borderColor: '#10B981',
    iconColor: '#10B981',
    bg: '#ECFDF5',
  },
  error: {
    icon: <XCircle className="w-5 h-5 shrink-0" />,
    borderColor: '#EF4444',
    iconColor: '#EF4444',
    bg: '#FEF2F2',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 shrink-0" />,
    borderColor: '#F59E0B',
    iconColor: '#F59E0B',
    bg: '#FFFBEB',
  },
  info: {
    icon: <Info className="w-5 h-5 shrink-0" />,
    borderColor: '#0062FF',
    iconColor: '#0062FF',
    bg: '#EBF2FF',
  },
}

export default function Toast({ message, type, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false)
  const config = toastConfig[type]

  useEffect(() => {
    const showTimer = requestAnimationFrame(() => setVisible(true))
    const dismissTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300)
    }, 5000)

    return () => {
      cancelAnimationFrame(showTimer)
      clearTimeout(dismissTimer)
    }
  }, [onDismiss])

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-[10px] shadow-lg max-w-sm w-full',
        'transition-all duration-300',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      )}
      style={{
        backgroundColor: config.bg,
        borderLeft: `4px solid ${config.borderColor}`,
      }}
    >
      <span style={{ color: config.iconColor }}>{config.icon}</span>
      <p className="flex-1 text-sm font-medium" style={{ color: '#1A1A1A' }}>
        {message}
      </p>
      <button
        onClick={() => {
          setVisible(false)
          setTimeout(onDismiss, 300)
        }}
        className="p-0.5 rounded hover:bg-black/10 transition-colors"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" style={{ color: '#4B5563' }} />
      </button>
    </div>
  )
}
