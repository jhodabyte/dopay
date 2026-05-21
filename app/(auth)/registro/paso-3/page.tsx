'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { useRegistro } from '../RegistroContext'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { SubscriptionPlan, BillingCycle } from '@/lib/types/database'

interface PlanFeature {
  text: string
}

interface PlanConfig {
  id: SubscriptionPlan
  name: string
  description: string
  monthlyPrice: string
  annualPrice: string
  features: PlanFeature[]
  highlighted: boolean
}

const plans: PlanConfig[] = [
  {
    id: 'basic',
    name: 'Básico',
    description: 'Ideal para arrendadores con pocas propiedades',
    monthlyPrice: '$50.000 - $100.000',
    annualPrice: '$40.000 - $80.000',
    features: [
      { text: 'Registro de inmuebles' },
      { text: 'Control de pagos de arriendo y servicios' },
      { text: 'Recordatorios automáticos a inquilinos' },
      { text: 'Soporte básico' },
      { text: 'Reportes simples' },
    ],
    highlighted: false,
  },
  {
    id: 'intermediate',
    name: 'Intermedio',
    description: 'Para propietarios con cantidad media de propiedades',
    monthlyPrice: '$105.000 - $200.000',
    annualPrice: '$84.000 - $160.000',
    features: [
      { text: 'Todo lo del plan Básico' },
      { text: 'Reportes detallados' },
      { text: 'Historial de pagos completo' },
      { text: 'Gestión de múltiples inquilinos' },
      { text: 'Notificaciones personalizadas' },
      { text: 'Integración con métodos de pago' },
    ],
    highlighted: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Para propietarios con propiedades ilimitadas',
    monthlyPrice: '$205.000 - $300.000',
    annualPrice: '$164.000 - $240.000',
    features: [
      { text: 'Todo lo del plan Intermedio' },
      { text: 'Panel de control avanzado' },
      { text: 'Análisis financiero' },
      { text: 'Automatización de cobros' },
      { text: 'Reportes profesionales' },
      { text: 'Soporte prioritario' },
      { text: 'Personalización de la plataforma' },
    ],
    highlighted: false,
  },
]

export default function RegistroPaso3Page() {
  const router = useRouter()
  const { formData, setStep3Data } = useRegistro()
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    formData.step3.billingCycle ?? 'monthly'
  )
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    formData.step3.selectedPlan
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  async function handleSelectPlan(plan: SubscriptionPlan) {
    setSelectedPlan(plan)
    setStep3Data({ selectedPlan: plan, billingCycle })
    await submitRegistration(plan)
  }

  async function submitRegistration(plan: SubscriptionPlan) {
    setIsSubmitting(true)
    setServerError(null)

    const { step1 } = formData

    try {
      const supabase = createClient()

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: step1.email,
        password: step1.password,
        options: {
          data: {
            full_name: `${step1.firstName} ${step1.lastName}`,
            phone: step1.phone,
          },
        },
      })

      if (signUpError) {
        setServerError(signUpError.message)
        setIsSubmitting(false)
        return
      }

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          email: step1.email,
          full_name: `${step1.firstName} ${step1.lastName}`,
          phone: step1.phone,
        })

        if (profileError && profileError.code !== '23505') {
          setServerError('Error al crear el perfil. Intenta de nuevo.')
          setIsSubmitting(false)
          return
        }

        const trialEnd = new Date()
        trialEnd.setDate(trialEnd.getDate() + 14)

        await supabase.from('subscriptions').insert({
          user_id: authData.user.id,
          plan,
          billing_cycle: billingCycle,
          start_date: new Date().toISOString(),
          trial_end_date: trialEnd.toISOString(),
          status: 'trial',
        })
      }

      router.push('/dashboard')
    } catch {
      setServerError('Ocurrió un error inesperado. Intenta de nuevo.')
      setIsSubmitting(false)
    }
  }

  async function handleSkip() {
    setStep3Data({ selectedPlan: null, billingCycle })
    await submitRegistration('basic')
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center py-12 px-4"
      style={{ backgroundColor: '#F7F8FA' }}
    >
      <div className="w-full max-w-5xl">
        <div className="flex justify-center mb-8">
          <span
            className="text-sm font-medium text-white px-4 py-1.5"
            style={{ backgroundColor: '#0062FF', borderRadius: '9999px' }}
          >
            Paso 3 de 3
          </span>
        </div>

        <div className="text-center mb-10">
          <h1 className="font-bold mb-3" style={{ fontSize: '32px', color: '#1A1A1A' }}>
            Elige el plan ideal para tus propiedades
          </h1>
          <p style={{ color: '#4B5563', fontSize: '16px' }}>
            Todos los planes incluyen 14 días gratis. Sin tarjeta de crédito.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-10">
          <div
            className="flex items-center p-1"
            style={{ backgroundColor: '#E5E7EB', borderRadius: '9999px' }}
          >
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className="px-5 py-2 text-sm font-medium transition-colors"
              style={{
                borderRadius: '9999px',
                backgroundColor: billingCycle === 'monthly' ? '#0062FF' : 'transparent',
                color: billingCycle === 'monthly' ? '#FFFFFF' : '#4B5563',
              }}
            >
              Mensual
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className="px-5 py-2 text-sm font-medium transition-colors flex items-center gap-2"
              style={{
                borderRadius: '9999px',
                backgroundColor: billingCycle === 'annual' ? '#0062FF' : 'transparent',
                color: billingCycle === 'annual' ? '#FFFFFF' : '#4B5563',
              }}
            >
              Anual
              <span
                className="text-xs font-bold px-2 py-0.5"
                style={{
                  backgroundColor: billingCycle === 'annual' ? 'rgba(255,255,255,0.25)' : '#10B981',
                  color: '#FFFFFF',
                  borderRadius: '9999px',
                }}
              >
                -20%
              </span>
            </button>
          </div>
        </div>

        {serverError && (
          <p className="text-center mb-6 text-sm" style={{ color: '#EF4444' }}>{serverError}</p>
        )}

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col p-6',
                plan.highlighted && 'shadow-xl'
              )}
              style={{
                borderRadius: '16px',
                backgroundColor: plan.highlighted ? '#0062FF' : '#FFFFFF',
                border: plan.highlighted ? 'none' : '1px solid #E5E7EB',
              }}
            >
              {plan.highlighted && (
                <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '-12px' }}>
                  <span
                    className="text-xs font-bold px-4 py-1.5"
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#0062FF',
                      borderRadius: '9999px',
                    }}
                  >
                    Más popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3
                  className="font-bold text-xl mb-1"
                  style={{ color: plan.highlighted ? '#FFFFFF' : '#1A1A1A' }}
                >
                  {plan.name}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: plan.highlighted ? 'rgba(255,255,255,0.8)' : '#4B5563' }}
                >
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <p
                  className="font-bold text-2xl"
                  style={{ color: plan.highlighted ? '#FFFFFF' : '#1A1A1A' }}
                >
                  {billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                </p>
                <p
                  className="text-sm"
                  style={{ color: plan.highlighted ? 'rgba(255,255,255,0.7)' : '#9CA3AF' }}
                >
                  /mes{billingCycle === 'annual' ? ' · facturado anualmente' : ''}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSelectPlan(plan.id)}
                disabled={isSubmitting}
                className="w-full h-11 font-medium mb-6 transition-colors flex items-center justify-center gap-2"
                style={{
                  borderRadius: '10px',
                  backgroundColor: plan.highlighted ? '#FFFFFF' : 'transparent',
                  color: plan.highlighted ? '#0062FF' : '#0062FF',
                  border: plan.highlighted ? 'none' : '2px solid #0062FF',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting && selectedPlan === plan.id && (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                Empezar prueba gratis
              </button>

              <div
                className="w-full h-px mb-6"
                style={{ backgroundColor: plan.highlighted ? 'rgba(255,255,255,0.2)' : '#E5E7EB' }}
              />

              <ul className="flex flex-col gap-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-3">
                    <Check
                      size={16}
                      className="shrink-0 mt-0.5"
                      style={{ color: plan.highlighted ? '#FFFFFF' : '#10B981' }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: plan.highlighted ? 'rgba(255,255,255,0.9)' : '#4B5563' }}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="text-sm hover:underline transition-colors"
            style={{ color: '#9CA3AF' }}
          >
            Saltar por ahora, elegir plan después
          </button>
        </div>
      </div>
    </div>
  )
}
