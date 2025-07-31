'use client'

import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import LoadingSpinner from '@/components/ui/loading-spinner'
import DashboardLayout from '@/components/dashboard/layout'
import DashboardOverview from '@/components/dashboard/overview'
import OrganizationGuard from '@/components/organization/organization-guard'
import { isSuperAdmin } from '@/lib/supabase'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [checkingRole, setCheckingRole] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Check if user is super admin and redirect accordingly
  useEffect(() => {
    const checkUserRole = async () => {
      if (user?.email && mounted) {
        try {
          const isSuper = await isSuperAdmin(user.email)
          if (isSuper) {
            // Redirect super admin to organizations overview
            router.push('/dashboard/admin/organizations')
            return
          }
        } catch (error) {
          console.error('Error checking user role:', error)
        }
        setCheckingRole(false)
      }
    }
    
    if (!loading && user?.email) {
      checkUserRole()
    }
  }, [user, loading, router, mounted])

  if (!mounted || loading || checkingRole) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <OrganizationGuard>
      <DashboardLayout>
        <DashboardOverview />
      </DashboardLayout>
    </OrganizationGuard>
  )
}
