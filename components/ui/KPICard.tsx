import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  trend?: number
}

export default function KPICard({ title, value, subtitle, icon: Icon, trend }: KPICardProps) {
  const hasTrend = trend !== undefined
  const isPositive = hasTrend && trend >= 0

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {title}
          </p>
          <p
            className="text-2xl font-bold mt-1"
            style={{ color: 'var(--color-text)' }}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {subtitle}
            </p>
          )}
          {hasTrend && (
            <div
              className={cn(
                'flex items-center gap-1 mt-2 text-xs font-medium',
                isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>
                {isPositive ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>
        <div
          className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
          style={{ backgroundColor: 'rgba(0,98,255,0.1)' }}
        >
          <Icon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
        </div>
      </div>
    </div>
  )
}
