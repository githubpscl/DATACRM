import { supabase, Organization } from './supabase'

// TIMEOUT-SICHERE VERSION - Alle Abfragen mit Timeouts
export const getCurrentUserOrganizationSafe = async (): Promise<{ data: Organization | null, error: unknown }> => {
  try {
    console.log('🏢 [SAFE] Starting SAFE organization query...')
    
    // Step 1: Get current user with timeout
    console.log('👤 [SAFE] Getting current user with timeout...')
    const userPromise = supabase.auth.getUser()
    const userTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('User query timeout after 3 seconds')), 3000)
    })
    
    const userResult = await Promise.race([userPromise, userTimeout]) as any
    const { data: currentUser } = userResult
    
    if (!currentUser?.user?.id) {
      console.error('❌ [SAFE] No authenticated user')
      return { data: null, error: 'No authenticated user' }
    }
    
    console.log('👤 [SAFE] Current user:', currentUser.user.id, currentUser.user.email)
    
    // Step 2: Simple user query with timeout
    console.log('🔄 [SAFE] Querying users table with timeout...')
    const userQueryPromise = supabase
      .from('users')
      .select('organization_id, email, role, is_active')
      .eq('id', currentUser.user.id)
      .single()
    
    const userQueryTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Users table query timeout after 5 seconds')), 5000)
    })
    
    const userQueryResult = await Promise.race([userQueryPromise, userQueryTimeout]) as any
    const { data: userRecord, error: userError } = userQueryResult
    
    console.log('📋 [SAFE] User record:', {
      data: userRecord,
      error: userError
    })
    
    if (userError) {
      console.error('❌ [SAFE] User query failed:', userError)
      return { data: null, error: userError }
    }
    
    if (!userRecord?.organization_id) {
      console.log('❌ [SAFE] User has no organization_id')
      return { data: null, error: null }
    }
    
    // Step 3: Organization query with timeout
    console.log('🏢 [SAFE] Querying organization with timeout...', userRecord.organization_id)
    const orgQueryPromise = supabase
      .from('organizations')
      .select('id, name, email, subscription_plan, is_active')
      .eq('id', userRecord.organization_id)
      .eq('is_active', true)
      .single()
    
    const orgQueryTimeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Organization query timeout after 5 seconds')), 5000)
    })
    
    const orgQueryResult = await Promise.race([orgQueryPromise, orgQueryTimeout]) as any
    const { data: organization, error: orgError } = orgQueryResult
    
    console.log('🏢 [SAFE] Organization result:', {
      data: organization,
      error: orgError
    })
    
    if (orgError) {
      console.error('❌ [SAFE] Organization query failed:', orgError)
      return { data: null, error: orgError }
    }
    
    console.log('✅ [SAFE] Success! Organization found:', organization?.name)
    
    return { data: organization, error: null }
    
  } catch (error) {
    console.error('❌ [SAFE] Exception:', error)
    return { data: null, error }
  }
}
