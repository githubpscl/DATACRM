'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { getCurrentUserOrganization, isSuperAdmin } from '@/lib/supabase'
import { Building2 } from 'lucide-react'

interface Organization {
  id: string
  name: string
  description?: string
}

interface OrgNavigationProps {
  className?: string
}

export default function OrgNavigation({ className = '' }: OrgNavigationProps) {
  const { user } = useAuth()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isSuper, setIsSuper] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrganization = async () => {
      if (!user) return

      try {
        // Check if user is super admin
        const superAdmin = await isSuperAdmin(user.email || '')
        setIsSuper(superAdmin)

        // If not super admin, load user's organization
        if (!superAdmin) {
          const { data: org } = await getCurrentUserOrganization()
          setOrganization(org)
        }
      } catch (error) {
        console.error('Error loading organization:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrganization()
  }, [user])

  if (loading) {
    return (
      <div className={`flex items-center ${className}`}>
        <Building2 className="h-8 w-8 text-gray-400" />
        <span className="ml-2 text-xl font-bold text-gray-400">Lädt...</span>
      </div>
    )
  }

  // Show DataCRM for super admin or if no organization
  if (isSuper || !organization) {
    return (
      <div className={`flex items-center ${className}`}>
        <Building2 className="h-8 w-8 text-blue-600" />
        <span className="ml-2 text-xl font-bold text-gray-900">DataCRM</span>
      </div>
    )
  }

  // Show organization name for regular users
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex items-center justify-center h-8 w-8 bg-blue-100 rounded-lg">
        <span className="text-sm font-bold text-blue-600">
          {organization.name.substring(0, 2).toUpperCase()}
        </span>
      </div>
      <span className="ml-2 text-xl font-bold text-gray-900">{organization.name}</span>
    </div>
  )
}
