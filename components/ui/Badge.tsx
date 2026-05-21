import { cn } from '@/lib/utils'

type BadgeVariant = 'paid' | 'pending' | 'overdue' | 'active' | 'vacant' | 'inMora'

interface BadgeProps {
  variant: BadgeVariant
  children?: React.ReactNode
  label?: string
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  paid: { bg: 'rgba(16,185,129,0.1)', text: '#10B981' },
  active: { bg: 'rgba(16,185,129,0.1)', text: '#10B981' },
  pending: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B' },
  overdue: { bg: 'rgba(239,68,68,0.1)', text: '#EF4444' },
  inMora: { bg: 'rgba(239,68,68,0.1)', text: '#EF4444' },
  vacant: { bg: 'rgba(156,163,175,0.1)', text: '#9CA3AF' },
}

export default function Badge({ variant, children, label }: BadgeProps) {
  const styles = variantStyles[variant]

  return (
    <span
      className={cn('inline-flex items-center px-[10px] py-0.5 rounded-full text-xs font-medium')}
      style={{ backgroundColor: styles.bg, color: styles.text }}
    >
      {children ?? label}
    </span>
  )
}
