export type Plan = 'free' | 'basic' | 'pro'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trialing' | 'paused'
export type Tone = 'formal' | 'confident' | 'concise'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: Plan
  status: SubscriptionStatus
  lemonsqueezy_customer_id: string | null
  lemonsqueezy_subscription_id: string | null
  lemonsqueezy_variant_id: string | null
  current_period_start: string
  current_period_end: string
  generations_used: number
  created_at: string
  updated_at: string
}

export interface Generation {
  id: string
  user_id: string
  full_name: string | null
  current_country: string | null
  target_country: string | null
  current_role: string | null
  years_experience: string | null
  skills: string | null
  education: string | null
  visa_status: string | null
  tone: Tone
  job_description: string
  output_text: string
  tokens_used: number
  created_at: string
}

export interface Payment {
  id: string
  user_id: string
  lemonsqueezy_order_id: string | null
  amount: number | null
  currency: string
  status: string
  plan: Plan | null
  created_at: string
}

export interface GenerateFormData {
  fullName: string
  currentCountry: string
  targetCountry: string
  currentRole: string
  yearsExperience: string
  skills: string
  education: string
  visaStatus: string
  tone: Tone
  jobDescription: string
}

export interface GenerateResponse {
  id: string
  outputText: string
  generationsUsed: number
  generationsLimit: number
}

export const PLAN_LIMITS: Record<Plan, number> = {
  free: 3,
  basic: 20,
  pro: -1,
}

export const PLAN_LABELS: Record<Plan, string> = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro',
}

export const PLAN_PRICES: Record<Plan, string> = {
  free: '$0',
  basic: '$9',
  pro: '$19',
}
