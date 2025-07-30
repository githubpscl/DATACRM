'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { isSuperAdmin, getUserRole } from '@/lib/supabase'
import { Shield, Users, Settings, Building2, UserCheck } from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isSuper, setIsSuper] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      if (!user?.email) {
        router.push('/dashboard')
        return
      }

      try {
        const isSuperAdminUser = await isSuperAdmin(user.email)
        setIsSuper(isSuperAdminUser)

        const roleResponse = await getUserRole(user.id)
        if (roleResponse.data) {
          setUserRole(roleResponse.data.role)
        }

        // Redirect if user doesn't have admin access
        if (!isSuperAdminUser && roleResponse.data?.role !== 'organization_admin') {
          router.push('/dashboard')
          return
        }
      } catch (error) {
        console.error('Error checking permissions:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    checkPermissions()
  }, [user, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const adminCards = [
    {
      title: 'Organisationen verwalten',
      description: 'Neue Organisationen erstellen und Administratoren zuweisen',
      icon: Building2,
      href: '/dashboard/admin/organizations',
      color: 'bg-blue-500',
      available: isSuper // Only super admins can manage organizations
    },
    {
      title: 'Benutzerberechtigungen',
      description: 'Rollen zuweisen und Berechtigungen verwalten',
      icon: UserCheck,
      href: '/dashboard/admin/permissions',
      color: 'bg-green-500',
      available: true // Both super admins and org admins can manage permissions
    },
    {
      title: 'System-Einstellungen',
      description: 'Globale Einstellungen und Konfiguration',
      icon: Settings,
      href: '/dashboard/admin/settings',
      color: 'bg-purple-500',
      available: isSuper // Only super admins can access system settings
    }
  ]

  const availableCards = adminCards.filter(card => card.available)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
          </div>
          <p className="text-gray-600">
            {isSuper 
              ? 'Super Administrator Dashboard - Vollzugriff auf alle Verwaltungsfunktionen'
              : 'Organisation Administrator Dashboard - Verwaltung von Benutzern und Berechtigungen'
            }
          </p>
          
          {/* User Info */}
          <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Angemeldet als:</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
              <div>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                  isSuper 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {isSuper ? 'Super Administrator' : 'Organisation Administrator'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableCards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.title}
                onClick={() => router.push(card.href)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${card.color} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {card.description}
                </p>
                <div className="mt-4 flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                  Öffnen
                  <svg className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-600">Benutzer gesamt</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Building2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-600">Organisationen</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <UserCheck className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-600">Aktive Admins</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Shield className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{isSuper ? '1' : '0'}</p>
              <p className="text-sm text-gray-600">Super Admin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
