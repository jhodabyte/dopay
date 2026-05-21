import type { AppNotification } from './notifications/store'

export const mockNotifications: AppNotification[] = [
  {
    id: 'notif-001',
    type: 'payment_overdue',
    title: 'Pago vencido — Local Comercial Suba',
    description: 'El arrendatario María Herrera lleva 51 días en mora. Monto: $5.200.000.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'notif-002',
    type: 'payment_upcoming',
    title: 'Pago próximo a vencer — Apto 302 Chapinero',
    description: 'El pago de Ana Martínez vence en 3 días. Monto: $1.800.000.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'notif-003',
    type: 'payment_registered',
    title: 'Pago registrado — Casa Teusaquillo',
    description: 'Luis Rodríguez registró el pago de $3.500.000 vía PSE.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'notif-004',
    type: 'payment_upcoming',
    title: 'Pago próximo a vencer — Apto 508 Usaquén',
    description: 'El pago de Jorge Vargas vence en 3 días. Monto: $2.200.000.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'notif-005',
    type: 'payment_overdue',
    title: 'Alerta de mora — Local Comercial Suba',
    description: 'El pago de octubre también está vencido. Total en mora: $10.400.000.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
]
