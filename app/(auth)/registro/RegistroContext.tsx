'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import type { BillingCycle, SubscriptionPlan } from '@/lib/types/database'

interface Step1Data {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}

interface Step2Data {
  propertyCount: string
  cities: string
  currentManagement: string
}

interface Step3Data {
  selectedPlan: SubscriptionPlan | null
  billingCycle: BillingCycle
}

interface RegistroFormData {
  step1: Step1Data
  step2: Step2Data
  step3: Step3Data
}

interface RegistroContextValue {
  formData: RegistroFormData
  setStep1Data: (data: Step1Data) => void
  setStep2Data: (data: Step2Data) => void
  setStep3Data: (data: Step3Data) => void
}

const SESSION_KEY = 'dopay_registro'

const defaultFormData: RegistroFormData = {
  step1: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  },
  step2: {
    propertyCount: '',
    cities: '',
    currentManagement: '',
  },
  step3: {
    selectedPlan: null,
    billingCycle: 'monthly',
  },
}

const RegistroContext = createContext<RegistroContextValue | null>(null)

export function RegistroProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<RegistroFormData>(() => {
    if (typeof window === 'undefined') return defaultFormData
    try {
      const stored = sessionStorage.getItem(SESSION_KEY)
      return stored ? JSON.parse(stored) : defaultFormData
    } catch {
      return defaultFormData
    }
  })

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(formData))
    } catch {
      // sessionStorage not available
    }
  }, [formData])

  function setStep1Data(data: Step1Data) {
    setFormData((prev) => ({ ...prev, step1: data }))
  }

  function setStep2Data(data: Step2Data) {
    setFormData((prev) => ({ ...prev, step2: data }))
  }

  function setStep3Data(data: Step3Data) {
    setFormData((prev) => ({ ...prev, step3: data }))
  }

  return (
    <RegistroContext.Provider value={{ formData, setStep1Data, setStep2Data, setStep3Data }}>
      {children}
    </RegistroContext.Provider>
  )
}

export function useRegistro(): RegistroContextValue {
  const context = useContext(RegistroContext)
  if (!context) {
    throw new Error('useRegistro must be used within RegistroProvider')
  }
  return context
}
