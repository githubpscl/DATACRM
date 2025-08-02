import { supabase } from './supabase'

// DEBUG VERSION - Zeigt alle verfügbaren Daten an
export const debugDatabase = async () => {
  try {
    console.log('🔍 [DEBUG] Starting comprehensive database debug...')
    
    // Current user
    const { data: currentUser } = await supabase.auth.getUser()
    console.log('👤 [DEBUG] Current auth user:', {
      id: currentUser?.user?.id,
      email: currentUser?.user?.email
    })
    
    if (!currentUser?.user?.id) {
      console.log('❌ [DEBUG] No authenticated user - stopping debug')
      return
    }
    
    // Check what tables exist
    console.log('📋 [DEBUG] Checking available tables...')
    
    // Try users table
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5)
    
    console.log('👥 [DEBUG] Users table:', {
      data: allUsers,
      error: usersError,
      count: allUsers?.length || 0
    })
    
    // Try organizations table
    const { data: allOrgs, error: orgsError } = await supabase
      .from('organizations')
      .select('*')
      .limit(5)
    
    console.log('🏢 [DEBUG] Organizations table:', {
      data: allOrgs,
      error: orgsError,
      count: allOrgs?.length || 0
    })
    
    // Find specific user
    const { data: specificUser, error: specificError } = await supabase
      .from('users')
      .select('*')
      .eq('id', currentUser.user.id)
      .single()
    
    console.log('🔍 [DEBUG] Current user in database:', {
      data: specificUser,
      error: specificError
    })
    
    // If user has organization_id, get that organization
    if (specificUser?.organization_id) {
      const { data: userOrg, error: userOrgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', specificUser.organization_id)
        .single()
      
      console.log('🏢 [DEBUG] User\'s organization:', {
        data: userOrg,
        error: userOrgError
      })
    }
    
    // Check email search
    if (currentUser.user.email) {
      const { data: emailUser, error: emailError } = await supabase
        .from('users')
        .select('*')
        .eq('email', currentUser.user.email)
        .single()
      
      console.log('📧 [DEBUG] User by email:', {
        email: currentUser.user.email,
        data: emailUser,
        error: emailError
      })
    }
    
    console.log('✅ [DEBUG] Database debug complete')
    
  } catch (error) {
    console.error('❌ [DEBUG] Debug failed:', error)
  }
}
