import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface NotificationSettingsRow {
  owner_id: string
  days_before: number
  channels: ('email' | 'sms')[]
  overdue_alert_enabled: boolean
  overdue_threshold_days: number
  message_template: string | null
}

interface PaymentRow {
  id: string
  property_id: string
  tenant_id: string
  amount: number
  due_date: string
  status: 'pending' | 'paid' | 'overdue'
}

interface TenantRow {
  id: string
  name: string
  email: string
  phone: string
}

interface PropertyRow {
  id: string
  name: string
  address: string
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function applyTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`)
}

const DEFAULT_TEMPLATE = `Hola {{nombre}},

Te recordamos que tu pago de arriendo por {{monto}} corresponde al inmueble {{propiedad}} y vence el {{fecha}}.

Dopay — Gestión de Arriendos`

async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) {
    console.log(`[STUB] Would send email to ${to}: ${subject}\n${body}`)
    return
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@dopay.co',
      to,
      subject,
      text: body,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error(`Failed to send email to ${to}:`, error)
  }
}

async function sendSMS(phone: string, message: string): Promise<void> {
  console.log(`[STUB] Would send SMS to ${phone}: ${message}`)
}

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString().split('T')[0]

  const { data: allSettings, error: settingsError } = await supabase
    .from('notification_settings')
    .select('*') as { data: NotificationSettingsRow[] | null; error: unknown }

  if (settingsError || !allSettings) {
    console.error('Error fetching notification settings:', settingsError)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch notification settings' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  let upcomingRemindersSent = 0
  let overdueAlertsSent = 0

  for (const ownerSettings of allSettings) {
    const targetDueDate = new Date(today)
    targetDueDate.setDate(targetDueDate.getDate() + ownerSettings.days_before)
    const targetISO = targetDueDate.toISOString().split('T')[0]

    const { data: upcomingPayments } = await supabase
      .from('payments')
      .select('*, property:properties(*), tenant:tenants(*)')
      .eq('status', 'pending')
      .eq('due_date', targetISO) as {
        data: (PaymentRow & { property: PropertyRow; tenant: TenantRow })[] | null
        error: unknown
      }

    for (const payment of upcomingPayments ?? []) {
      const template = ownerSettings.message_template ?? DEFAULT_TEMPLATE
      const messageBody = applyTemplate(template, {
        nombre: payment.tenant.name,
        monto: formatCOP(payment.amount),
        propiedad: payment.property.name,
        fecha: new Date(payment.due_date).toLocaleDateString('es-CO', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      })

      if (ownerSettings.channels.includes('email')) {
        await sendEmail(
          payment.tenant.email,
          `Recordatorio de pago — ${payment.property.name}`,
          messageBody
        )
      }

      if (ownerSettings.channels.includes('sms')) {
        await sendSMS(payment.tenant.phone, messageBody)
      }

      upcomingRemindersSent++
    }

    if (!ownerSettings.overdue_alert_enabled) continue

    const overdueThreshold = new Date(today)
    overdueThreshold.setDate(overdueThreshold.getDate() - ownerSettings.overdue_threshold_days)
    const overdueThresholdISO = overdueThreshold.toISOString().split('T')[0]

    const { data: overduePayments } = await supabase
      .from('payments')
      .select('*, property:properties(*), tenant:tenants(*)')
      .eq('status', 'pending')
      .lt('due_date', todayISO)
      .gte('due_date', overdueThresholdISO) as {
        data: (PaymentRow & { property: PropertyRow; tenant: TenantRow })[] | null
        error: unknown
      }

    for (const payment of overduePayments ?? []) {
      const daysLate = Math.floor(
        (today.getTime() - new Date(payment.due_date).getTime()) / (1000 * 60 * 60 * 24)
      )

      const overdueMessage = applyTemplate(
        'Hola {{nombre}}, tu pago de {{monto}} por {{propiedad}} lleva {{dias}} días vencido. Por favor regulariza tu situación.',
        {
          nombre: payment.tenant.name,
          monto: formatCOP(payment.amount),
          propiedad: payment.property.name,
          dias: daysLate.toString(),
        }
      )

      if (ownerSettings.channels.includes('email')) {
        await sendEmail(
          payment.tenant.email,
          `Aviso de pago vencido — ${payment.property.name}`,
          overdueMessage
        )
      }

      if (ownerSettings.channels.includes('sms')) {
        await sendSMS(payment.tenant.phone, overdueMessage)
      }

      overdueAlertsSent++
    }
  }

  const result = {
    date: todayISO,
    upcomingRemindersSent,
    overdueAlertsSent,
    ownersProcessed: allSettings.length,
  }

  console.log('Payment reminders sent:', result)

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  })
})
