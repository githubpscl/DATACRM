'use client'

import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface OrganizationGuardProps {
  children: React.ReactNode
}

export default function OrganizationGuard({ children }: OrganizationGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [hasOrganization, setHasOrganization] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkOrganization = () => {
      if (loading) {
        console.log('🛡️ [ORG GUARD] Auth still loading, waiting...')
        return
      }

      if (!user) {
        console.log('❌ [ORG GUARD] No user found, redirecting to login')
        router.push('/login')
        return
      }

      try {
        console.log('🛡️ [ORG GUARD] Checking organization for user:', user.email)
        console.log('🛡️ [ORG GUARD] User object:', {
          id: user.id,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          organization: user.organization
        })
        
        // Check if user has organization from the auth context
        // Super admin always has access, regular users need organizationId
        const hasOrg = user.role === 'super_admin' || (user.organizationId && user.organization?.id)
        console.log('🛡️ [ORG GUARD] Organization check result:', {
          isSuperAdmin: user.role === 'super_admin',
          hasOrganizationId: !!user.organizationId,
          hasOrganizationObject: !!user.organization?.id,
          finalResult: hasOrg
        })
        
        if (!hasOrg) {
          console.log('❌ [ORG GUARD] No organization access, redirecting to organization-required')
          router.push('/organization-required')
          return
        }

        console.log('✅ [ORG GUARD] Organization check passed, allowing access')
        setHasOrganization(true)
      } catch (error) {
        console.error('❌ [ORG GUARD] Error checking organization:', error)
        router.push('/organization-required')
      } finally {
        console.log('🛡️ [ORG GUARD] Check complete, setting checking to false')
        setChecking(false)
      }
    }

    checkOrganization()
  }, [user, loading, router])

  if (loading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!hasOrganization) {
    return null
  }

  return <>{children}</>
}
