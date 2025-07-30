import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Dynamically determine the correct redirect URL
const getRedirectUrl = () => {
  if (typeof window === 'undefined') return 'https://githubpscl.github.io/DATACRM'
  
  // For local development
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:3000'
  }
  
  // For production (GitHub Pages)
  return 'https://githubpscl.github.io/DATACRM'
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getRedirectUrl()
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Database helpers
export const getCustomers = async () => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const addCustomer = async (customer: {
  email: string
  first_name?: string
  last_name?: string
  company?: string
  phone?: string
}) => {
  const { data, error } = await supabase
    .from('customers')
    .insert([customer])
    .select()
  
  return { data, error }
}

export const addCustomersBulk = async (customers: {
  email: string
  first_name?: string
  last_name?: string
  company?: string
  phone?: string
}[]) => {
  const { data, error } = await supabase
    .from('customers')
    .insert(customers)
    .select()
  
  return { data, error }
}

export const updateCustomer = async (id: string, updates: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
  
  return { data, error }
}

export const deleteCustomer = async (id: string) => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)
  
  return { error }
}
