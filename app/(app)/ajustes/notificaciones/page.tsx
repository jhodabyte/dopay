'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Edit3,
  Lock,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/notifications/ToastProvider'
import { MOCK_MODE } from '@/lib/mock-data'
import type { NotificationSettings } from '@/lib/types/database'

type NotificationChannel = 'email' | 'sms' | 'both'

interface LocalSettings {
  daysBefore: number
  channel: NotificationChannel
  overdueAlertEnabled: boolean
  sendToTenant: boolean
  sendOwnerCopy: boolean
  moraAlertEnabled: boolean
  moraThresholdDays: number
  messageTemplate: string
}

const DEFAULT_TEMPLATE = 'Hola {{nombre}},\n\nTe recordamos que tu pago de arriendo por ${{monto}} corresponde al inmueble {{propiedad}} y vence el {{fecha}}.\n\nPor favor realiza tu pago a tiempo para evitar inconvenientes.\n\nDopay — Gestión de Arriendos'

const SAMPLE_DATA: Record<string, string> = {
  nombre: 'Ana Martínez',
  monto: '1.800.000',
  fecha: '1 de diciembre de 2024',
  propiedad: 'Apto 302 - Chapinero',
}

const VARIABLE_CHIPS = ['{{nombre}}', '{{monto}}', '{{fecha}}', '{{propiedad}}']

const IS_PREMIUM = false

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn('bg-gray-200 rounded animate-pulse', className)}
    />
  )
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4"
        >
          <SkeletonBlock className="h-6 w-48" />
          <SkeletonBlock className="h-4 w-80" />
          <SkeletonBlock className="h-10 w-full" />
        </div>
      ))}
    </div>
  )
}

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  id: string
}

function ToggleSwitch({ checked, onChange, label, id }: ToggleSwitchProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2 cursor-pointer select-none"
    >
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onChange(!checked)
          }
        }}
        className={cn(
          'relative inline-flex w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0062FF]',
          checked ? 'bg-[#0062FF]' : 'bg-gray-200'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
    </label>
  )
}

function renderTemplate(template: string): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => SAMPLE_DATA[key] ?? `{{${key}}}`)
}

export default function NotificacionesPage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<LocalSettings>({
    daysBefore: 3,
    channel: 'email',
    overdueAlertEnabled: true,
    sendToTenant: true,
    sendOwnerCopy: true,
    moraAlertEnabled: true,
    moraThresholdDays: 3,
    messageTemplate: DEFAULT_TEMPLATE,
  })
  const [savedSettings, setSavedSettings] = useState<LocalSettings | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const templateRef = useRef<HTMLTextAreaElement>(null)

  const hasUnsavedChanges =
    savedSettings !== null &&
    JSON.stringify(settings) !== JSON.stringify(savedSettings)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (MOCK_MODE) {
        const loaded: LocalSettings = {
          daysBefore: 3,
          channel: 'email',
          overdueAlertEnabled: true,
          sendToTenant: true,
          sendOwnerCopy: true,
          moraAlertEnabled: true,
          moraThresholdDays: 3,
          messageTemplate: DEFAULT_TEMPLATE,
        }
        setSettings(loaded)
        setSavedSettings(loaded)
      } else {
        setSavedSettings(settings)
      }
      setLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (hasUnsavedChanges) {
        event.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  function updateSettings(partial: Partial<LocalSettings>) {
    setSettings((previous) => ({ ...previous, ...partial }))
  }

  function insertVariableIntoTemplate(variable: string) {
    const textarea = templateRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const current = settings.messageTemplate
    const updated = current.slice(0, start) + variable + current.slice(end)
    updateSettings({ messageTemplate: updated })
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + variable.length, start + variable.length)
    }, 0)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 600))

      if (MOCK_MODE) {
        console.log('[Mock] Guardando configuración de notificaciones:', settings)
      }

      setSavedSettings({ ...settings })
      showToast('Configuración guardada correctamente', 'success')
    } catch {
      showToast('Error al guardar la configuración. Intenta de nuevo.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const toNotificationSettings = useCallback((): Partial<NotificationSettings> => ({
    days_before: settings.daysBefore,
    channels: settings.channel === 'both'
      ? ['email', 'sms']
      : [settings.channel as 'email' | 'sms'],
    overdue_alert_enabled: settings.overdueAlertEnabled,
    overdue_threshold_days: settings.moraThresholdDays,
    message_template: settings.messageTemplate,
  }), [settings])

  void toNotificationSettings

  if (loading) return <SettingsSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ backgroundColor: 'rgba(0,98,255,0.1)' }}
        >
          <Bell className="w-5 h-5" style={{ color: '#0062FF' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
            Notificaciones y recordatorios
          </h2>
          <p className="text-sm" style={{ color: '#4B5563' }}>
            Configura cómo y cuándo se envían alertas a tus arrendatarios
          </p>
        </div>
      </div>

      {/* Section 1: Recordatorio de pago próximo a vencer */}
      <section
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        style={{ borderLeft: '4px solid #0062FF' }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" style={{ color: '#0062FF' }} />
              <span className="text-base" style={{ fontWeight: 600, color: '#1A1A1A' }}>
                Recordatorio de pago
              </span>
            </div>
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981' }}
            >
              Activo
            </span>
          </div>
          <p className="text-sm mb-6" style={{ color: '#4B5563' }}>
            Notifica automáticamente a tus arrendatarios{' '}
            <strong>{settings.daysBefore} días</strong> antes del vencimiento
          </p>

          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
                  Días de anticipación
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                  Con cuántos días de anticipación enviar el recordatorio
                </p>
              </div>
              <select
                value={settings.daysBefore.toString()}
                onChange={(event) =>
                  updateSettings({ daysBefore: parseInt(event.target.value) })
                }
                className="h-10 px-3 border rounded-lg text-sm outline-none focus:border-[#0062FF] border-[#E5E7EB] bg-white"
                style={{ color: '#1A1A1A', minWidth: '100px' }}
                aria-label="Días de anticipación"
                data-testid="days-before-select"
              >
                <option value="1">1 día</option>
                <option value="3">3 días</option>
                <option value="5">5 días</option>
                <option value="7">7 días</option>
              </select>
            </div>

            <div>
              <p className="text-sm font-medium mb-3" style={{ color: '#1A1A1A' }}>
                Canal de notificación
              </p>
              <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Canal de notificación">
                {(
                  [
                    { value: 'email' as NotificationChannel, label: 'Email' },
                    { value: 'sms' as NotificationChannel, label: 'SMS' },
                    { value: 'both' as NotificationChannel, label: 'Email y SMS' },
                  ] as { value: NotificationChannel; label: string }[]
                ).map(({ value, label }) => (
                  <label
                    key={value}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-colors text-sm font-medium',
                      settings.channel === value
                        ? 'border-[#0062FF] bg-[#EBF2FF] text-[#0062FF]'
                        : 'border-[#E5E7EB] hover:bg-gray-50'
                    )}
                    style={settings.channel !== value ? { color: '#4B5563' } : undefined}
                  >
                    <input
                      type="radio"
                      name="notification-channel"
                      value={value}
                      checked={settings.channel === value}
                      onChange={() => updateSettings({ channel: value })}
                      className="sr-only"
                    />
                    {label}
                  </label>
                ))}
              </div>
              {(settings.channel === 'sms' || settings.channel === 'both') && (
                <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>
                  SMS disponible en planes Intermedio y Premium
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Aviso de pago vencido */}
      <section
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        style={{ borderLeft: '4px solid #EF4444' }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" style={{ color: '#EF4444' }} />
              <span className="text-base" style={{ fontWeight: 600, color: '#1A1A1A' }}>
                Aviso de pago vencido
              </span>
            </div>
            <ToggleSwitch
              id="overdue-alert-toggle"
              checked={settings.overdueAlertEnabled}
              onChange={(checked) => updateSettings({ overdueAlertEnabled: checked })}
              label="Activar aviso de pago vencido"
            />
          </div>
          <p className="text-sm mb-4" style={{ color: '#4B5563' }}>
            Notifica al arrendatario (con copia a ti) cuando un pago supera la fecha límite
          </p>

          {settings.overdueAlertEnabled && (
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
                    Enviar al arrendatario
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                    El arrendatario recibe la notificación directamente
                  </p>
                </div>
                <ToggleSwitch
                  id="send-to-tenant-toggle"
                  checked={settings.sendToTenant}
                  onChange={(checked) => updateSettings({ sendToTenant: checked })}
                  label="Enviar al arrendatario"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
                    Enviarme copia
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                    Recibes una copia de todas las alertas enviadas
                  </p>
                </div>
                <ToggleSwitch
                  id="owner-copy-toggle"
                  checked={settings.sendOwnerCopy}
                  onChange={(checked) => updateSettings({ sendOwnerCopy: checked })}
                  label="Enviarme copia"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section 3: Alerta interna de mora */}
      <section
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        style={{ borderLeft: '4px solid #F59E0B' }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" style={{ color: '#F59E0B' }} />
              <span className="text-base" style={{ fontWeight: 600, color: '#1A1A1A' }}>
                Alerta de mora para ti
              </span>
            </div>
            <ToggleSwitch
              id="mora-alert-toggle"
              checked={settings.moraAlertEnabled}
              onChange={(checked) => updateSettings({ moraAlertEnabled: checked })}
              label="Activar alerta de mora"
            />
          </div>
          <p className="text-sm mb-4" style={{ color: '#4B5563' }}>
            Recibe una alerta en la plataforma cuando un pago lleve{' '}
            <strong>{settings.moraThresholdDays} días</strong> en mora
          </p>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
                Umbral de días de mora
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                A partir de cuántos días se considera mora crítica
              </p>
            </div>
            <select
              value={settings.moraThresholdDays.toString()}
              onChange={(event) =>
                updateSettings({ moraThresholdDays: parseInt(event.target.value) })
              }
              disabled={!settings.moraAlertEnabled}
              className="h-10 px-3 border rounded-lg text-sm outline-none focus:border-[#0062FF] border-[#E5E7EB] bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: '#1A1A1A', minWidth: '100px' }}
              aria-label="Umbral de días de mora"
              data-testid="mora-threshold-select"
            >
              <option value="1">1 día</option>
              <option value="3">3 días</option>
              <option value="5">5 días</option>
              <option value="7">7 días</option>
              <option value="14">14 días</option>
            </select>
          </div>

          {settings.moraAlertEnabled && (
            <div
              className="mt-5 p-4 rounded-xl"
              style={{ backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: '#D97706' }}>
                Vista previa de notificación interna
              </p>
              <div className="flex items-start gap-2 mt-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#F59E0B' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
                    Alerta de mora — Local Comercial Suba
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#4B5563' }}>
                    El pago de María Herrera lleva {settings.moraThresholdDays}+ días vencido.
                    Monto: $5.200.000.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section 4: Personalización de plantilla (Premium) */}
      <section
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden relative"
        style={{ borderLeft: '4px solid #8B5CF6' }}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <Edit3 className="w-5 h-5" style={{ color: '#8B5CF6' }} />
            <span className="text-base" style={{ fontWeight: 600, color: '#1A1A1A' }}>
              Personalizar mensaje
            </span>
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}
            >
              Premium
            </span>
          </div>
          <p className="text-sm mb-5" style={{ color: '#4B5563' }}>
            Personaliza el mensaje que reciben tus arrendatarios
          </p>

          <div className={cn(!IS_PREMIUM && 'opacity-40 pointer-events-none select-none')}>
            <textarea
              ref={templateRef}
              value={settings.messageTemplate}
              onChange={(event) => updateSettings({ messageTemplate: event.target.value })}
              rows={8}
              className="w-full px-4 py-3 border rounded-xl text-sm outline-none focus:border-[#8B5CF6] border-[#E5E7EB] resize-none font-mono leading-relaxed"
              style={{ color: '#1A1A1A' }}
              placeholder="Escribe tu plantilla personalizada aquí..."
              aria-label="Plantilla de mensaje personalizado"
              data-testid="template-textarea"
            />

            <div className="mt-3">
              <p className="text-xs mb-2" style={{ color: '#4B5563' }}>
                Usa{' '}
                {VARIABLE_CHIPS.map((chip, index) => (
                  <span key={chip}>
                    <code
                      className="px-1 py-0.5 rounded text-xs"
                      style={{ backgroundColor: 'rgba(139,92,246,0.08)', color: '#8B5CF6' }}
                    >
                      {chip}
                    </code>
                    {index < VARIABLE_CHIPS.length - 1 ? ', ' : ''}
                  </span>
                ))}{' '}
                en tu mensaje
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {VARIABLE_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => insertVariableIntoTemplate(chip)}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80"
                    style={{
                      backgroundColor: 'rgba(139,92,246,0.1)',
                      color: '#8B5CF6',
                      border: '1px solid rgba(139,92,246,0.25)',
                    }}
                    data-testid={`variable-chip-${chip.replace(/[{}]/g, '')}`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => setShowPreview((previous) => !previous)}
                className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-70"
                style={{ color: '#8B5CF6' }}
              >
                <ChevronRight
                  className={cn(
                    'w-4 h-4 transition-transform',
                    showPreview && 'rotate-90'
                  )}
                />
                Vista previa
              </button>
              {showPreview && (
                <div
                  className="mt-3 p-4 rounded-xl text-sm whitespace-pre-wrap leading-relaxed"
                  style={{
                    backgroundColor: '#F7F8FA',
                    border: '1px solid #E5E7EB',
                    color: '#1A1A1A',
                  }}
                >
                  {renderTemplate(settings.messageTemplate)}
                </div>
              )}
            </div>
          </div>

          {!IS_PREMIUM && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
              style={{ backgroundColor: 'rgba(247,248,250,0.85)', backdropFilter: 'blur(2px)' }}
            >
              <div
                className="flex items-center justify-center w-12 h-12 rounded-full mb-3"
                style={{ backgroundColor: 'rgba(139,92,246,0.1)' }}
              >
                <Lock className="w-6 h-6" style={{ color: '#8B5CF6' }} />
              </div>
              <p className="text-base font-semibold mb-1" style={{ color: '#1A1A1A' }}>
                Disponible en plan Premium
              </p>
              <p className="text-sm mb-4" style={{ color: '#4B5563' }}>
                Personaliza los mensajes enviados a tus arrendatarios
              </p>
              <Button href="/planes" variant="primary" size="sm">
                Actualizar plan
              </Button>
            </div>
          )}
        </div>
      </section>

      <div className="flex justify-end pb-4">
        <Button
          variant="primary"
          size="lg"
          loading={saving}
          onClick={handleSave}
        >
          Guardar configuración
        </Button>
      </div>
    </div>
  )
}
