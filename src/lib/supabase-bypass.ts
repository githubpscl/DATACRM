import { supabase, Organization } from './supabase'

// BYPASS-VERSION - Überspringt Organisation temporär für System-Start
export const getCurrentUserOrganizationBypass = async (): Promise<{ data: Organization | null, error: unknown }> => {
  try {
    console.log('🚀 [BYPASS] ===== STARTING BYPASS MODE =====')
    console.log('🚀 [BYPASS] Skipping organization queries to prevent hanging')
    console.log('🚀 [BYPASS] System will start without organization data')
    
    // Only check if user is authenticated
    const { data: currentUser, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('❌ [BYPASS] User auth error:', userError)
      return { data: null, error: userError }
    }
    
    if (!currentUser?.user?.id) {
      console.error('❌ [BYPASS] No authenticated user')
      return { data: null, error: 'No authenticated user' }
    }
    
    console.log('👤 [BYPASS] User authenticated successfully:', {
      id: currentUser.user.id,
      email: currentUser.user.email
    })
    console.log('⚠️ [BYPASS] ORGANIZATION QUERIES BYPASSED - SYSTEM WILL START WITHOUT ORG')
    console.log('🚀 [BYPASS] ===== BYPASS MODE COMPLETE =====')
    
    // Return null for organization to allow system to start
    return { data: null, error: null }
    
  } catch (error) {
    console.error('❌ [BYPASS] Exception in bypass mode:', error)
    return { data: null, error }
  }
}

// Super Admin Check - Simplified without hanging
export const checkSuperAdminBypass = async (userId: string): Promise<boolean> => {
  try {
    console.log('🔧 [BYPASS] Checking super admin status...', userId)
    
    // Very quick timeout for admin check
    const adminPromise = supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()
    
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Admin check timeout')), 2000)
    })
    
    const result = await Promise.race([adminPromise, timeout]) as any
    const { data } = result
    
    const isSuperAdmin = data?.role === 'super_admin'
    console.log('🔧 [BYPASS] Super admin result:', isSuperAdmin)
    
    return isSuperAdmin
    
  } catch (error) {
    console.error('❌ [BYPASS] Admin check failed:', error)
    return false // Safe fallback
  }
}
