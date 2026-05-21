'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Download,
  Search,
  CreditCard,
  Receipt,
  ChevronLeft,
  ChevronRight,
  FileX,
  Plus,
} from 'lucide-react'
import { cn, formatCOP, getPaymentStatusLabel } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import type { PaymentWithDetails } from '@/lib/types'
import type { PaymentStatus, PaymentConcept } from '@/lib/types'

interface PaymentsTableProps {
  payments: PaymentWithDetails[]
  onRegisterPayment?: (paymentId?: string, propertyId?: string) => void
  showTenantLinks?: boolean
}

const CONCEPT_LABELS: Record<PaymentConcept, string> = {
  rent: 'Arriendo',
  admin: 'Administración',
  utilities: 'Servicios',
  other: 'Otro',
}

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'paid', label: 'Pagados' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'overdue', label: 'Vencidos' },
]

const ROWS_PER_PAGE_OPTIONS = [
  { value: '10', label: '10 por página' },
  { value: '25', label: '25 por página' },
  { value: '50', label: '50 por página' },
]

function getTenantInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function formatDueDate(dateString: string, status: PaymentStatus): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function exportPaymentsToCSV(payments: PaymentWithDetails[]) {
  const headers = ['Arrendatario', 'Propiedad', 'Concepto', 'Monto', 'Fecha límite', 'Estado']
  const rows = payments.map((p) => [
    p.tenant?.name ?? '',
    p.property?.name ?? '',
    CONCEPT_LABELS[p.concept],
    p.amount.toString(),
    p.due_date,
    getPaymentStatusLabel(p.status),
  ])

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'pagos.csv'
  link.click()
  URL.revokeObjectURL(url)
}

function generateMonthOptions() {
  const options = [{ value: 'all', label: 'Todos los meses' }]
  const now = new Date()
  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
    options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) })
  }
  return options
}

export default function PaymentsTable({
  payments,
  onRegisterPayment,
  showTenantLinks = true,
}: PaymentsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const statusFilter = (searchParams.get('estado') ?? 'all') as PaymentStatus | 'all'
  const propertyFilter = searchParams.get('propiedad') ?? 'all'
  const monthFilter = searchParams.get('mes') ?? 'all'
  const searchQuery = searchParams.get('buscar') ?? ''
  const currentPage = Number(searchParams.get('pagina') ?? '1')
  const rowsPerPage = Number(searchParams.get('filas') ?? '10')

  const [localSearch, setLocalSearch] = useState(searchQuery)

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === '' || value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete('pagina')
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  function handleSearchCommit(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('buscar', value)
    } else {
      params.delete('buscar')
    }
    params.delete('pagina')
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const uniqueProperties = useMemo(() => {
    const seen = new Map<string, string>()
    payments.forEach((p) => {
      if (p.property) seen.set(p.property.id, p.property.name)
    })
    return [{ value: 'all', label: 'Todas las propiedades' }, ...Array.from(seen.entries()).map(([value, label]) => ({ value, label }))]
  }, [payments])

  const monthOptions = useMemo(() => generateMonthOptions(), [])

  const filtered = useMemo(() => {
    return payments.filter((payment) => {
      if (statusFilter !== 'all' && payment.status !== statusFilter) return false
      if (propertyFilter !== 'all' && payment.property_id !== propertyFilter) return false
      if (monthFilter !== 'all') {
        const [year, month] = monthFilter.split('-').map(Number)
        const dueDate = new Date(payment.due_date)
        if (dueDate.getFullYear() !== year || dueDate.getMonth() + 1 !== month) return false
      }
      if (searchQuery) {
        const tenantName = payment.tenant?.name?.toLowerCase() ?? ''
        if (!tenantName.includes(searchQuery.toLowerCase())) return false
      }
      return true
    })
  }, [payments, statusFilter, propertyFilter, monthFilter, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage)

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('pagina', String(page))
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const pageNumbers = useMemo(() => {
    const pages: number[] = []
    for (let i = Math.max(1, safePage - 2); i <= Math.min(totalPages, safePage + 2); i++) {
      pages.push(i)
    }
    return pages
  }, [safePage, totalPages])

  return (
    <div className="bg-white rounded-[16px] overflow-hidden shadow-sm">
      <div className="px-6 py-4 flex flex-wrap items-center gap-3 border-b border-gray-100">
        <h2 className="text-lg mr-auto" style={{ fontWeight: 700, color: '#1A1A1A' }}>
          Pagos
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-[10px] overflow-hidden border border-[#E5E7EB] bg-[#F7F8FA]">
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateParam('estado', opt.value)}
                className={cn(
                  'px-3 h-8 text-xs font-medium transition-colors',
                  statusFilter === opt.value
                    ? 'bg-[#0062FF] text-white'
                    : 'text-[#4B5563] hover:bg-gray-100'
                )}
                data-testid={`filter-status-${opt.value}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <Select
            options={uniqueProperties}
            value={propertyFilter}
            onChange={(e) => updateParam('propiedad', e.target.value)}
            name="propertyFilter"
          />

          <Select
            options={monthOptions}
            value={monthFilter}
            onChange={(e) => updateParam('mes', e.target.value)}
            name="monthFilter"
          />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#9CA3AF' }} />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchCommit(localSearch)
              }}
              onBlur={() => handleSearchCommit(localSearch)}
              placeholder="Buscar arrendatario..."
              className="h-8 pl-9 pr-3 border border-[#E5E7EB] rounded-[10px] text-sm outline-none focus:border-[#0062FF] w-52"
              style={{ color: '#1A1A1A' }}
              data-testid="search-input"
            />
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => exportPaymentsToCSV(filtered)}
          >
            <Download className="w-4 h-4 mr-1.5" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" data-testid="payments-table">
          <thead>
            <tr style={{ borderBottom: '1px solid #F7F8FA' }}>
              {['Arrendatario', 'Propiedad', 'Concepto', 'Monto', 'Fecha límite', 'Estado', 'Acciones'].map((col) => (
                <th
                  key={col}
                  className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: '#9CA3AF' }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <FileX className="w-10 h-10" style={{ color: '#9CA3AF' }} />
                    <p className="text-base font-medium" style={{ color: '#4B5563' }}>
                      No hay pagos registrados
                    </p>
                    {onRegisterPayment && (
                      <Button variant="primary" size="sm" onClick={() => onRegisterPayment()}>
                        <Plus className="w-4 h-4 mr-1.5" />
                        Registrar pago
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((payment, index) => {
                const isOverdue = payment.status === 'overdue'
                const rowBg = index % 2 === 0 ? '#FFFFFF' : '#F7F8FA'

                return (
                  <tr
                    key={payment.id}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                    style={{ backgroundColor: rowBg, borderBottom: '1px solid #F7F8FA' }}
                    data-testid={`payment-row-${payment.id}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ backgroundColor: '#0062FF' }}
                        >
                          {payment.tenant ? getTenantInitials(payment.tenant.name) : '?'}
                        </div>
                        {showTenantLinks && payment.tenant ? (
                          <Link
                            href={`/arrendatarios/${payment.tenant.id}`}
                            className="font-medium hover:underline"
                            style={{ color: '#1A1A1A' }}
                            data-testid={`tenant-link-${payment.tenant.id}`}
                          >
                            {payment.tenant.name}
                          </Link>
                        ) : (
                          <span className="font-medium" style={{ color: '#1A1A1A' }}>
                            {payment.tenant?.name ?? '—'}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-medium" style={{ color: '#1A1A1A' }}>
                        {payment.property?.name ?? '—'}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                        {payment.property?.address ?? ''}
                      </p>
                    </td>

                    <td className="px-4 py-3" style={{ color: '#4B5563' }}>
                      {CONCEPT_LABELS[payment.concept]}
                    </td>

                    <td className="px-4 py-3 font-medium" style={{ color: '#1A1A1A' }}>
                      {formatCOP(payment.amount)}
                    </td>

                    <td className="px-4 py-3">
                      <span style={{ color: isOverdue ? '#EF4444' : '#4B5563' }}>
                        {formatDueDate(payment.due_date, payment.status)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <Badge variant={payment.status}>
                        {getPaymentStatusLabel(payment.status)}
                      </Badge>
                    </td>

                    <td className="px-4 py-3">
                      {payment.status === 'paid' ? (
                        <button
                          className="flex items-center gap-1.5 text-xs font-medium px-3 h-8 rounded-[10px] bg-[#F7F8FA] hover:bg-gray-200 transition-colors"
                          style={{ color: '#4B5563' }}
                          title="Ver comprobante"
                        >
                          <Receipt className="w-4 h-4" />
                          <span className="hidden sm:inline">Ver comprobante</span>
                        </button>
                      ) : (
                        <button
                          className="flex items-center gap-1.5 text-xs font-medium px-3 h-8 rounded-[10px] bg-[#EFF6FF] hover:bg-blue-100 transition-colors"
                          style={{ color: '#0062FF' }}
                          onClick={() => onRegisterPayment?.(payment.id, payment.property_id ?? undefined)}
                          title="Registrar pago"
                          data-testid={`register-payment-btn-${payment.id}`}
                        >
                          <CreditCard className="w-4 h-4" />
                          <span className="hidden sm:inline">Registrar</span>
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <p className="text-sm" style={{ color: '#4B5563' }}>
              Mostrando{' '}
              <span className="font-medium" style={{ color: '#1A1A1A' }}>
                {Math.min((safePage - 1) * rowsPerPage + 1, filtered.length)}–
                {Math.min(safePage * rowsPerPage, filtered.length)}
              </span>{' '}
              de{' '}
              <span className="font-medium" style={{ color: '#1A1A1A' }}>
                {filtered.length}
              </span>{' '}
              registros
            </p>
            <Select
              options={ROWS_PER_PAGE_OPTIONS}
              value={String(rowsPerPage)}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString())
                params.set('filas', e.target.value)
                params.delete('pagina')
                router.replace(`?${params.toString()}`, { scroll: false })
              }}
              name="rowsPerPage"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              className="flex items-center justify-center w-8 h-8 rounded-[10px] text-sm disabled:opacity-40 hover:bg-gray-100 transition-colors"
              style={{ color: '#4B5563' }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {pageNumbers.map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-[10px] text-sm font-medium transition-colors',
                  pageNum === safePage
                    ? 'bg-[#0062FF] text-white'
                    : 'hover:bg-gray-100 text-[#4B5563]'
                )}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
              className="flex items-center justify-center w-8 h-8 rounded-[10px] text-sm disabled:opacity-40 hover:bg-gray-100 transition-colors"
              style={{ color: '#4B5563' }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
