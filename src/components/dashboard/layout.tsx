'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  Database,
  Workflow,
  Target,
  FileText,
  Menu,
  X,
  LogOut,
  User,
  Building,
  Bell,
  ChevronDown
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview & Analytics',
    hasDropdown: true,
    submenu: [
      { name: 'Overview', href: '/dashboard', description: 'Main dashboard' },
      { name: 'Analytics', href: '/dashboard/analytics', description: 'Performance insights' }
    ]
  },
  {
    name: 'Data Import',
    href: '/dashboard/data-import',
    icon: Database,
    description: 'Import & manage data'
  },
  {
    name: 'Customers',
    href: '/dashboard/customers',
    icon: Users,
    description: 'Customer database'
  },
  {
    name: 'Campaigns',
    href: '/dashboard/campaigns',
    icon: Target,
    description: 'Marketing campaigns'
  },
  {
    name: 'Content',
    href: '/dashboard/content',
    icon: FileText,
    description: 'Email, SMS, WhatsApp'
  },
  {
    name: 'Journeys',
    href: '/dashboard/journeys',
    icon: Workflow,
    description: 'Customer automation'
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Account settings'
  }
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dashboardDropdownOpen, setDashboardDropdownOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const isActiveLink = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/dashboard/analytics'
    }
    return pathname === href
  }

  const getCurrentPageName = () => {
    const currentItem = navigation.find(item => {
      if (item.hasDropdown && item.submenu) {
        return item.submenu.some(sub => sub.href === pathname)
      }
      return item.href === pathname
    })
    
    if (currentItem?.hasDropdown && currentItem.submenu) {
      const subItem = currentItem.submenu.find(sub => sub.href === pathname)
      return subItem?.name || 'Dashboard'
    }
    
    return currentItem?.name || 'Dashboard'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <LayoutDashboard className="h-8 w-8 text-blue-600" />
                  <span className="text-xl font-bold text-gray-900">DataCRM</span>
                  <Badge variant="secondary" className="ml-2">Enterprise</Badge>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:ml-8 md:flex md:space-x-1">
                {navigation.map((item) => {
                  const isActive = isActiveLink(item.href)
                  
                  if (item.hasDropdown) {
                    return (
                      <div key={item.name} className="relative">
                        <button
                          onClick={() => setDashboardDropdownOpen(!dashboardDropdownOpen)}
                          className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            isActive
                              ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.name}
                          <ChevronDown className="ml-1 h-4 w-4" />
                        </button>
                        
                        {dashboardDropdownOpen && (
                          <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                            {item.submenu?.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                onClick={() => setDashboardDropdownOpen(false)}
                                className={`block px-4 py-2 text-sm hover:bg-gray-100 ${
                                  pathname === subItem.href ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                }`}
                              >
                                {subItem.name}
                                <div className="text-xs text-gray-500">{subItem.description}</div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Right side - User menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                <Bell className="h-5 w-5" />
              </Button>

              {/* User menu */}
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden md:inline-flex">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const isActive = isActiveLink(item.href)
                
                if (item.hasDropdown && item.submenu) {
                  return (
                    <div key={item.name}>
                      <div className="px-3 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
                        {item.name}
                      </div>
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block px-6 py-2 text-sm ${
                            pathname === subItem.href
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
              
              {/* Mobile user actions */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center px-3 py-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start px-3 py-2 text-gray-700"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {getCurrentPageName()}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {navigation.find(item => {
                if (item.hasDropdown && item.submenu) {
                  return item.submenu.some(sub => sub.href === pathname)
                }
                return item.href === pathname
              })?.description || 'Welcome to your dashboard'}
            </p>
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
