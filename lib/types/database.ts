export type PropertyStatus = 'active' | 'vacant' | 'overdue'
export type PropertyType = 'apartment' | 'house' | 'commercial' | 'warehouse'
export type PaymentStatus = 'pending' | 'paid' | 'overdue'
export type PaymentConcept = 'rent' | 'admin' | 'utilities' | 'other'
export type PaymentMethod = 'transfer' | 'pse' | 'cash' | 'nequi' | 'daviplata'
export type SubscriptionPlan = 'basic' | 'intermediate' | 'premium'
export type BillingCycle = 'monthly' | 'annual'
export type SubscriptionStatus = 'active' | 'trial' | 'cancelled'

export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string
  created_at: string
}

export interface Property {
  id: string
  owner_id: string
  name: string
  address: string
  city: string
  type: PropertyType
  monthly_rent: number
  contract_start: string
  contract_end: string
  status: PropertyStatus
  tenant_id: string | null
  image_url: string | null
  created_at: string
}

export interface Tenant {
  id: string
  owner_id: string
  name: string
  email: string
  phone: string
  created_at: string
}

export interface Payment {
  id: string
  property_id: string
  tenant_id: string
  concept: PaymentConcept
  amount: number
  due_date: string
  paid_date: string | null
  method: PaymentMethod | null
  status: PaymentStatus
  notes: string | null
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: SubscriptionPlan
  billing_cycle: BillingCycle
  start_date: string
  trial_end_date: string
  status: SubscriptionStatus
}

export interface NotificationSettings {
  id: string
  owner_id: string
  days_before: number
  channels: ('email' | 'sms')[]
  overdue_alert_enabled: boolean
  overdue_threshold_days: number
  message_template: string | null
}

export interface PropertyWithTenant extends Property {
  tenant: Tenant | null
}

export interface PaymentWithDetails extends Payment {
  property: Property | null
  tenant: Tenant | null
}
