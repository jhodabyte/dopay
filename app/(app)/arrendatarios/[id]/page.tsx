import { Suspense } from 'react'
import Link from 'next/link'
import { Mail, Phone, Calendar, Building2, Pencil, ChevronRight, Plus } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import TenantPaymentSection from './TenantPaymentSection'
import { getTenantDetail, computeTenantStats } from './data'
import { formatCOP } from '@/lib/utils'

const MOCK_OWNER_ID = 'user-001'

interface PageProps {
  params: Promise<{ id: string }>
}

function getTenantInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function formatDateLong(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
}

function getTenantStatusInfo(payments: { status: string; due_date: string }[]) {
  const hasOverdue = payments.some((p) => p.status === 'overdue')
  const hasPending = payments.some((p) => p.status === 'pending')

  if (hasOverdue) {
    const oldestOverdue = payments
      .filter((p) => p.status === 'overdue')
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .at(0)

    if (oldestOverdue) {
      const daysOverdue = Math.floor(
        (Date.now() - new Date(oldestOverdue.due_date).getTime()) / (1000 * 60 * 60 * 24)
      )
      return { variant: 'overdue' as const, label: `En mora ${daysOverdue} días` }
    }
    return { variant: 'overdue' as const, label: 'En mora' }
  }
  if (hasPending) return { variant: 'pending' as const, label: 'Pendiente' }
  return { variant: 'paid' as const, label: 'Al día' }
}

export default async function ArrendatarioDetailPage({ params }: PageProps) {
  const { id } = await params
  const detail = await getTenantDetail(id, MOCK_OWNER_ID)

  if (!detail) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <p style={{ color: '#4B5563' }}>Arrendatario no encontrado.</p>
      </div>
    )
  }

  const { tenant, payments, properties } = detail
  const stats = computeTenantStats(payments, tenant)
  const statusInfo = getTenantStatusInfo(payments)

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b" style={{ borderColor: '#F7F8FA' }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>{tenant.name}</h1>
          <p className="text-sm" style={{ color: '#4B5563' }}>
            Arrendatario · Cliente desde {formatDateLong(tenant.created_at)}
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-sm font-medium bg-[#0062FF] text-white rounded-[10px] hover:bg-[#0051D4] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Registrar pago
        </button>
      </div>

      <div className="p-6 flex flex-col gap-6">
        <nav className="flex items-center gap-2 text-sm" aria-label="Migas de pan">
          <Link href="/pagos" className="hover:underline" style={{ color: '#0062FF' }}>
            Pagos
          </Link>
          <ChevronRight className="w-4 h-4" style={{ color: '#9CA3AF' }} />
          <span style={{ color: '#4B5563' }}>{tenant.name}</span>
        </nav>

        <div
          className="bg-white rounded-[16px] shadow-sm p-7"
          id="tdProfileCard"
          data-testid="profile-card"
        >
          <div className="flex flex-wrap items-start gap-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: '#0062FF', fontSize: '24px', fontWeight: 700 }}
              aria-label={`Avatar de ${tenant.name}`}
            >
              {getTenantInitials(tenant.name)}
            </div>

            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <h2 className="text-xl font-bold" style={{ color: '#1A1A1A' }} data-testid="tenant-name">
                {tenant.name}
              </h2>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" style={{ color: '#4B5563' }} />
                <span className="text-sm" style={{ color: '#4B5563' }} data-testid="tenant-email">
                  {tenant.email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" style={{ color: '#4B5563' }} />
                <span className="text-sm" style={{ color: '#4B5563' }} data-testid="tenant-phone">
                  {tenant.phone}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 shrink-0" style={{ color: '#9CA3AF' }} />
                <span className="text-sm" style={{ color: '#9CA3AF' }}>
                  Cliente desde {formatDateLong(tenant.created_at)}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 shrink-0">
              <Badge variant={statusInfo.variant} data-testid="tenant-status-badge">
                {statusInfo.label}
              </Badge>
              <button
                className="flex items-center gap-2 text-sm font-medium px-3 h-8 rounded-[10px] bg-[#F7F8FA] hover:bg-gray-200 transition-colors"
                style={{ color: '#4B5563' }}
              >
                <Pencil className="w-4 h-4" />
                Editar información
              </button>
            </div>
          </div>

          {properties.length > 0 && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-sm font-semibold mb-3" style={{ color: '#4B5563' }}>
                Propiedades asignadas
              </p>
              <div className="flex flex-wrap gap-2">
                {properties.map((property) => (
                  <Link
                    key={property.id}
                    href={`/propiedades/${property.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border hover:bg-blue-50 transition-colors"
                    style={{
                      borderColor: '#E5E7EB',
                      color: '#1A1A1A',
                      borderRadius: '9999px',
                    }}
                  >
                    <Building2 className="w-3.5 h-3.5" style={{ color: '#0062FF' }} />
                    {property.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Suspense fallback={<Spinner />}>
              <TenantPaymentSection
                tenantId={tenant.id}
                payments={payments}
                properties={properties}
              />
            </Suspense>
          </div>

          <div className="flex flex-col gap-4" data-testid="tenant-stats">
            <div className="bg-white rounded-[16px] shadow-sm p-6">
              <h3 className="text-base font-bold mb-4" style={{ color: '#1A1A1A' }}>
                Estadísticas
              </h3>

              <div className="flex flex-col gap-3">
                <div className="rounded-[12px] p-4" style={{ backgroundColor: '#F7F8FA' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: '#9CA3AF' }}>
                    Promedio días de retraso
                  </p>
                  <p className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
                    {stats.avgDaysLate} días
                  </p>
                </div>

                <div className="rounded-[12px] p-4" style={{ backgroundColor: '#F7F8FA' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: '#9CA3AF' }}>
                    Total pagado
                  </p>
                  <p className="text-xl font-bold" style={{ color: '#10B981' }}>
                    {formatCOP(stats.totalPaid)}
                  </p>
                </div>

                <div className="rounded-[12px] p-4" style={{ backgroundColor: '#F7F8FA' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: '#9CA3AF' }}>
                    Tiempo como arrendatario
                  </p>
                  <p className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
                    {stats.tenancyDuration}
                  </p>
                </div>

                <div className="rounded-[12px] p-4" style={{ backgroundColor: '#F7F8FA' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: '#9CA3AF' }}>
                    Próximo pago
                  </p>
                  {stats.nextPayment ? (
                    <>
                      <p className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
                        {formatCOP(stats.nextPayment.amount)}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#4B5563' }}>
                        {new Date(stats.nextPayment.due_date).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm" style={{ color: '#9CA3AF' }}>
                      Sin pagos pendientes
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold mb-3" style={{ color: '#4B5563' }}>
                  Cumplimiento últimos 6 meses
                </p>
                <ComplianceChart data={stats.last6MonthsCompliance} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function ComplianceChart({
  data,
}: {
  data: { month: string; paid: number; pending: number }[]
}) {
  const maxValue = Math.max(...data.map((d) => d.paid + d.pending), 1)

  return (
    <div className="flex items-end gap-2 h-20" role="img" aria-label="Gráfico de cumplimiento">
      {data.map((item) => {
        const total = item.paid + item.pending
        const paidHeight = total > 0 ? (item.paid / maxValue) * 64 : 0
        const pendingHeight = total > 0 ? (item.pending / maxValue) * 64 : 4

        return (
          <div key={item.month} className="flex flex-col items-center gap-1 flex-1">
            <div className="flex flex-col-reverse items-center w-full gap-px" style={{ height: '64px' }}>
              {item.paid > 0 && (
                <div
                  className="w-full rounded-sm"
                  style={{
                    height: `${paidHeight}px`,
                    backgroundColor: '#10B981',
                    minHeight: '4px',
                  }}
                  title={`${item.paid} pagados`}
                />
              )}
              {item.pending > 0 && (
                <div
                  className="w-full rounded-sm"
                  style={{
                    height: `${pendingHeight}px`,
                    backgroundColor: '#EF4444',
                    minHeight: '4px',
                  }}
                  title={`${item.pending} pendientes`}
                />
              )}
              {total === 0 && (
                <div
                  className="w-full rounded-sm"
                  style={{ height: '4px', backgroundColor: '#E5E7EB' }}
                />
              )}
            </div>
            <span className="text-[10px]" style={{ color: '#9CA3AF' }}>
              {item.month}
            </span>
          </div>
        )
      })}
    </div>
  )
}
