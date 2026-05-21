'use client'

import { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          'relative w-full bg-white rounded-[20px] shadow-xl',
          sizeClasses[size]
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2
            id="modal-title"
            className="text-lg"
            style={{ fontWeight: 700, color: 'var(--color-text)' }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
