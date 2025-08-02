import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

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

// Create Supabase client with error handling for build time
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: typeof window !== 'undefined', // Only persist session in browser
    autoRefreshToken: typeof window !== 'undefined', // Only auto-refresh in browser
  }
})

// Types for organization data
export interface Organization {
  id: string
  name: string
  description?: string
  industry?: string
  website?: string
  logo_url?: string
  subscription_plan?: string
  is_active: boolean
}

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

// Organization helpers
export const getCurrentUserOrganization = async (): Promise<{ data: Organization | null, error: unknown }> => {
  try {
    const { data, error } = await supabase.rpc('get_current_user_organization')
    
    if (error) {
      console.error('Error getting current user organization:', error)
      return { data: null, error }
    }
    
    // Since RPC returns an array, get the first item
    const organization = data && data.length > 0 ? data[0] : null
    return { data: organization, error: null }
  } catch (error) {
    console.error('Error in getCurrentUserOrganization:', error)
    return { data: null, error }
  }
}

// Check if current user is super admin
export const isCurrentUserSuperAdmin = async (): Promise<{ data: boolean, error: unknown }> => {
  try {
    const { data, error } = await supabase.rpc('is_current_user_super_admin')
    
    if (error) {
      console.error('Error checking super admin status:', error)
      return { data: false, error }
    }
    
    return { data: data || false, error: null }
  } catch (error) {
    console.error('Error in isCurrentUserSuperAdmin:', error)
    return { data: false, error }
  }
}

// Multi-Tenant Organization Functions (legacy compatibility)
export const getUserOrganizationData = async () => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      organization_id,
      role,
      organization:organizations(*)
    `)
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single()
  
  return { data, error }
}

export const userHasOrganization = async () => {
  const result = await getUserOrganizationData()
  return result.data?.organization_id !== null
}

export const getAvailableOrganizationsForJoin = async () => {
  const { data, error } = await supabase.rpc('get_available_organizations_for_join')
  return { data, error }
}

export const createJoinRequest = async (request: {
  organization_id: string
  admin_email: string
  message?: string
}) => {
  const user = await getCurrentUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('organization_join_requests')
    .insert([{
      user_id: user.id,
      organization_id: request.organization_id,
      requested_by_email: user.email,
      message: request.message
    }])
    .select()
    .single()
  
  // TODO: Send email notification to admin_email
  
  return { data, error }
}

export const getUserJoinRequests = async () => {
  const { data, error } = await supabase
    .from('organization_join_requests')
    .select(`
      *,
      organization:organizations(name)
    `)
    .order('requested_at', { ascending: false })
  
  return { data, error }
}

export const getOrganizationJoinRequests = async (organizationId: string) => {
  const { data, error } = await supabase
    .from('organization_join_requests')
    .select(`
      *
    `)
    .eq('organization_id', organizationId)
    .order('requested_at', { ascending: false })
  
  return { data, error }
}

export const approveJoinRequest = async (requestId: string) => {
  const { data: request, error: fetchError } = await supabase
    .from('organization_join_requests')
    .select('user_id, organization_id')
    .eq('id', requestId)
    .single()
  
  if (fetchError || !request) return { data: null, error: fetchError }
  
  // Start transaction-like operations
  // 1. Update user's organization
  const { error: userError } = await supabase
    .from('users')
    .update({ 
      organization_id: request.organization_id,
      role: 'user' // Default role
    })
    .eq('id', request.user_id)
  
  if (userError) return { data: null, error: userError }
  
  // 2. Update request status
  const { data, error } = await supabase
    .from('organization_join_requests')
    .update({ 
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: (await getCurrentUser())?.id
    })
    .eq('id', requestId)
    .select()
    .single()
  
  return { data, error }
}

export const rejectJoinRequest = async (requestId: string) => {
  const { data, error } = await supabase
    .from('organization_join_requests')
    .update({ 
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: (await getCurrentUser())?.id
    })
    .eq('id', requestId)
    .select()
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
  if (!userOrg || !userOrg.data?.id) return { data: [], error: 'No organization found' }

  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      contacts:customer_contacts (*),
      activities:customer_activities (*)
    `)
    .eq('organization_id', userOrg.data.id)
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
  if (!userOrg?.data?.id) return { data: null, error: 'No organization found' }

  const { data, error } = await supabase
    .from('customers')
    .insert([{
      ...customer,
      organization_id: userOrg.data.id,
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
  if (!userOrg?.data?.id) return { data: null, error: 'No organization found' }

  const customersWithOrg = customers.map(customer => ({
    ...customer,
    organization_id: userOrg.data!.id,
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
  if (!userOrg?.data?.id) return { data: null, error: 'No organization found' }

  const { data, error } = await supabase
    .from('customer_contacts')
    .insert([{
      ...contact,
      organization_id: userOrg.data.id,
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
  
  if (!user || !userOrg?.data?.id) {
    return { data: null, error: 'User or organization not found' }
  }

  const { data, error } = await supabase
    .from('customer_activities')
    .insert([{
      ...activity,
      organization_id: userOrg.data.id,
      user_id: user.id,
      status: activity.status || 'scheduled',
      priority: activity.priority || 'normal'
    }])
    .select()
  
  return { data, error }
}

// Create a new user manually (for admin use)
export const createUserManually = async (userData: {
  email: string
  name?: string
  role?: 'user' | 'org_admin' | 'super_admin'
  organization_id?: string
}) => {
  try {
    console.log('Creating user manually:', userData)
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', userData.email)
      .single()
    
    if (existingUser) {
      return {
        data: null,
        error: {
          message: `Benutzer mit E-Mail "${userData.email}" existiert bereits.`,
          code: 'USER_EXISTS'
        }
      }
    }
    
    // Create user record (this creates a user without Supabase Auth)
    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: userData.email,
        name: userData.name || null,
        role: userData.role || 'user',
        organization_id: userData.organization_id || null
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating user:', error)
      return { data: null, error }
    }
    
    console.log('User created successfully:', data)
    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error creating user:', err)
    return {
      data: null,
      error: {
        message: err instanceof Error ? err.message : 'Unknown error occurred',
        details: err
      }
    }
  }
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
    
    console.log('Inserting organization data:', insertData)
    
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert([insertData])
      .select()
      .single()
    
    if (orgError) {
      console.error('Organization insert error:', orgError)
      return { data: null, error: orgError }
    }
    
    console.log('Organization created successfully:', orgData)
    
    // If admin_email is provided, try to assign admin role
    if (org.admin_email) {
      console.log('Attempting to assign admin role to:', org.admin_email)
      
      // First, let's check all users to debug
      console.log('=== DEBUG: Checking all users first ===')
      const { data: allUsers } = await supabase
        .from('users')
        .select('id, email, role, organization_id')
      
      console.log('All users in database:', allUsers)
      console.log('Total users found:', allUsers?.length || 0)
      
      if (allUsers) {
        allUsers.forEach(u => {
          console.log(`User: ${u.email} | ID: ${u.id} | Role: ${u.role} | Org: ${u.organization_id}`)
        })
      }
      
      // Now try to find the specific user
      console.log('=== Searching for specific user ===')
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('email', org.admin_email)
        .single()
      
      console.log('Search result for', org.admin_email, ':', userData)
      console.log('Search error:', userError)
      
      if (userError || !userData) {
        console.error('User not found. Error details:', userError)
        console.log('Available emails in database:')
        if (allUsers) {
          allUsers.forEach(u => console.log(`- ${u.email}`))
        }
        
        // Delete the organization since admin assignment failed
        await supabase
          .from('organizations')
          .delete()
          .eq('id', orgData.id)
        
        return { 
          data: null, 
          error: { 
            message: `Admin-Benutzer mit E-Mail "${org.admin_email}" wurde nicht in der Datenbank gefunden. Bitte stellen Sie sicher, dass sich der Benutzer zuerst registriert hat.\n\nVerfügbare Benutzer:\n${allUsers?.map(u => `- ${u.email}`).join('\n') || 'Keine Benutzer gefunden'}`,
            code: 'USER_NOT_FOUND'
          } 
        }
      }
      
      console.log('Found admin user:', userData)
      
      // Update user's organization_id and role to org_admin
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          organization_id: orgData.id,
          role: 'org_admin'
        })
        .eq('id', userData.id)
      
      if (updateError) {
        console.error('Error updating user role:', updateError)
        // Delete the organization since admin assignment failed
        await supabase
          .from('organizations')
          .delete()
          .eq('id', orgData.id)
        
        return { 
          data: null, 
          error: { 
            message: `Fehler beim Zuweisen der Admin-Rolle: ${updateError.message}`,
            details: updateError
          } 
        }
      }
      
      console.log('Admin role assigned successfully')
    }
    
    return { data: orgData, error: null }
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
  console.log('=== isSuperAdmin Check ===')
  console.log('Checking email:', userEmail)
  
  // Hardcoded super admin emails - diese funktionieren IMMER
  const hardcodedSuperAdmins = [
    'testdatacrmpascal@gmail.com',
    'admin@datacrm.system'
  ]
  
  if (hardcodedSuperAdmins.includes(userEmail)) {
    console.log('✅ User is hardcoded super admin')
    return true
  }
  
  // Check database for super_admin role
  try {
    console.log('🔍 Checking database for super_admin role...')
    const { data, error } = await supabase
      .from('users')
      .select('role, is_active')
      .eq('email', userEmail)
      .single()
    
    console.log('Database query result:', { data, error })
    
    if (error) {
      console.log('❌ Database error:', error.message)
      return false
    }
    
    const isSuper = data?.role === 'super_admin' && data?.is_active === true
    console.log('Database super admin check result:', isSuper)
    console.log('User role:', data?.role, 'Is active:', data?.is_active)
    
    return isSuper
  } catch (err) {
    console.error('❌ Unexpected error in isSuperAdmin:', err)
    return false
  }
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
    if (!userOrganization || !userOrganization.data?.id) {
      return { data: null, error: 'No organization found' }
    }

    // Get all customers for the organization
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .eq('organization_id', userOrganization.data.id)

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

// Organization Management Functions for Super Admin
export const getOrganizationUserCount = async (organizationId: string): Promise<{ data: number | null, error: unknown }> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('organization_id', organizationId)
      .eq('is_active', true)

    if (error) {
      console.error('Error getting user count:', error)
      return { data: null, error }
    }

    return { data: data?.length || 0, error: null }
  } catch (error) {
    console.error('Error in getOrganizationUserCount:', error)
    return { data: null, error }
  }
}

export const getAllOrganizationsWithUserCounts = async (): Promise<{ data: Array<Organization & { user_count: number; created_at: string }> | null, error: unknown }> => {
  try {
    // Get all organizations
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (orgError) {
      console.error('Error getting organizations:', orgError)
      return { data: null, error: orgError }
    }

    if (!organizations) {
      return { data: [], error: null }
    }

    // Get user counts for each organization
    const organizationsWithCounts = await Promise.all(
      organizations.map(async (org) => {
        const { data: userCount } = await getOrganizationUserCount(org.id)
        return {
          ...org,
          user_count: userCount || 0,
          created_at: org.created_at || new Date().toISOString()
        }
      })
    )

    return { data: organizationsWithCounts, error: null }
  } catch (error) {
    console.error('Error in getAllOrganizationsWithUserCounts:', error)
    return { data: null, error }
  }
}

export const getOrganizationUsers = async (organizationId: string): Promise<{ data: Record<string, unknown>[] | null, error: unknown }> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        is_active,
        created_at,
        organization_id
      `)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error getting organization users:', error)
      return { data: null, error }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error in getOrganizationUsers:', error)
    return { data: null, error }
  }
}

export const addUserToOrganization = async (userData: {
  email: string
  first_name: string
  last_name: string
  organization_id: string
  role?: string
  temporary_password?: string
}): Promise<{ data: Record<string, unknown> | null, error: unknown }> => {
  try {
    // Create auth user first
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.temporary_password || 'TempPass123!',
      email_confirm: true
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return { data: null, error: authError }
    }

    if (!authData.user) {
      return { data: null, error: 'Failed to create user' }
    }

    // Create user profile
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        organization_id: userData.organization_id,
        role: userData.role || 'user',
        is_active: true
      }])
      .select()
      .single()

    if (profileError) {
      console.error('Error creating user profile:', profileError)
      // Try to delete the auth user if profile creation failed
      await supabase.auth.admin.deleteUser(authData.user.id)
      return { data: null, error: profileError }
    }

    return { data: profileData, error: null }
  } catch (error) {
    console.error('Error in addUserToOrganization:', error)
    return { data: null, error }
  }
}

export const addAdminToOrganization = async (userData: {
  email: string
  first_name: string
  last_name: string
  organization_id: string
  temporary_password?: string
}): Promise<{ data: Record<string, unknown> | null, error: unknown }> => {
  return addUserToOrganization({
    ...userData,
    role: 'org_admin'
  })
}
