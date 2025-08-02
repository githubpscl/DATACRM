// Load environment variables
require('dotenv').config({ path: '.env.local' })

import { checkUserOrganizationId, testDatabaseConnection } from './src/lib/simple-db-check'

console.log('🔍 Starting direct database test...')
console.log('🔍 Environment check:', {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
})

async function testUser() {
  try {
    // Test connection first
    console.log('1. Testing database connection...')
    const isConnected = await testDatabaseConnection()
    console.log('   Connection result:', isConnected)
    
    // Check specific user
    console.log('2. Checking user organization_id...')
    const result = await checkUserOrganizationId('orgkontroller@gmail.com')
    console.log('   User check result:', result)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

testUser()
