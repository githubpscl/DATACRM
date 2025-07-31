// Database Types for DATACRM
export interface Organization {
  id: string
  name: string
  slug: string
  legal_name?: string
  business_type?: string
  tax_id?: string
  vat_id?: string
  email: string
  phone?: string
  website?: string
  street?: string
  house_number?: string
  postal_code?: string
  city?: string
  state?: string
  country?: string
  industry?: string
  employee_count?: number
  founded_year?: number
  annual_revenue?: number
  description?: string
  subscription_plan: 'free' | 'basic' | 'professional' | 'enterprise'
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'trial'
  billing_email?: string
  billing_cycle?: 'monthly' | 'yearly'
  subscription_starts_at?: string
  subscription_ends_at?: string
  max_users: number
  max_customers: number
  max_storage_mb: number
  is_active: boolean
  is_verified: boolean
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  organization_id?: string
  email: string
  first_name?: string
  last_name?: string
  display_name?: string
  avatar_url?: string
  phone?: string
  mobile?: string
  job_title?: string
  department?: string
  employee_id?: string
  role: 'super_admin' | 'org_admin' | 'manager' | 'user'
  permissions: Record<string, unknown>
  is_active: boolean
  is_verified: boolean
  email_verified_at?: string
  two_factor_enabled: boolean
  last_login_at?: string
  last_activity_at?: string
  login_count: number
  language: string
  timezone: string
  notifications_email: boolean
  notifications_push: boolean
  theme: 'light' | 'dark' | 'auto'
  onboarding_completed: boolean
  tour_completed: boolean
  created_at: string
  updated_at: string
  deleted_at?: string
  organization?: Organization
}

export interface Customer {
  id: string
  organization_id: string
  customer_type: 'person' | 'company'
  customer_number: string
  // Person fields
  salutation?: string
  first_name?: string
  last_name?: string
  birth_date?: string
  gender?: string
  // Company fields
  company_name?: string
  legal_form?: string
  tax_id?: string
  vat_id?: string
  industry?: string
  employee_count?: number
  annual_revenue?: number
  founding_date?: string
  // Contact info
  email?: string
  email_secondary?: string
  phone?: string
  mobile?: string
  website?: string
  // Address
  street?: string
  house_number?: string
  postal_code?: string
  city?: string
  state?: string
  country?: string
  // Business relationship
  customer_status: 'lead' | 'prospect' | 'customer' | 'inactive'
  acquisition_source?: string
  acquisition_date?: string
  first_contact_date?: string
  last_contact_date?: string
  // Financial
  credit_limit?: number
  payment_terms?: number
  currency: string
  tax_rate?: number
  // Preferences
  language: string
  communication_preference?: 'email' | 'phone' | 'sms' | 'mail'
  newsletter_subscribed: boolean
  marketing_consent: boolean
  marketing_consent_date?: string
  privacy_consent: boolean
  privacy_consent_date?: string
  data_processing_consent: boolean
  // Categorization
  tags?: string[]
  category?: string
  priority: 'low' | 'normal' | 'high' | 'critical'
  // Notes
  notes?: string
  internal_notes?: string
  custom_fields?: Record<string, unknown>
  // Activity tracking
  last_order_date?: string
  total_orders: number
  total_revenue: number
  average_order_value: number
  last_activity_type?: string
  last_activity_date?: string
  // Assignment
  assigned_to?: string
  team?: string
  is_active: boolean
  is_verified: boolean
  quality_score?: number
  created_at: string
  updated_at: string
  deleted_at?: string
  contacts?: CustomerContact[]
  activities?: CustomerActivity[]
}

export interface CustomerContact {
  id: string
  customer_id: string
  organization_id: string
  first_name: string
  last_name: string
  job_title?: string
  department?: string
  email?: string
  phone?: string
  mobile?: string
  contact_type: 'primary' | 'billing' | 'technical' | 'decision_maker'
  is_primary: boolean
  is_active: boolean
  notes?: string
  created_at: string
  updated_at: string
  created_by: string
}

export interface CustomerActivity {
  id: string
  customer_id: string
  organization_id: string
  user_id: string
  activity_type: string
  title: string
  description?: string
  outcome?: string
  scheduled_at?: string
  completed_at?: string
  duration_minutes?: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  metadata?: Record<string, unknown>
  attachments?: string[]
  created_at: string
  updated_at: string
  created_by: string
}

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error?: {
    message: string
    details?: unknown
  } | null
}

// Form types for customer creation/editing
export interface CustomerFormData {
  customer_type: 'person' | 'company'
  email: string
  first_name?: string
  last_name?: string
  company_name?: string
  phone?: string
  mobile?: string
  salutation?: string
  industry?: string
  customer_status?: 'lead' | 'prospect' | 'customer' | 'inactive'
  tags?: string[]
  priority?: 'low' | 'normal' | 'high' | 'critical'
  notes?: string
  website?: string
  street?: string
  house_number?: string
  postal_code?: string
  city?: string
  country?: string
}

export interface ContactFormData {
  first_name: string
  last_name: string
  email?: string
  phone?: string
  job_title?: string
  department?: string
  contact_type?: 'primary' | 'billing' | 'technical' | 'decision_maker'
  is_primary?: boolean
}

export interface ActivityFormData {
  activity_type: string
  title: string
  description?: string
  scheduled_at?: string
  duration_minutes?: number
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  metadata?: Record<string, unknown>
}
