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

// Organizations
export const getOrganizations = async () => {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const createOrganization = async (org: {
  name: string
  description?: string
  admin_email: string
}) => {
  try {
    console.log('Creating organization:', org)
    
    // First, try to check if the table exists by doing a simple query
    const { data: testData, error: testError } = await supabase
      .from('organizations')
      .select('count')
      .limit(1)
    
    console.log('Table test result:', { testData, testError })
    
    if (testError) {
      console.error('Organizations table does not exist or is not accessible:', testError)
      return { 
        data: null, 
        error: { 
          message: 'Database table "organizations" not found. Please run the database setup script first.',
          details: testError
        } 
      }
    }
    
    // If table exists, try to insert
    const insertData = {
      name: org.name,
      admin_email: org.admin_email,
      domain: org.description || null
    }
    
    console.log('Inserting data:', insertData)
    
    const { data, error } = await supabase
      .from('organizations')
      .insert([insertData])
      .select()
    
    console.log('Insert result:', { data, error })
    
    if (error) {
      console.error('Insert error:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error in createOrganization:', err)
    return { 
      data: null, 
      error: { 
        message: err instanceof Error ? err.message : 'Unknown error occurred',
        details: err
      } 
    }
  }
}

// User roles and permissions
export const getUserRole = async (userId: string, orgId?: string) => {
  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      *,
      role:roles(*),
      organization:organizations(*)
    `)
    .eq('user_id', userId)
    .eq('org_id', orgId || null)
    .single()
  
  return { data, error }
}

export const getUserPermissions = async (userId: string, orgId?: string) => {
  const { data, error } = await supabase
    .from('user_permissions')
    .select(`
      *,
      permission:permissions(*)
    `)
    .eq('user_id', userId)
    .eq('org_id', orgId || null)
  
  return { data, error }
}

export const assignRole = async (assignment: {
  user_id: string
  role_id: string
  org_id?: string
  assigned_by: string
}) => {
  const { data, error } = await supabase
    .from('user_roles')
    .insert([assignment])
    .select()
  
  return { data, error }
}

export const assignPermission = async (assignment: {
  user_id: string
  permission_id: string
  org_id?: string
  assigned_by: string
}) => {
  const { data, error } = await supabase
    .from('user_permissions')
    .insert([assignment])
    .select()
  
  return { data, error }
}

export const getAllRoles = async () => {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('level', { ascending: false })
  
  return { data, error }
}

export const getAllPermissions = async () => {
  const { data, error } = await supabase
    .from('permissions')
    .select('*')
    .order('category', { ascending: true })
  
  return { data, error }
}

export const getOrgUsers = async (orgId: string) => {
  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      *,
      user:profiles(*),
      role:roles(*)
    `)
    .eq('org_id', orgId)
  
  return { data, error }
}

// Check if user is super admin
export const isSuperAdmin = async (userEmail: string) => {
  return userEmail === 'testdatacrmpascal@gmail.com'
}
