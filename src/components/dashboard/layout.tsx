'use client'

import React, { ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { 
  Upload,
  Users,
  PenTool,
  GitBranch,
  Megaphone,
  LogOut
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
  }
]

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Find active main navigation item
  const activeNavItem = navigation.find(item => 
    pathname === item.href || pathname.startsWith(item.href + '/')
  )

  // Special handling for dashboard and analytics pages
  const isDashboardPage = pathname === '/dashboard'
  const isAnalyticsPage = pathname === '/dashboard/analytics'
  
  // Dashboard sub-items for when not in any main navigation section
  const dashboardSubItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Analytics/Statistiken', href: '/dashboard/analytics' }
  ]

  const handleSignOut = async () => {
    await logout()
  }

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
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
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
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Abmelden
                </Button>
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
                    const isActiveSubItem = pathname === subItem.href
                    return (
                      <button
                        key={subItem.name}
                        onClick={() => router.push(subItem.href)}
                        className={`text-sm transition-colors px-3 py-2 rounded-md ${
                          isActiveSubItem
                            ? 'text-blue-700 bg-blue-100 font-extrabold border-b-2 border-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-normal'
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
                    const isActiveSubItem = pathname === subItem.href
                    return (
                      <button
                        key={subItem.name}
                        onClick={() => router.push(subItem.href)}
                        className={`text-sm transition-colors px-3 py-2 rounded-md ${
                          isActiveSubItem
                            ? 'text-blue-700 bg-blue-100 font-extrabold border-b-2 border-blue-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-normal'
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
    </div>
  )
}
