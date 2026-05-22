'use client'

import { useState, Suspense, useEffect } from 'react'
import { DollarSign, Clock, AlertTriangle, CalendarClock } from 'lucide-react'
import KPICard from '@/components/ui/KPICard'
import Spinner from '@/components/ui/Spinner'
import PaymentsTable from '@/components/payments/PaymentsTable'
import RegisterPaymentModal from '@/components/payments/RegisterPaymentModal'
import { formatCOP } from '@/lib/utils'
import { useTopbar } from '@/lib/topbar-context'
import type { PaymentWithDetails } from '@/lib/types'
import type { PaymentsSummary } from './data'
import type { Property } from '@/lib/types'

interface PagosClientProps {
  payments: PaymentWithDetails[]
  summary: PaymentsSummary
  properties: Property[]
}

export default function PagosClient({ payments: initialPayments, summary, properties }: PagosClientProps) {
  const [payments] = useState<PaymentWithDetails[]>(initialPayments)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [defaultPropertyId, setDefaultPropertyId] = useState<string | undefined>(undefined)
  const { setConfig } = useTopbar()

  function openRegisterModal(_paymentId?: string, propertyId?: string) {
    setDefaultPropertyId(propertyId)
    setIsModalOpen(true)
  }

  useEffect(() => {
    setConfig({
      title: 'Pagos',
      subtitle: 'Seguimiento de cobros y arrendatarios',
      ctaLabel: 'Registrar pago',
      onCtaClick: () => openRegisterModal(),
    })
  }, [setConfig])

  return (
    <>
      <div className="p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="kpi-cards">
          <KPICard
            title="Total recaudado"
            value={formatCOP(summary.totalCollectedThisMonth)}
            subtitle="Este mes"
            icon={DollarSign}
          />
          <div className="bg-white rounded-2xl shadow-sm p-5" data-testid="kpi-pending">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#4B5563' }}>
                  Pendientes de cobro
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#1A1A1A' }}>
                  {summary.pendingCount}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                  pagos por confirmar
                </p>
              </div>
              <div
                className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
                style={{ backgroundColor: 'rgba(245,158,11,0.1)' }}
              >
                <Clock className="w-5 h-5" style={{ color: '#F59E0B' }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5" data-testid="kpi-overdue">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#4B5563' }}>
                  En mora
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#1A1A1A' }}>
                  {summary.overdueCount}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                  pagos vencidos
                </p>
              </div>
              <div
                className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
                style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}
              >
                <AlertTriangle className="w-5 h-5" style={{ color: '#EF4444' }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5" data-testid="kpi-upcoming">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#4B5563' }}>
                  Próximos vencimientos
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#1A1A1A' }}>
                  {summary.upcomingCount}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                  en los próximos 7 días
                </p>
              </div>
              <div
                className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
                style={{ backgroundColor: 'rgba(0,98,255,0.1)' }}
              >
                <CalendarClock className="w-5 h-5" style={{ color: '#0062FF' }} />
              </div>
            </div>
          </div>
        </div>

        <Suspense fallback={<Spinner />}>
          <PaymentsTable
            payments={payments}
            onRegisterPayment={openRegisterModal}
          />
        </Suspense>
      </div>

      <RegisterPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        properties={properties}
        defaultPropertyId={defaultPropertyId}
        onSuccess={() => {}}
      />
    </>
  )
}
