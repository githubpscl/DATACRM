'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { 
  User,
  Settings,
  LogOut,
  Bell,
  HelpCircle,
  Palette
} from 'lucide-react'

interface UserDropdownProps {
  userName?: string
  userEmail?: string
}

export default function UserDropdown({ userName = "Max Mustermann", userEmail = "max@example.com" }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { logout } = useAuth()
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSignOut = async () => {
    setIsOpen(false)
    await logout()
  }

  const handleNavigation = (path: string) => {
    setIsOpen(false)
    router.push(path)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105"
      >
        {getInitials(userName)}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
          {/* User Info */}
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full text-sm font-medium">
                {getInitials(userName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userEmail}
                </p>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => handleNavigation('/dashboard/settings')}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <Settings className="mr-3 h-4 w-4 text-gray-400" />
              Einstellungen
            </button>

            <button
              onClick={() => handleNavigation('/dashboard/settings/profile')}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <User className="mr-3 h-4 w-4 text-gray-400" />
              Profil bearbeiten
            </button>

            <button
              onClick={() => handleNavigation('/dashboard/settings/notifications')}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <Bell className="mr-3 h-4 w-4 text-gray-400" />
              Benachrichtigungen
            </button>

            <button
              onClick={() => handleNavigation('/dashboard/settings/appearance')}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <Palette className="mr-3 h-4 w-4 text-gray-400" />
              Darstellung
            </button>

            <div className="border-t border-gray-100 my-2"></div>

            <button
              onClick={() => handleNavigation('/help')}
              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <HelpCircle className="mr-3 h-4 w-4 text-gray-400" />
              Hilfe & Support
            </button>

            <div className="border-t border-gray-100 my-2"></div>

            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4 text-red-500" />
              Abmelden
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
