'use client'

import { useState, useEffect } from 'react'
import { getCurrentUserOrganization, isCurrentUserSuperAdmin, type Organization } from '@/lib/supabase'
import Link from 'next/link'

interface OrgNavigationProps {
  className?: string
}

export default function OrgNavigation({ className = '' }: OrgNavigationProps) {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrganizationData = async () => {
      try {
        setLoading(true)
        
        // Check if user is super admin
        const { data: superAdminStatus } = await isCurrentUserSuperAdmin()
        setIsSuperAdmin(superAdminStatus)
        
        // If not super admin, get organization
        if (!superAdminStatus) {
          const { data: orgData } = await getCurrentUserOrganization()
          setOrganization(orgData)
        }
      } catch (error) {
        console.error('Error loading organization data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrganizationData()
  }, [])

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 w-32 bg-gray-300 rounded"></div>
      </div>
    )
  }

  // For super admin, show DATACRM
  if (isSuperAdmin) {
    return (
      <Link href="/" className={`text-xl font-bold text-gray-900 hover:text-gray-700 ${className}`}>
        DATACRM
        <span className="text-xs text-red-600 ml-2">SUPER ADMIN</span>
      </Link>
    )
  }

  // For organization users, show organization name
  if (organization) {
    return (
      <Link href="/dashboard" className={`text-xl font-bold text-gray-900 hover:text-gray-700 ${className}`}>
        {organization.name}
      </Link>
    )
  }

  // Fallback to DATACRM if no organization
  return (
    <Link href="/" className={`text-xl font-bold text-gray-900 hover:text-gray-700 ${className}`}>
      DATACRM
    </Link>
  )
}
