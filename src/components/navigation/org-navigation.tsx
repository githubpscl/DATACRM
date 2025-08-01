'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Building2, Crown } from 'lucide-react'

interface OrgNavigationProps {
  className?: string
}

export default function OrgNavigation({ className = '' }: OrgNavigationProps) {
  const { user, loading } = useAuth()
  const [isSuper, setIsSuper] = useState(false)

  useEffect(() => {
    if (!user) return

    // Check if user is super admin
    const isSuperAdmin = user.role === 'super_admin'
    setIsSuper(isSuperAdmin)
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
  if (isSuper) {
    return (
      <div className={`flex items-center ${className}`}>
        <Crown className="h-8 w-8 text-yellow-600" />
        <span className="ml-2 text-xl font-bold text-gray-900">DataCRM</span>
      </div>
    )
  }

  // Show organization name for regular users
  if (user?.organization?.name) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="flex items-center justify-center h-8 w-8 bg-blue-100 rounded-lg">
          <span className="text-sm font-bold text-blue-600">
            {user.organization.name.substring(0, 2).toUpperCase()}
          </span>
        </div>
        <span className="ml-2 text-xl font-bold text-gray-900">{user.organization.name}</span>
      </div>
    )
  }

  // Fallback to DataCRM with building icon
  return (
    <div className={`flex items-center ${className}`}>
      <Building2 className="h-8 w-8 text-blue-600" />
      <span className="ml-2 text-xl font-bold text-gray-900">DataCRM</span>
    </div>
  )
}
