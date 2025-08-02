import { supabase } from './supabase'

// SUPER EINFACHE VERSION - Ohne komplexe Joins
export const getOrganizationSimple = async () => {
  try {
    console.log('🔍 [SIMPLE] Starting simple organization lookup...')
    
    // Step 1: Get current user
    const { data: currentUser } = await supabase.auth.getUser()
    if (!currentUser?.user?.id) {
      console.error('❌ [SIMPLE] No authenticated user')
      return { data: null, error: 'No authenticated user' }
    }
    
    console.log('👤 [SIMPLE] Current user:', currentUser.user.id, currentUser.user.email)
    
    // Step 2: Get user record with organization_id
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('organization_id, email, role, is_active')
      .eq('id', currentUser.user.id)
      .single()
    
    console.log('📋 [SIMPLE] User record:', {
      data: userRecord,
      error: userError
    })
    
    if (userError) {
      console.error('❌ [SIMPLE] User query failed:', userError)
      return { data: null, error: userError }
    }
    
    if (!userRecord?.organization_id) {
      console.log('❌ [SIMPLE] User has no organization_id')
      return { data: null, error: null }
    }
    
    console.log('🔍 [SIMPLE] Looking up organization:', userRecord.organization_id)
    
    // Step 3: Get organization by ID
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, email, subscription_plan, is_active')
      .eq('id', userRecord.organization_id)
      .eq('is_active', true)
      .single()
    
    console.log('🏢 [SIMPLE] Organization result:', {
      data: organization,
      error: orgError
    })
    
    if (orgError) {
      console.error('❌ [SIMPLE] Organization query failed:', orgError)
      return { data: null, error: orgError }
    }
    
    console.log('✅ [SIMPLE] Success! Organization found:', organization?.name)
    
    return { data: organization, error: null }
    
  } catch (error) {
    console.error('❌ [SIMPLE] Exception:', error)
    return { data: null, error }
  }
}
