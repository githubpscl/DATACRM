'use client'

import { ReactNode, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard,
  Database,
  Upload,
  Users,
  PenTool,
  GitBranch,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'

interface NavigationItem {
  name: string
  href: string
  icon: any
  subItems?: { name: string; href: string }[]
}

const navigation: NavigationItem[] = [
  {
    name: 'Übersicht',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Datenimport',
    href: '/dashboard/data-import',
    icon: Upload,
    subItems: [
      { name: 'CSV Import', href: '/dashboard/data-import' },
      { name: 'API Import', href: '/dashboard/data-import/api' },
      { name: 'Manuell', href: '/dashboard/data-import/manual' }
    ]
  },
  {
    name: 'Datenmanagement',
    href: '/dashboard/customers',
    icon: Users,
    subItems: [
      { name: 'Kunden', href: '/dashboard/customers' },
      { name: 'Segmente', href: '/dashboard/customers/segments' },
      { name: 'Import History', href: '/dashboard/customers/history' }
    ]
  },
  {
    name: 'Content Builder',
    href: '/dashboard/content',
    icon: PenTool,
    subItems: [
      { name: 'E-Mail', href: '/dashboard/content' },
      { name: 'WhatsApp', href: '/dashboard/content/whatsapp' },
      { name: 'SMS', href: '/dashboard/content/sms' }
    ]
  },
  {
    name: 'Customer Journeys',
    href: '/dashboard/journeys',
    icon: GitBranch,
    subItems: [
      { name: 'Übersicht', href: '/dashboard/journeys' },
      { name: 'Erstellen', href: '/dashboard/journeys/create' },
      { name: 'Vorlagen', href: '/dashboard/journeys/templates' }
    ]
  },
  {
    name: 'Kampagnen',
    href: '/dashboard/campaigns',
    icon: Megaphone,
    subItems: [
      { name: 'Aktive Kampagnen', href: '/dashboard/campaigns' },
      { name: 'Archiv', href: '/dashboard/campaigns/archive' },
      { name: 'Analytics', href: '/dashboard/analytics' }
    ]
  },
  {
    name: 'Einstellungen',
    href: '/dashboard/settings',
    icon: Settings,
    subItems: [
      { name: 'Profil', href: '/dashboard/settings' },
      { name: 'Team', href: '/dashboard/settings/team' },
      { name: 'Integrationen', href: '/dashboard/settings/integrations' }
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Find active navigation item and its sub-navigation
  const activeNavItem = navigation.find(item => 
    pathname === item.href || pathname.startsWith(item.href + '/')
  )

  const handleSignOut = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">DATACRM</h1>
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon

              return (
                <div key={item.name}>
                  <button
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </button>
                </div>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Abmelden
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation bar */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            {/* Mobile menu button */}
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Page title */}
            <div className="flex-1 lg:flex-none">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeNavItem?.name || 'Dashboard'}
              </h2>
            </div>
          </div>

          {/* Sub-navigation */}
          {activeNavItem?.subItems && (
            <div className="border-t border-gray-200 bg-gray-50">
              <div className="px-6 py-3">
                <nav className="flex space-x-6">
                  {activeNavItem.subItems.map((subItem) => {
                    const isActiveSubItem = pathname === subItem.href
                    return (
                      <button
                        key={subItem.name}
                        onClick={() => router.push(subItem.href)}
                        className={`text-sm font-medium transition-colors ${
                          isActiveSubItem
                            ? 'text-blue-700 border-b-2 border-blue-700 pb-2'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {subItem.name}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>
          )}
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
