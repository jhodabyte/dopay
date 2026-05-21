import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export default function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-sm',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  )
}
