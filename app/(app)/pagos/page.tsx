'use client'

import { useState, useEffect, Suspense } from 'react'
import { DollarSign, Clock, AlertTriangle, CalendarClock, Plus } from 'lucide-react'
import KPICard from '@/components/ui/KPICard'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import PaymentsTable from '@/components/payments/PaymentsTable'
import RegisterPaymentModal from '@/components/payments/RegisterPaymentModal'
import { getPaymentsData, getPaymentsSummary } from './data'
import { formatCOP } from '@/lib/utils'
import { mockProperties } from '@/lib/mock-data'
import type { PaymentWithDetails } from '@/lib/types'
import type { PaymentsSummary } from './data'

const MOCK_OWNER_ID = 'user-001'

function PaymentsPageContent() {
  const [payments, setPayments] = useState<PaymentWithDetails[]>([])
  const [summary, setSummary] = useState<PaymentsSummary | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [defaultPropertyId, setDefaultPropertyId] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  async function loadData() {
    const [{ payments: fetchedPayments }, fetchedSummary] = await Promise.all([
      getPaymentsData(MOCK_OWNER_ID),
      getPaymentsSummary(MOCK_OWNER_ID),
    ])
    setPayments(fetchedPayments)
    setSummary(fetchedSummary)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  function openRegisterModal(_paymentId?: string, propertyId?: string) {
    setDefaultPropertyId(propertyId)
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Spinner />
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b" style={{ borderColor: '#F7F8FA' }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>Pagos</h1>
          <p className="text-sm" style={{ color: '#4B5563' }}>Seguimiento de cobros y arrendatarios</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => openRegisterModal()}>
          <Plus className="w-4 h-4 mr-1.5" />
          Registrar pago
        </Button>
      </div>

      <div className="p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="kpi-cards">
          <KPICard
            title="Total recaudado"
            value={summary ? formatCOP(summary.totalCollectedThisMonth) : '$0'}
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
                  {summary?.pendingCount ?? 0}
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
                  {summary?.overdueCount ?? 0}
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
                  {summary?.upcomingCount ?? 0}
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
        properties={mockProperties}
        defaultPropertyId={defaultPropertyId}
        onSuccess={loadData}
      />
    </>
  )
}

export default function PagosPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Spinner />
      </div>
    }>
      <PaymentsPageContent />
    </Suspense>
  )
}
