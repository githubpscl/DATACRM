import { supabase } from './supabase'

// Einfache direkte Datenbankabfrage für debugging
export const checkUserOrganizationId = async (email: string) => {
  try {
    console.log('🔍 [DB CHECK] Starting simple database check for email:', email)
    console.log('🔍 [DB CHECK] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    
    // Direkte Abfrage der users-Tabelle mit Email
    console.log('🔍 [DB CHECK] Executing query...')
    const { data, error } = await supabase
      .from('users')
      .select('id, email, organization_id, role, is_active')
      .eq('email', email)
      .single()
    
    console.log('🔍 [DB CHECK] Query result:', {
      data: data,
      error: error,
      hasData: !!data,
      organizationId: data?.organization_id,
      errorMessage: error?.message,
      errorCode: error?.code,
      errorDetails: error?.details
    })
    
    if (error) {
      console.error('❌ [DB CHECK] Database error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      return { data: null, error }
    }
    
    if (!data) {
      console.log('❌ [DB CHECK] No user found with email:', email)
      return { data: null, error: 'User not found' }
    }
    
    console.log('✅ [DB CHECK] User found:', {
      id: data.id,
      email: data.email,
      organization_id: data.organization_id,
      role: data.role,
      is_active: data.is_active
    })
    
    return { data, error: null }
    
  } catch (error) {
    console.error('❌ [DB CHECK] Exception details:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return { data: null, error }
  }
}

// Zusätzlich: Einfache Test-Abfrage an die Datenbank
export const testDatabaseConnection = async () => {
  try {
    console.log('🔍 [DB TEST] Testing basic database connection...')
    
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1)
    
    console.log('🔍 [DB TEST] Connection test result:', {
      data,
      error,
      connected: !error
    })
    
    return !error
    
  } catch (error) {
    console.error('❌ [DB TEST] Connection test failed:', error)
    return false
  }
}
