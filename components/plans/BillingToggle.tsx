'use client'

import { cn } from '@/lib/utils'
import type { BillingCycle } from '@/lib/types/database'

interface BillingToggleProps {
  value: BillingCycle
  onChange: (cycle: BillingCycle) => void
}

export default function BillingToggle({ value, onChange }: BillingToggleProps) {
  return (
    <div
      className="inline-flex rounded-full border p-1"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
    >
      <button
        type="button"
        onClick={() => onChange('monthly')}
        className={cn(
          'rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 focus:outline-none',
          value === 'monthly'
            ? 'text-white'
            : 'text-[#4B5563]'
        )}
        style={value === 'monthly' ? { backgroundColor: '#0062FF' } : {}}
      >
        Mensual
      </button>
      <button
        type="button"
        onClick={() => onChange('annual')}
        className={cn(
          'rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 focus:outline-none',
          value === 'annual'
            ? 'text-white'
            : 'text-[#4B5563]'
        )}
        style={value === 'annual' ? { backgroundColor: '#0062FF' } : {}}
      >
        Anual&nbsp;&nbsp;-20%
      </button>
    </div>
  )
}
