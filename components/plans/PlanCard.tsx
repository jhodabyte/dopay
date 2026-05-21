'use client'

import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { BillingCycle, SubscriptionPlan } from '@/lib/types/database'

interface PriceRange {
  min: number
  max: number
}

interface PlanCardProps {
  plan: SubscriptionPlan
  planLabel: string
  description: string
  monthlyPriceRange: PriceRange
  billingCycle: BillingCycle
  features: string[]
  highlighted?: boolean
  context: 'marketing' | 'registration'
  onSelectPlan?: (plan: SubscriptionPlan, billingCycle: BillingCycle) => void
  isSelected?: boolean
}

function formatCOPRange(range: PriceRange): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n)
  return `${fmt(range.min)} – ${fmt(range.max)}`
}

function applyAnnualDiscount(range: PriceRange): PriceRange {
  return {
    min: Math.round(range.min * 0.8),
    max: Math.round(range.max * 0.8),
  }
}

function calcAnnualSavings(range: PriceRange): string {
  const savingsMin = Math.round(range.min * 0.2 * 12)
  const savingsMax = Math.round(range.max * 0.2 * 12)
  const fmt = (n: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n)
  return `${fmt(savingsMin)} – ${fmt(savingsMax)}`
}

export default function PlanCard({
  plan,
  planLabel,
  description,
  monthlyPriceRange,
  billingCycle,
  features,
  highlighted = false,
  context,
  onSelectPlan,
  isSelected = false,
}: PlanCardProps) {
  const router = useRouter()
  const isAnnual = billingCycle === 'annual'
  const displayedRange = isAnnual
    ? applyAnnualDiscount(monthlyPriceRange)
    : monthlyPriceRange
  const annualSavings = calcAnnualSavings(monthlyPriceRange)

  const ctaLabel =
    context === 'registration' ? 'Empezar prueba gratis' : 'Empezar'

  function handleCTA() {
    if (context === 'registration' && onSelectPlan) {
      onSelectPlan(plan, billingCycle)
      return
    }
    router.push(`/registro?plan=${plan}`)
  }

  return (
    <div
      data-testid={`plan-card-${plan}`}
      className={cn(
        'relative flex flex-col rounded-2xl p-7',
        highlighted
          ? 'shadow-2xl scale-[1.03]'
          : 'shadow-sm border',
        isSelected && !highlighted && 'ring-2 ring-[#0062FF]'
      )}
      style={
        highlighted
          ? { backgroundColor: '#0062FF', borderColor: 'transparent' }
          : { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }
      }
    >
      {highlighted && (
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-[14px] whitespace-nowrap rounded-full px-4 py-1 text-xs font-semibold shadow"
          style={{ backgroundColor: '#FFFFFF', color: '#0062FF' }}
          data-testid="popular-badge"
        >
          Más popular
        </div>
      )}

      <div className="mb-5">
        <h3
          className="text-xl font-bold mb-1"
          style={{ color: highlighted ? '#FFFFFF' : '#1A1A1A' }}
        >
          {planLabel}
        </h3>
        <p
          className="text-sm"
          style={{ color: highlighted ? 'rgba(255,255,255,0.9)' : '#4B5563' }}
        >
          {description}
        </p>
      </div>

      <div className="mb-5">
        <div className="flex items-end gap-1">
          <span
            className="text-4xl font-bold leading-none"
            style={{ color: highlighted ? '#FFFFFF' : '#1A1A1A' }}
          >
            {formatCOPRange(displayedRange)}
          </span>
          <span
            className="text-sm mb-0.5"
            style={{ color: highlighted ? 'rgba(255,255,255,0.8)' : '#4B5563' }}
          >
            /mes
          </span>
        </div>
        {isAnnual && (
          <div className="mt-2 flex flex-col gap-1">
            <span
              className="inline-block rounded-full px-3 py-0.5 text-xs font-semibold w-fit"
              style={
                highlighted
                  ? { backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }
                  : { backgroundColor: 'rgba(0,98,255,0.08)', color: '#0062FF' }
              }
            >
              20% de descuento
            </span>
            <span
              className="text-xs"
              style={{ color: highlighted ? 'rgba(255,255,255,0.7)' : '#9CA3AF' }}
            >
              Ahorras {annualSavings}/año
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleCTA}
        className={cn(
          'w-full rounded-[10px] py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2',
          highlighted
            ? 'hover:bg-gray-100 focus-visible:ring-white'
            : 'hover:bg-[#EAECF0] focus-visible:ring-[#0062FF]'
        )}
        style={
          highlighted
            ? { backgroundColor: '#FFFFFF', color: '#0062FF' }
            : { backgroundColor: '#F7F8FA', color: '#1A1A1A' }
        }
        data-testid={`cta-btn-${plan}`}
      >
        {ctaLabel}
      </button>

      <div
        className="my-5 h-px"
        style={
          highlighted
            ? { backgroundColor: 'rgba(255,255,255,0.2)' }
            : { backgroundColor: '#F7F8FA' }
        }
      />

      <ul className="flex flex-col gap-3 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check
              size={16}
              className="mt-0.5 shrink-0"
              style={{ color: highlighted ? '#FFFFFF' : '#10B981' }}
            />
            <span
              className="text-sm"
              style={{ color: highlighted ? '#FFFFFF' : '#4B5563' }}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {context === 'registration' && (
        <p
          className="mt-5 text-center text-xs"
          style={{ color: highlighted ? 'rgba(255,255,255,0.6)' : '#9CA3AF' }}
        >
          14 días gratis · sin tarjeta de crédito
        </p>
      )}
    </div>
  )
}
