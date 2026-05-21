'use client'

import { useState } from 'react'
import { ShieldCheck, CreditCard, Headphones, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BillingCycle, SubscriptionPlan } from '@/lib/types/database'
import BillingToggle from './BillingToggle'
import PlanCard from './PlanCard'

export interface PricingContentProps {
  onSelectPlan?: (plan: SubscriptionPlan, billingCycle: BillingCycle) => void
  selectedPlan?: SubscriptionPlan
  showSkipOption?: boolean
  context: 'marketing' | 'registration'
}

const PLAN_DATA: Array<{
  plan: SubscriptionPlan
  planLabel: string
  description: string
  monthlyPriceRange: { min: number; max: number }
  features: string[]
  highlighted: boolean
}> = [
  {
    plan: 'basic',
    planLabel: 'Básico',
    description: 'Ideal para arrendadores con pocas propiedades',
    monthlyPriceRange: { min: 50000, max: 100000 },
    features: [
      'Registro de inmuebles',
      'Control de pagos de arriendo y servicios',
      'Recordatorios automáticos a inquilinos',
      'Soporte básico',
      'Reportes simples',
    ],
    highlighted: false,
  },
  {
    plan: 'intermediate',
    planLabel: 'Intermedio',
    description: 'Para arrendadores con carteras en crecimiento',
    monthlyPriceRange: { min: 105000, max: 200000 },
    features: [
      'Todo lo del plan Básico',
      'Reportes detallados',
      'Historial de pagos completo',
      'Gestión de múltiples inquilinos',
      'Notificaciones personalizadas',
      'Integración con diferentes métodos de pago',
    ],
    highlighted: true,
  },
  {
    plan: 'premium',
    planLabel: 'Premium',
    description: 'Para arrendadores con carteras grandes',
    monthlyPriceRange: { min: 205000, max: 300000 },
    features: [
      'Todo lo del plan Intermedio',
      'Panel de control avanzado',
      'Análisis financiero',
      'Automatización de cobros',
      'Generación de reportes profesionales',
      'Soporte prioritario 24/7',
      'Personalización de la plataforma',
    ],
    highlighted: false,
  },
]

const FAQ_ITEMS: Array<{ question: string; answer: string }> = [
  {
    question: '¿Puedo cambiar de plan en cualquier momento?',
    answer:
      'Sí, puedes cambiar de plan cuando quieras. El cambio toma efecto en el siguiente ciclo de facturación.',
  },
  {
    question: '¿Qué pasa después de los 14 días de prueba?',
    answer:
      'Al terminar tu período de prueba, eliges el plan que más te convenga. No realizamos ningún cobro automático sin tu confirmación.',
  },
  {
    question: '¿Necesito tarjeta de crédito para el período de prueba?',
    answer:
      'No. La prueba gratuita de 14 días no requiere tarjeta de crédito ni ningún dato de pago.',
  },
]

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b" style={{ borderColor: '#E5E7EB' }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between py-4 text-left focus:outline-none"
      >
        <span className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
          {question}
        </span>
        <ChevronDown
          size={18}
          className={cn(
            'shrink-0 text-[#9CA3AF] transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm" style={{ color: '#4B5563' }}>
          {answer}
        </p>
      )}
    </div>
  )
}

export default function PricingContent({
  onSelectPlan,
  selectedPlan,
  showSkipOption = false,
  context,
}: PricingContentProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')

  return (
    <div className="w-full">
      <div
        className="flex flex-col items-center text-center"
        style={{ paddingTop: '80px', paddingBottom: '40px' }}
        data-testid="price-header"
      >
        <div
          className="mb-4 inline-flex items-center gap-2 rounded-full px-[14px] py-[6px] text-sm font-medium"
          style={{ backgroundColor: 'rgba(0,98,255,0.08)', color: '#0062FF' }}
          data-testid="header-badge"
        >
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: '#0062FF' }}
          />
          Planes diseñados para tu cartera
        </div>

        <h1
          className="mb-3 text-[42px] font-bold leading-tight"
          style={{ color: '#1A1A1A' }}
          data-testid="header-title"
        >
          Elige el plan ideal para tus propiedades
        </h1>

        <p
          className="mb-8 text-[15px] leading-relaxed"
          style={{ color: '#9CA3AF', maxWidth: '640px' }}
          data-testid="header-subtitle"
        >
          Sin contratos forzosos. Cambia o cancela cuando quieras. Todos los
          planes incluyen recordatorios automáticos y soporte en español.
        </p>

        <BillingToggle value={billingCycle} onChange={setBillingCycle} />
      </div>

      <div
        className="flex flex-col items-center gap-5 px-4 md:flex-row md:items-stretch md:justify-center"
        data-testid="price-cards-row"
      >
        {PLAN_DATA.map((planData) => (
          <div key={planData.plan} className="w-full md:w-[340px] shrink-0">
            <PlanCard
              {...planData}
              billingCycle={billingCycle}
              context={context}
              onSelectPlan={onSelectPlan}
              isSelected={selectedPlan === planData.plan}
            />
          </div>
        ))}
      </div>

      {showSkipOption && (
        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-sm underline underline-offset-2 transition-colors hover:text-[#0062FF]"
            style={{ color: '#9CA3AF' }}
            onClick={() => onSelectPlan?.('basic', billingCycle)}
            data-testid="skip-option"
          >
            Saltar y elegir después
          </button>
        </div>
      )}

      <div
        className="flex flex-col items-center gap-4 py-10 md:flex-row md:justify-center md:gap-8"
        data-testid="price-footer"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} style={{ color: '#10B981' }} />
          <span className="text-sm" style={{ color: '#4B5563' }}>
            Datos protegidos · Ley 1581 de 2012
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard size={20} style={{ color: '#0062FF' }} />
          <span className="text-sm" style={{ color: '#4B5563' }}>
            Pasarela de pagos PCI DSS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Headphones size={20} style={{ color: '#8B5CF6' }} />
          <span className="text-sm" style={{ color: '#4B5563' }}>
            Soporte 100% en español
          </span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl px-4 pb-16">
        <h2
          className="mb-4 text-xl font-bold"
          style={{ color: '#1A1A1A' }}
        >
          Preguntas frecuentes
        </h2>
        {FAQ_ITEMS.map((item) => (
          <FaqItem key={item.question} {...item} />
        ))}
      </div>
    </div>
  )
}
