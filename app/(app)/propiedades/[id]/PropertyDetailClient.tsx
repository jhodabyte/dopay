'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, ImageIcon, Pencil, User, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EditPropertyModal from '@/components/properties/EditPropertyModal'
import { formatCOP, getPropertyStatusLabel, calculateDaysOverdue, getPaymentStatusLabel } from '@/lib/utils'
import type { Property, Tenant, Payment, PaymentStatus } from '@/lib/types/database'
import { useRouter } from 'next/navigation'

interface PropertyDetailClientProps {
  property: Property
  tenant: Tenant | null
  payments: Payment[]
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartamento',
  house: 'Casa',
  commercial: 'Local comercial',
  warehouse: 'Bodega',
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  transfer: 'Transferencia',
  pse: 'PSE',
  cash: 'Efectivo',
  nequi: 'Nequi',
  daviplata: 'Daviplata',
}

const PAYMENT_CONCEPT_LABELS: Record<string, string> = {
  rent: 'Arriendo',
  admin: 'Administración',
  utilities: 'Servicios',
  other: 'Otro',
}

const PAYMENTS_PER_PAGE = 10

function getPaymentBadgeVariant(status: PaymentStatus): 'paid' | 'pending' | 'overdue' {
  return status
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getTenantPaymentStatus(tenant: Tenant | null, payments: Payment[]): { variant: 'paid' | 'pending' | 'overdue'; label: string } {
  if (!tenant) return { variant: 'pending', label: 'Sin arrendatario' }
  const overduePayment = payments.find((p) => p.status === 'overdue')
  if (overduePayment) {
    const days = calculateDaysOverdue(overduePayment.due_date)
    return { variant: 'overdue', label: `En mora ${days} días` }
  }
  const pendingPayment = payments.find((p) => p.status === 'pending')
  if (pendingPayment) return { variant: 'pending', label: 'Pendiente' }
  return { variant: 'paid', label: 'Al día' }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export default function PropertyDetailClient({ property, tenant, payments }: PropertyDetailClientProps) {
  const router = useRouter()
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(payments.length / PAYMENTS_PER_PAGE)
  const paginatedPayments = payments.slice(
    (currentPage - 1) * PAYMENTS_PER_PAGE,
    currentPage * PAYMENTS_PER_PAGE
  )

  const tenantPaymentStatus = getTenantPaymentStatus(tenant, payments)

  return (
    <>
      <div className="p-6" style={{ backgroundColor: 'var(--color-bg)', minHeight: '100%' }}>
        <nav className="flex items-center gap-2 mb-6 text-sm" aria-label="Breadcrumb">
          <Link href="/propiedades" className="font-medium" style={{ color: '#0062FF' }}>
            Propiedades
          </Link>
          <span style={{ color: 'var(--color-text-muted)' }}>›</span>
          <span style={{ color: 'var(--color-text)' }}>{property.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-col gap-6 lg:w-[60%]">
            <div
              className="bg-white rounded-[16px] overflow-hidden"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
            >
              <div style={{ aspectRatio: '16/9' }}>
                {property.image_url ? (
                  <img
                    src={property.image_url}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: '#F3F4F6' }}
                  >
                    <ImageIcon className="w-12 h-12" style={{ color: '#D1D5DB' }} />
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h1
                    className="text-xl leading-tight"
                    style={{ fontWeight: 700, color: 'var(--color-text)' }}
                  >
                    {property.name}
                  </h1>
                  <Badge variant={
                    property.status === 'active' ? 'active' :
                    property.status === 'overdue' ? 'inMora' : 'vacant'
                  }>
                    {getPropertyStatusLabel(property.status)}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 mb-5">
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {property.address}, {property.city}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-5">
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Tipo</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                      {PROPERTY_TYPE_LABELS[property.type] ?? property.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Ciudad</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                      {property.city}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Inicio contrato</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                      {property.contract_start ? formatDate(property.contract_start) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Fin contrato</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                      {property.contract_end ? formatDate(property.contract_end) : '—'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Arriendo mensual</p>
                    <p className="text-base font-bold" style={{ color: '#0062FF' }}>
                      {formatCOP(property.monthly_rent)}
                    </p>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                >
                  <Pencil className="w-4 h-4 mr-1.5" />
                  Editar propiedad
                </Button>
              </div>
            </div>

            <div
              className="bg-white rounded-[16px] p-6"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
            >
              <h2
                className="text-base font-semibold mb-4"
                style={{ color: 'var(--color-text)' }}
              >
                Arrendatario actual
              </h2>

              {tenant ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-semibold shrink-0"
                      style={{ backgroundColor: '#0062FF' }}
                    >
                      {getInitials(tenant.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                        {tenant.name}
                      </p>
                      <Badge variant={tenantPaymentStatus.variant}>
                        {tenantPaymentStatus.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {tenant.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                      <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {tenant.phone}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/arrendatarios/${tenant.id}`}
                    className="text-sm font-medium"
                    style={{ color: '#0062FF' }}
                  >
                    Ver perfil completo →
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-full"
                    style={{ backgroundColor: '#F3F4F6' }}
                  >
                    <User className="w-6 h-6" style={{ color: '#9CA3AF' }} />
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Sin arrendatario asignado
                  </p>
                  <Button variant="secondary" size="sm">
                    Asignar arrendatario
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-[40%]">
            <div
              className="bg-white rounded-[16px] p-6 h-full"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2
                  className="text-base font-semibold"
                  style={{ color: 'var(--color-text)' }}
                >
                  Historial de pagos
                </h2>
                <Button variant="primary" size="sm">
                  Registrar nuevo pago
                </Button>
              </div>

              {payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    No hay pagos registrados aún
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b" style={{ borderColor: '#F3F4F6' }}>
                          <th className="pb-3 text-left font-medium" style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Concepto</th>
                          <th className="pb-3 text-left font-medium" style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Fecha</th>
                          <th className="pb-3 text-right font-medium" style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Monto</th>
                          <th className="pb-3 text-center font-medium" style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedPayments.map((payment) => (
                          <tr
                            key={payment.id}
                            className="border-b transition-colors hover:bg-[#F7F8FA]"
                            style={{ borderColor: '#F3F4F6' }}
                          >
                            <td className="py-3 pr-2">
                              <span style={{ color: 'var(--color-text)' }}>
                                {PAYMENT_CONCEPT_LABELS[payment.concept] ?? payment.concept}
                              </span>
                            </td>
                            <td className="py-3 pr-2 whitespace-nowrap" style={{ color: 'var(--color-text-secondary)' }}>
                              {formatDate(payment.due_date)}
                            </td>
                            <td className="py-3 text-right whitespace-nowrap font-medium" style={{ color: 'var(--color-text)' }}>
                              {formatCOP(payment.amount)}
                            </td>
                            <td className="py-3 text-center">
                              <Badge variant={getPaymentBadgeVariant(payment.status)}>
                                {getPaymentStatusLabel(payment.status)}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {(currentPage - 1) * PAYMENTS_PER_PAGE + 1}–{Math.min(currentPage * PAYMENTS_PER_PAGE, payments.length)} de {payments.length}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="Página anterior"
                        >
                          <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                        </button>
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="Página siguiente"
                        >
                          <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <EditPropertyModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdated={() => { setShowEditModal(false); router.refresh() }}
        property={property}
      />
    </>
  )
}
