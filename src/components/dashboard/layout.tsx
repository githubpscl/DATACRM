'use client'

import React, { ReactNode, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import UserDropdown from '@/components/ui/user-dropdown'
import SessionStatus from '@/components/ui/session-status'
import { useAuth } from '@/components/auth-provider'
import { isSuperAdmin, getUserRole } from '@/lib/supabase'
import { 
  Upload,
  Users,
  PenTool,
  GitBranch,
  Megaphone,
  Settings,
  Crown,
  Building2,
  Shield
} from 'lucide-react'

interface SubNavItem {
  name: string
  href: string
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  subItems: SubNavItem[]
}

const navigation: NavigationItem[] = [
  {
    name: 'Datenimport',
    href: '/dashboard/data-import',
    icon: Upload,
    subItems: [
      { name: 'Daten hinzufügen', href: '/dashboard/data-import' },
      { name: 'Komplett neue Daten importieren', href: '/dashboard/data-import/new' },
      { name: 'Automatisches synchronisieren', href: '/dashboard/data-import/auto' },
      { name: 'Übersichten & Statistiken', href: '/dashboard/data-import/stats' },
      { name: 'KI-Zusammenfassung', href: '/dashboard/data-import/ai-insights' }
    ]
  },
  {
    name: 'Datenmanagement',
    href: '/dashboard/customers',
    icon: Users,
    subItems: [
      { name: 'Alle Daten', href: '/dashboard/customers' },
      { name: 'Nach Segmenten filtern', href: '/dashboard/customers/segments' },
      { name: 'Kartenansicht nach Regionen', href: '/dashboard/customers/map' },
      { name: 'Deduplizierungs-Regeln', href: '/dashboard/customers/deduplication' }
    ]
  },
  {
    name: 'Content Builder',
    href: '/dashboard/content',
    icon: PenTool,
    subItems: [
      { name: 'Email Builder & Newsletter', href: '/dashboard/content' },
      { name: 'WhatsApp Studio', href: '/dashboard/content/whatsapp' },
      { name: 'SMS Builder', href: '/dashboard/content/sms' },
      { name: 'Templates & Personalisierung', href: '/dashboard/content/templates' }
    ]
  },
  {
    name: 'Customer Journeys',
    href: '/dashboard/journeys',
    icon: GitBranch,
    subItems: [
      { name: 'Übersichtsansicht', href: '/dashboard/journeys' },
      { name: 'Journey erstellen', href: '/dashboard/journeys/create' },
      { name: 'Journey bearbeiten', href: '/dashboard/journeys/edit' },
      { name: 'KI-Zusammenfassung', href: '/dashboard/journeys/ai-insights' }
    ]
  },
  {
    name: 'Kampagnen',
    href: '/dashboard/campaigns',
    icon: Megaphone,
    subItems: [
      { name: 'Übersichtsansicht', href: '/dashboard/campaigns' },
      { name: 'Kampagne erstellen', href: '/dashboard/campaigns/create' },
      { name: 'Kampagne bearbeiten', href: '/dashboard/campaigns/edit' },
      { name: 'KI-Zusammenfassung', href: '/dashboard/campaigns/ai-insights' }
    ]
  },
  {
    name: 'Einstellungen',
    href: '/dashboard/settings',
    icon: Settings,
    subItems: [
      { name: 'Übersicht', href: '/dashboard/settings' },
      { name: 'Profil', href: '/dashboard/settings/profile' },
      { name: 'Team & Berechtigungen', href: '/dashboard/settings/team' },
      { name: 'Organisationen', href: '/dashboard/settings/organizations' },
      { name: 'Benutzerverwaltung', href: '/dashboard/settings/users' },
      { name: 'Benachrichtigungen', href: '/dashboard/settings/notifications' },
      { name: 'Sicherheit', href: '/dashboard/settings/security' },
      { name: 'Integrationen', href: '/dashboard/settings/integrations' }
    ]
  }
]

// Super Admin Navigation - nur Admin-Funktionen
const superAdminNavigation: NavigationItem[] = [
  {
    name: 'Organisationen',
    href: '/dashboard/admin/organizations',
    icon: Building2,
    subItems: [
      { name: 'Alle Organisationen', href: '/dashboard/admin/organizations' },
      { name: 'Neue Organisation', href: '/dashboard/admin/organizations/new' }
    ]
  },
  {
    name: 'System-Verwaltung',
    href: '/dashboard/settings',
    icon: Shield,
    subItems: [
      { name: 'Alle Benutzer', href: '/dashboard/settings/users' },
      { name: 'System-Einstellungen', href: '/dashboard/settings/system' }
    ]
  },
  {
    name: 'Super Admin',
    href: '/dashboard/admin',
    icon: Crown,
    subItems: [
      { name: 'Dashboard', href: '/dashboard/admin' },
      { name: 'Statistiken', href: '/dashboard/admin/stats' }
    ]
  }
]

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, resetInactivityTimer } = useAuth()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isSuper, setIsSuper] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Reset activity timer on navigation
  useEffect(() => {
    if (user) {
      resetInactivityTimer()
    }
  }, [pathname, user, resetInactivityTimer])

  // Check user permissions
  useEffect(() => {
    const checkPermissions = async () => {
      if (!user?.email) {
        return
      }

      try {
        const isSuperAdminUser = await isSuperAdmin(user.email)
        setIsSuper(isSuperAdminUser)

        const roleResponse = await getUserRole(user.id)
        if (roleResponse.data) {
          setUserRole(roleResponse.data.role)
        }
      } catch (error) {
        console.error('Error checking permissions:', error)
      }
    }

    checkPermissions()
  }, [user])

  // Show loading while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Anmeldung wird überprüft...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting to login
  if (!user) {
    return null
  }

  // Wähle Navigation basierend auf Benutzerrolle
  const currentNavigation = isSuper ? superAdminNavigation : navigation
  
  // Filter navigation based on permissions
  const filteredNavigation = currentNavigation.filter(item => {
    if (item.name === 'Administration') {
      // Only show admin section to super admins and organization admins
      return isSuper || userRole === 'organization_admin'
    }
    return true
  })

  // Debug logging
  console.log('Current pathname:', pathname)

  // Normalize pathname by removing trailing slash
  const normalizedPathname = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname

  // Find active main navigation item
  const activeNavItem = filteredNavigation.find(item => 
    normalizedPathname === item.href || normalizedPathname.startsWith(item.href + '/')
  )

  console.log('Active nav item:', activeNavItem?.name)

  // Special handling for dashboard and analytics pages
  const isDashboardPage = normalizedPathname === '/dashboard'
  const isAnalyticsPage = normalizedPathname === '/dashboard/analytics'
  
  // Dashboard sub-items for when not in any main navigation section
  const dashboardSubItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Analytics/Statistiken', href: '/dashboard/analytics' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header Navigation */}
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        
        {/* Main Navigation (Oberraster) */}
        <div className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center">
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="text-xl font-bold text-gray-900 mr-8 hover:text-blue-600 transition-colors"
                >
                  DATACRM
                </button>
              </div>

              {/* Main Navigation Items */}
              <nav className="flex space-x-8 flex-1">
                {filteredNavigation.map((item) => {
                  const isActive = normalizedPathname === item.href || normalizedPathname.startsWith(item.href + '/')
                  const Icon = item.icon

                  return (
                    <button
                      key={item.name}
                      onClick={() => router.push(item.href)}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </button>
                  )
                })}
              </nav>

              {/* User Actions */}
              <div className="flex items-center space-x-4">
                <UserDropdown />
              </div>
            </div>
          </div>
        </div>

        {/* Sub Navigation (Unterraster) */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-12">
              <nav className="flex space-x-6">
                {/* Show dashboard sub-items if on dashboard/analytics pages or no active nav item */}
                {(isDashboardPage || isAnalyticsPage || !activeNavItem) && 
                  dashboardSubItems.map((subItem) => {
                    const isActiveSubItem = normalizedPathname === subItem.href
                    return (
                      <button
                        key={subItem.name}
                        onClick={() => router.push(subItem.href)}
                        className={`transition-colors px-3 py-2 rounded-md ${
                          isActiveSubItem
                            ? 'text-blue-700 font-semibold underline decoration-blue-700 decoration-2 text-xl'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 text-sm'
                        }`}
                      >
                        {subItem.name}
                      </button>
                    )
                  })
                }
                
                {/* Show navigation sub-items if in a main navigation section */}
                {activeNavItem && !isDashboardPage && !isAnalyticsPage &&
                  activeNavItem.subItems.map((subItem) => {
                    const isActiveSubItem = normalizedPathname === subItem.href
                    return (
                      <button
                        key={subItem.name}
                        onClick={() => router.push(subItem.href)}
                        className={`transition-colors px-3 py-2 rounded-md ${
                          isActiveSubItem
                            ? 'text-blue-700 font-semibold underline decoration-blue-700 decoration-2 text-xl'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 text-sm'
                        }`}
                      >
                        {subItem.name}
                      </button>
                    )
                  })
                }
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Session Status Component */}
      <SessionStatus />
    </div>
  )
}
