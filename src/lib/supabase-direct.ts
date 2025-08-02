import { supabase, Organization } from './supabase'

// TEMPORÄRE LÖSUNG: Direkte Datenbank-Abfrage ohne RPC
export const getCurrentUserOrganizationDirect = async (): Promise<{ data: Organization | null, error: unknown }> => {
  try {
    console.log('🔄 [SUPABASE DIRECT] Starting direct organization query')
    
    // Get current user
    const { data: currentUser } = await supabase.auth.getUser()
    if (!currentUser?.user?.id) {
      console.error('❌ [SUPABASE DIRECT] No authenticated user')
      return { data: null, error: 'No authenticated user' }
    }
    
    console.log('👤 [SUPABASE DIRECT] Current user ID:', currentUser.user.id)
    
    // Method 1: Try to get user with organization
    const { data: userWithOrg, error: userError } = await supabase
      .from('users')
      .select(`
        organization_id,
        organizations:organization_id (
          id,
          name,
          slug,
          email,
          domain,
          subscription_plan,
          is_active
        )
      `)
      .eq('id', currentUser.user.id)
      .eq('is_active', true)
      .maybeSingle()
    
    console.log('📊 [SUPABASE DIRECT] User with org query result:', {
      data: userWithOrg,
      error: userError
    })
    
    if (userError) {
      console.error('❌ [SUPABASE DIRECT] User query failed:', userError)
      return { data: null, error: userError }
    }
    
    if (!userWithOrg) {
      console.log('❌ [SUPABASE DIRECT] User not found in users table')
      return { data: null, error: null }
    }
    
    const organization = userWithOrg.organizations 
      ? (Array.isArray(userWithOrg.organizations) 
         ? userWithOrg.organizations[0] 
         : userWithOrg.organizations) as Organization | null
      : null
    console.log('🏢 [SUPABASE DIRECT] Final organization result:', organization)
    
    return { data: organization, error: null }
    
  } catch (error) {
    console.error('❌ [SUPABASE DIRECT] Exception in direct organization query:', error)
    return { data: null, error }
  }
}

// Alternative Method: Simple organization lookup
export const getOrganizationById = async (orgId: string): Promise<{ data: Organization | null, error: unknown }> => {
  try {
    console.log('🔍 [SUPABASE DIRECT] Looking up organization by ID:', orgId)
    
    const { data: organization, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .eq('is_active', true)
      .single()
    
    console.log('🏢 [SUPABASE DIRECT] Organization lookup result:', {
      data: organization,
      error: error
    })
    
    return { data: organization, error }
    
  } catch (error) {
    console.error('❌ [SUPABASE DIRECT] Exception in organization lookup:', error)
    return { data: null, error }
  }
}
