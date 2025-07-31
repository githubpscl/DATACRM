'use client'

import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getCurrentUserOrganization } from '@/lib/supabase'

interface OrganizationGuardProps {
  children: React.ReactNode
}

export default function OrganizationGuard({ children }: OrganizationGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [hasOrganization, setHasOrganization] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkOrganization = async () => {
      if (loading) return

      if (!user) {
        router.push('/login')
        return
      }

      try {
        console.log('OrganizationGuard: Checking organization for', user.email)
        const result = await getCurrentUserOrganization()
        
        const hasOrg = result.data?.organization_id !== null
        console.log('OrganizationGuard: Has organization:', hasOrg)
        
        if (!hasOrg) {
          console.log('OrganizationGuard: No organization, redirecting to organization-required')
          router.push('/organization-required')
          return
        }

        console.log('OrganizationGuard: Organization check passed')
        setHasOrganization(true)
      } catch (error) {
        console.error('OrganizationGuard: Error checking organization:', error)
        router.push('/organization-required')
      } finally {
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
