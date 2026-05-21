'use client'

import { useState, useEffect } from 'react'
import { Building2, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import KPICard from '@/components/ui/KPICard'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import PendingPayments from '@/components/dashboard/PendingPayments'
import RegisterPaymentModal from '@/components/dashboard/RegisterPaymentModal'
import { useTopbar } from '@/lib/topbar-context'
import { formatCOP } from '@/lib/utils'
import type { DashboardData } from '@/app/(app)/dashboard/data'
import type { Property } from '@/lib/types/database'

interface DashboardClientProps {
  data: DashboardData
}

const DONUT_COLORS = {
  active: '#10B981',
  vacant: '#9CA3AF',
  overdue: '#EF4444',
}

function formatYAxisCOP(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value}`
}

function getGreeting(name: string): string {
  const hour = new Date().getHours()
  if (hour < 12) return `Buenos días, ${name}`
  if (hour < 18) return `Buenas tardes, ${name}`
  return `Buenas noches, ${name}`
}

export default function DashboardClient({ data }: DashboardClientProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>()
  const { setConfig } = useTopbar()

  const firstName = data.profile.full_name.split(' ')[0]

  useEffect(() => {
    setConfig({
      title: 'Dashboard',
      subtitle: getGreeting(firstName),
      ctaLabel: 'Registrar pago',
      onCtaClick: () => setModalOpen(true),
      notificationCount: data.kpis.pendingPayments,
    })
  }, [setConfig, firstName, data.kpis.pendingPayments])

  function handleRegisterPaymentForPending(paymentId: string) {
    const pendingItem = data.pendingPaymentsList.find((item) => item.paymentId === paymentId)
    const matchedProperty = pendingItem
      ? data.properties.find((property) => property.name === pendingItem.propertyName)
      : undefined
    setSelectedPropertyId(matchedProperty?.id)
    setModalOpen(true)
  }

  const pieData = [
    { name: 'Activas', value: data.propertyDistribution.active, color: DONUT_COLORS.active },
    { name: 'Desocupadas', value: data.propertyDistribution.vacant, color: DONUT_COLORS.vacant },
    { name: 'En mora', value: data.propertyDistribution.overdue, color: DONUT_COLORS.overdue },
  ].filter((entry) => entry.value > 0)

  return (
    <>
      <div className="p-6 space-y-5">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
          data-testid="kpi-row"
        >
          <KPICard
            title="Propiedades activas"
            value={String(data.kpis.activeProperties)}
            icon={Building2}
            trend={data.kpis.activePropertiesTrend}
          />
          <KPICard
            title="Pagos recibidos este mes"
            value={String(data.kpis.paymentsThisMonth)}
            icon={CheckCircle}
            trend={data.kpis.paymentsThisMonthTrend}
          />
          <KPICard
            title="Pagos pendientes"
            value={String(data.kpis.pendingPayments)}
            icon={Clock}
            trend={data.kpis.pendingPaymentsTrend}
          />
          <KPICard
            title="Ingresos del mes"
            value={formatCOP(data.kpis.monthlyIncome)}
            icon={TrendingUp}
            trend={data.kpis.monthlyIncomeTrend}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-testid="content-row">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                Actividad reciente
              </h2>
              <a
                href="/pagos"
                className="text-sm font-medium hover:underline"
                style={{ color: '#0062FF' }}
              >
                Ver todo
              </a>
            </div>
            <ActivityFeed items={data.activity} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                Cobros pendientes
              </h2>
              {data.pendingPaymentsList.length > 0 && (
                <span
                  className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: '#EF4444' }}
                  data-testid="pending-count-badge"
                >
                  {data.pendingPaymentsList.length}
                </span>
              )}
            </div>
            <PendingPayments
              items={data.pendingPaymentsList}
              onRegisterPayment={handleRegisterPaymentForPending}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-testid="bottom-row">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="mb-4">
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                Ingresos mensuales
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                Últimos 6 meses
              </p>
            </div>
            <div data-testid="income-chart" style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.monthlyIncome}
                  margin={{ top: 4, right: 4, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={formatYAxisCOP}
                    tick={{ fontSize: 11, fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCOP(value), 'Ingresos']}
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="income" fill="#0062FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="mb-4">
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                Estado de propiedades
              </h2>
            </div>
            <div
              data-testid="property-distribution-chart"
              className="flex flex-col items-center"
            >
              {pieData.length > 0 ? (
                <>
                  <div style={{ height: '180px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number, name: string) => [value, name]}
                          contentStyle={{
                            borderRadius: '10px',
                            border: '1px solid #E5E7EB',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {pieData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-1.5">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {entry.name} ({entry.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Sin propiedades registradas
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <RegisterPaymentModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedPropertyId(undefined)
        }}
        defaultPropertyId={selectedPropertyId}
        properties={data.properties as Property[]}
      />
    </>
  )
}
