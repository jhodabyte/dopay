'use client'

import { useEffect } from 'react'
import { useTopbar } from '@/lib/topbar-context'

interface TopbarConfigProps {
  title: string
  subtitle?: string
  ctaLabel?: string
  onCtaClick?: () => void
}

export default function TopbarConfig({ title, subtitle, ctaLabel, onCtaClick }: TopbarConfigProps) {
  const { setConfig } = useTopbar()
  useEffect(() => {
    setConfig({ title, subtitle: subtitle ?? '', ctaLabel, onCtaClick })
  }, [setConfig, title, subtitle, ctaLabel, onCtaClick])
  return null
}
