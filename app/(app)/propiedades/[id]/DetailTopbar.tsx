'use client'

import Topbar from '@/components/layout/Topbar'

interface DetailTopbarProps {
  title: string
  subtitle: string
}

export default function DetailTopbar({ title, subtitle }: DetailTopbarProps) {
  return (
    <Topbar
      title={title}
      subtitle={subtitle}
      ctaLabel="Registrar pago"
      onCtaClick={() => {}}
    />
  )
}
