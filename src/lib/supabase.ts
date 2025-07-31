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

// Database helpers - Organizations
export const getCurrentUserOrganization = async () => {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      organization:organizations (*)
    `)
    .eq('id', user.id)
    .single()
  
  return { data, error }
}

export const getOrganizations = async () => {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false })
  
  return { data, error }
}

// Database helpers - Users
export const createUserProfile = async (userData: {
  id: string
  email: string
  first_name?: string
  last_name?: string
  organization_id?: string
  role?: string
}) => {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      id: userData.id,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      organization_id: userData.organization_id,
      role: userData.role || 'user',
      is_active: true,
      is_verified: false
    }])
    .select()
  
  return { data, error }
}

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      organization:organizations (*)
    `)
    .eq('id', userId)
    .single()
  
  return { data, error }
}

// Database helpers - Customers
export const getCustomers = async () => {
  const userOrg = await getCurrentUserOrganization()
  if (!userOrg || !userOrg.data?.organization_id) return { data: [], error: 'No organization found' }

  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      contacts:customer_contacts (*),
      activities:customer_activities (*)
    `)
    .eq('organization_id', userOrg.data.organization_id)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const addCustomer = async (customer: {
  customer_type: 'person' | 'company'
  email: string
  first_name?: string
  last_name?: string
  company_name?: string
  phone?: string
  salutation?: string
  industry?: string
  customer_status?: 'lead' | 'prospect' | 'customer' | 'inactive'
  tags?: string[]
  priority?: 'low' | 'normal' | 'high' | 'critical'
  notes?: string
}) => {
  const userOrg = await getCurrentUserOrganization()
  if (!userOrg?.data?.organization_id) return { data: null, error: 'No organization found' }

  const { data, error } = await supabase
    .from('customers')
    .insert([{
      ...customer,
      organization_id: userOrg.data.organization_id,
      customer_status: customer.customer_status || 'lead',
      priority: customer.priority || 'normal',
      is_active: true,
      is_verified: false,
      language: 'de',
      currency: 'EUR'
    }])
    .select()
  
  return { data, error }
}

export const addCustomersBulk = async (customers: {
  customer_type: 'person' | 'company'
  email: string
  first_name?: string
  last_name?: string
  company_name?: string
  phone?: string
  industry?: string
}[]) => {
  const userOrg = await getCurrentUserOrganization()
  if (!userOrg?.data?.organization_id) return { data: null, error: 'No organization found' }

  const customersWithOrg = customers.map(customer => ({
    ...customer,
    organization_id: userOrg.data.organization_id,
    customer_status: 'lead' as const,
    priority: 'normal' as const,
    is_active: true,
    is_verified: false,
    language: 'de',
    currency: 'EUR'
  }))

  const { data, error } = await supabase
    .from('customers')
    .insert(customersWithOrg)
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

// Customer Contacts
export const addCustomerContact = async (contact: {
  customer_id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  job_title?: string
  department?: string
  contact_type?: 'primary' | 'billing' | 'technical' | 'decision_maker'
  is_primary?: boolean
}) => {
  const userOrg = await getCurrentUserOrganization()
  if (!userOrg?.data?.organization_id) return { data: null, error: 'No organization found' }

  const { data, error } = await supabase
    .from('customer_contacts')
    .insert([{
      ...contact,
      organization_id: userOrg.data.organization_id,
      contact_type: contact.contact_type || 'primary',
      is_primary: contact.is_primary || false,
      is_active: true
    }])
    .select()
  
  return { data, error }
}

// Customer Activities
export const addCustomerActivity = async (activity: {
  customer_id: string
  activity_type: string
  title: string
  description?: string
  outcome?: string
  scheduled_at?: string
  duration_minutes?: number
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  metadata?: Record<string, unknown>
}) => {
  const user = await getCurrentUser()
  const userOrg = await getCurrentUserOrganization()
  
  if (!user || !userOrg?.data?.organization_id) {
    return { data: null, error: 'User or organization not found' }
  }

  const { data, error } = await supabase
    .from('customer_activities')
    .insert([{
      ...activity,
      organization_id: userOrg.data.organization_id,
      user_id: user.id,
      status: activity.status || 'scheduled',
      priority: activity.priority || 'normal'
    }])
    .select()
  
  return { data, error }
}

// Organizations - Updated functions
export const createOrganization = async (org: {
  name: string
  description?: string
  admin_email?: string // Optional admin email
  industry?: string
  website?: string
  phone?: string
}) => {
  try {
    console.log('Creating organization:', org)
    
    // Create organization data without non-existent columns
    const insertData = {
      name: org.name,
      email: org.admin_email || null, // Use 'email' field instead of 'admin_email'
      industry: org.industry || null,
      website: org.website || null,
      phone: org.phone || null,
      subscription_plan: 'free', // Default plan
      is_active: true
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

export const assignUserRole = async (assignment: {
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

// Check if user is organization admin
export const isOrgAdmin = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'org_admin')
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking org admin status:', error)
      return false
    }
    
    return !!data
  } catch (error) {
    console.error('Error in isOrgAdmin:', error)
    return false
  }
}

// Get user roles with organization and user details
export const getUserRoles = async () => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        id,
        user_id,
        organization_id,
        role,
        created_at,
        organizations!organization_id(name)
      `)
    
    if (error) {
      console.error('Error getting user roles:', error)
      return { data: [], error }
    }
    
    // Transform the data to match the expected interface
    const rolesWithUser = data?.map(role => ({
      ...role,
      user: {
        email: `user-${role.user_id.slice(0, 8)}@example.com`
      },
      organization: {
        name: Array.isArray(role.organizations) 
          ? (role.organizations[0] as { name: string })?.name || 'Unknown Organization'
          : (role.organizations as { name: string })?.name || 'Unknown Organization'
      }
    })) || []
    
    return { data: rolesWithUser, error: null }
  } catch (error) {
    console.error('Error in getUserRoles:', error)
    return { data: [], error }
  }
}

// Assign role to user
export const assignRole = async (userId: string, role: 'super_admin' | 'org_admin' | 'user' | 'viewer', organizationId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        organization_id: organizationId,
        role: role,
        created_at: new Date().toISOString()
      })
      .select()
    
    if (error) {
      console.error('Error assigning role:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Error in assignRole:', error)
    return { data: null, error }
  }
}

// Remove role from user
export const removeRole = async (userId: string, organizationId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
    
    if (error) {
      console.error('Error removing role:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Error in removeRole:', error)
    return { data: null, error }
  }
}

// Update organization details
export const updateOrganization = async (orgId: string, updates: { name?: string, domain?: string }) => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', orgId)
      .select()
    
    if (error) {
      console.error('Error updating organization:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Error in updateOrganization:', error)
    return { data: null, error }
  }
}

// Add user to organization as admin
export const addAdminToOrg = async (userEmail: string, orgId: string) => {
  try {
    // First, check if user exists in profiles
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single()
    
    if (userError || !userProfile) {
      return { data: null, error: { message: 'Benutzer nicht gefunden' } }
    }
    
    // Check if user is already in this organization
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userProfile.id)
      .eq('organization_id', orgId)
      .single()
    
    if (existingRole) {
      return { data: null, error: { message: 'Benutzer ist bereits Mitglied dieser Organisation' } }
    }
    
    // Add user as admin to organization
    const { data, error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userProfile.id,
        organization_id: orgId,
        role: 'org_admin'
      })
      .select()
    
    if (error) {
      console.error('Error adding admin to organization:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Error in addAdminToOrg:', error)
    return { data: null, error }
  }
}

// Get all users for super admin view
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles (
          role,
          organization:organizations (
            id,
            name
          )
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error getting all users:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Error in getAllUsers:', error)
    return { data: null, error }
  }
}

// Get users without organization
export const getUnassignedUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .not('id', 'in', 
        supabase
          .from('user_roles')
          .select('user_id')
      )
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error getting unassigned users:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Error in getUnassignedUsers:', error)
    return { data: null, error }
  }
}

// Update user profile
export const updateUserProfile = async (userId: string, updates: { name?: string; email?: string }) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
    
    if (error) {
      console.error('Error updating user profile:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Error in updateUserProfile:', error)
    return { data: null, error }
  }
}

// Analytics functions
export const getAnalyticsData = async () => {
  try {
    const userOrganization = await getCurrentUserOrganization()
    if (!userOrganization || !userOrganization.data?.organization_id) {
      return { data: null, error: 'No organization found' }
    }

    // Get all customers for the organization
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .eq('organization_id', userOrganization.data.organization_id)

    if (customersError) {
      console.error('Error loading customers for analytics:', customersError)
      return { data: null, error: customersError }
    }

    const totalCustomers = customers?.length || 0
    const activeCustomers = customers?.filter(c => c.customer_status === 'customer').length || 0
    const leadsCount = customers?.filter(c => c.customer_status === 'lead').length || 0
    const prospectsCount = customers?.filter(c => c.customer_status === 'prospect').length || 0

    // Calculate customers created this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const newCustomersThisMonth = customers?.filter(c => 
      new Date(c.created_at) >= startOfMonth
    ).length || 0

    // Calculate growth rate (simplified)
    const customerGrowthRate = totalCustomers > 0 ? (newCustomersThisMonth / totalCustomers) * 100 : 0

    // Group by status
    const customersByStatus = customers?.reduce((acc, customer) => {
      acc[customer.customer_status] = (acc[customer.customer_status] || 0) + 1
      return acc
    }, {} as { [key: string]: number }) || {}

    // Group by type
    const customersByType = customers?.reduce((acc, customer) => {
      acc[customer.customer_type] = (acc[customer.customer_type] || 0) + 1
      return acc
    }, { person: 0, company: 0 }) || { person: 0, company: 0 }

    // Top industries
    const industryCount = customers?.reduce((acc, customer) => {
      if (customer.industry) {
        acc[customer.industry] = (acc[customer.industry] || 0) + 1
      }
      return acc
    }, {} as { [key: string]: number }) || {}

    const topIndustries = Object.entries(industryCount)
      .map(([industry, count]) => ({ industry, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const analyticsData = {
      totalCustomers,
      activeCustomers,
      newCustomersThisMonth,
      leadsCount,
      prospectsCount,
      customerGrowthRate: Math.round(customerGrowthRate * 10) / 10,
      customersByStatus,
      customersByType,
      topIndustries
    }

    return { data: analyticsData, error: null }
  } catch (error) {
    console.error('Error in getAnalyticsData:', error)
    return { data: null, error }
  }
}
