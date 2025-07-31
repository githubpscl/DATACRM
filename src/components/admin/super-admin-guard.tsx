'use client'

import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { isSuperAdmin } from '@/lib/supabase'

interface SuperAdminGuardProps {
  children: React.ReactNode
}

export default function SuperAdminGuard({ children }: SuperAdminGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return

      if (!user) {
        router.push('/login')
        return
      }

      try {
        console.log('SuperAdminGuard: Checking access for', user.email)
        const isSuper = await isSuperAdmin(user.email)
        
        if (!isSuper) {
          console.log('SuperAdminGuard: Access denied, redirecting to dashboard')
          router.push('/dashboard')
          return
        }

        console.log('SuperAdminGuard: Access granted')
        setIsAuthorized(true)
      } catch (error) {
        console.error('SuperAdminGuard: Error checking access:', error)
        router.push('/dashboard')
      } finally {
        setChecking(false)
      }
    }

    checkAccess()
  }, [user, loading, router])

  if (loading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
