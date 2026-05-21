'use client'

import { useState } from 'react'
import PaymentsTable from '@/components/payments/PaymentsTable'
import RegisterPaymentModal from '@/components/payments/RegisterPaymentModal'
import { formatCOP } from '@/lib/utils'
import { mockProperties } from '@/lib/mock-data'
import type { Payment, Property, Tenant } from '@/lib/types'
import type { PaymentWithDetails } from '@/lib/types'

interface TenantPaymentSectionProps {
  tenantId: string
  tenant: Tenant
  payments: Payment[]
  properties: Property[]
}

export default function TenantPaymentSection({
  tenantId,
  tenant,
  payments,
  properties,
}: TenantPaymentSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [defaultPropertyId, setDefaultPropertyId] = useState<string | undefined>(undefined)

  const paymentsWithDetails: PaymentWithDetails[] = payments.map((payment) => ({
    ...payment,
    property: properties.find((p) => p.id === payment.property_id) ?? null,
    tenant,
  }))

  const paidTotal = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
  const pendingTotal = payments.filter((p) => p.status !== 'paid').reduce((sum, p) => sum + p.amount, 0)

  function openModal(_paymentId?: string, propertyId?: string) {
    setDefaultPropertyId(propertyId ?? properties[0]?.id)
    setIsModalOpen(true)
  }

  return (
    <div className="flex flex-col gap-3">
      <PaymentsTable
        payments={paymentsWithDetails}
        onRegisterPayment={openModal}
        showTenantLinks={false}
      />

      <div
        className="bg-white rounded-[16px] shadow-sm px-6 py-4 flex flex-wrap gap-4"
        data-testid="payment-totals"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: '#4B5563' }}>
            Total pagado:
          </span>
          <span className="text-sm font-bold" style={{ color: '#10B981' }}>
            {formatCOP(paidTotal)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: '#4B5563' }}>
            Pendiente:
          </span>
          <span className="text-sm font-bold" style={{ color: '#F59E0B' }}>
            {formatCOP(pendingTotal)}
          </span>
        </div>
      </div>

      <RegisterPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        properties={mockProperties.filter((p) => p.tenant_id === tenantId)}
        defaultPropertyId={defaultPropertyId}
      />
    </div>
  )
}
