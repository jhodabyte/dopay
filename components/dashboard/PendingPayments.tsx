'use client'

import { CheckCircle } from 'lucide-react'
import { formatCOP } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import type { PendingPaymentItem } from '@/app/(app)/dashboard/data'

interface PendingPaymentsProps {
  items: PendingPaymentItem[]
  onRegisterPayment: (paymentId: string, propertyId?: string) => void
}

function formatDueDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function PendingPayments({ items, onRegisterPayment }: PendingPaymentsProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-full mb-3"
          style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}
        >
          <CheckCircle className="w-6 h-6" style={{ color: '#10B981' }} />
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
          ¡Todos los pagos están al día!
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          No hay cobros pendientes
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {items.map((item, index) => {
        const badgeVariant = item.status === 'overdue' ? 'overdue' : 'pending'
        const badgeLabel = item.status === 'overdue'
          ? `${item.daysOverdue}d vencido`
          : 'Pendiente'

        return (
          <div key={item.paymentId}>
            <div className="flex items-center gap-3 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                  {item.tenantName}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  {item.propertyName}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                  {formatCOP(item.amount)}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {formatDueDate(item.dueDate)}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <Badge variant={badgeVariant} label={badgeLabel} />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onRegisterPayment(item.paymentId)}
                >
                  Registrar
                </Button>
              </div>
            </div>
            {index < items.length - 1 && (
              <div className="border-b border-gray-100" />
            )}
          </div>
        )
      })}
    </div>
  )
}
