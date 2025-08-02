'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, signIn, signUp, signOut, createUserProfile } from '@/lib/supabase'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: string
  organizationId?: string
  organization?: {
    id: string
    name: string
    subscription_plan?: string
  }
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  loading: boolean
  resetInactivityTimer: () => void
}

interface RegisterData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  organizationName?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Constants for session management
const SESSION_TIMEOUT = 10 * 60 * 1000 // 10 minutes in milliseconds
const STORAGE_KEY = 'datacrm-auth-session'
const LAST_ACTIVITY_KEY = 'datacrm-last-activity'

// Activity events to track
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

// Simple fetch wrapper for API calls (using Supabase for demo)
const apiCall = async (endpoint: string) => {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  
  // For demo purposes, return mock data instead of making real API calls
  // In a real app, you'd make calls to your Supabase functions or other APIs
  if (!token && endpoint.includes('/auth/')) {
    throw new Error('Not authenticated')
  }
  
  // Mock API responses for demo
  await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
  
  if (endpoint.includes('/analytics')) {
    return { analytics: null } // Will fallback to mock data
  }
  
  if (endpoint.includes('/customers')) {
    return { customers: [] } // Will fallback to mock data
  }
  
  if (endpoint.includes('/campaigns')) {
    return { campaigns: [] } // Will fallback to mock data
  }
  
  return { data: null }
}

export { apiCall }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  // Save session to localStorage
  const saveSession = useCallback((userData: User, userToken: string) => {
    try {
      const sessionData = {
        user: userData,
        token: userToken,
        timestamp: Date.now()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData))
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString())
    } catch (error) {
      console.error('Error saving session:', error)
    }
  }, [])

  // Clear session from localStorage
  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(LAST_ACTIVITY_KEY)
    } catch (error) {
      console.error('Error clearing session:', error)
    }
  }, [])

  // Load session from localStorage
  const loadSession = useCallback(() => {
    try {
      const savedSession = localStorage.getItem(STORAGE_KEY)
      const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY)
      
      if (savedSession && lastActivity) {
        const sessionData = JSON.parse(savedSession)
        const lastActivityTime = parseInt(lastActivity)
        const now = Date.now()
        
        // Check if session is still valid (within timeout period)
        if (now - lastActivityTime < SESSION_TIMEOUT) {
          setUser(sessionData.user)
          setToken(sessionData.token)
          lastActivityRef.current = lastActivityTime
          return true
        } else {
          // Session expired, clear it
          clearSession()
        }
      }
    } catch (error) {
      console.error('Error loading session:', error)
      clearSession()
    }
    return false
  }, [clearSession])

  // Update last activity timestamp
  const updateLastActivity = useCallback(() => {
    const now = Date.now()
    lastActivityRef.current = now
    try {
      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString())
    } catch (error) {
      console.error('Error updating last activity:', error)
    }
  }, [])

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    // Clear existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }

    // Update activity timestamp
    updateLastActivity()

    // Set new timer
    inactivityTimerRef.current = setTimeout(() => {
      console.log('Session expired due to inactivity')
      // Force logout without calling the function to avoid circular dependency
      clearSession()
      setUser(null)
      setToken(null)
      window.location.href = '/login'
    }, SESSION_TIMEOUT)
  }, [updateLastActivity, clearSession])

  // Check session validity periodically  
  const checkSessionValidity = useCallback(() => {
    const lastActivity = parseInt(localStorage.getItem(LAST_ACTIVITY_KEY) || '0')
    const now = Date.now()
    
    if (user && now - lastActivity > SESSION_TIMEOUT) {
      console.log('Session expired during validity check')
      // Force logout without calling the function to avoid circular dependency
      clearSession()
      setUser(null)
      setToken(null)
      window.location.href = '/login'
    }
  }, [user, clearSession])

  useEffect(() => {
    // Check initial auth state
    const initializeAuth = async () => {
      try {
        // First try to load from localStorage
        const sessionLoaded = loadSession()
        
        if (!sessionLoaded) {
          // Fallback to Supabase session check
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            // Load user's organization on initialization
            const { getCurrentUserOrganization, isSuperAdmin } = await import('@/lib/supabase')
            
            const isSuper = await isSuperAdmin(session.user.email || '')
            let organization = null
            
            if (!isSuper) {
              const { data: orgData } = await getCurrentUserOrganization()
              organization = orgData
            }

            const userData: User = {
              id: session.user.id,
              email: session.user.email || '',
              firstName: session.user.user_metadata?.firstName || 'Demo',
              lastName: session.user.user_metadata?.lastName || 'User',
              role: isSuper ? 'super_admin' : 'admin',
              organizationId: organization?.id,
              organization: organization ? {
                id: organization.id,
                name: organization.name,
                subscription_plan: organization.subscription_plan
              } : undefined
            }
            setUser(userData)
            setToken(session.access_token)
            saveSession(userData, session.access_token)
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Load user's organization on auth state change
          const { getCurrentUserOrganization, isSuperAdmin } = await import('@/lib/supabase')
          
          const isSuper = await isSuperAdmin(session.user.email || '')
          let organization = null
          
          if (!isSuper) {
            const { data: orgData } = await getCurrentUserOrganization()
            organization = orgData
          }

          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            firstName: session.user.user_metadata?.firstName || 'Demo',
            lastName: session.user.user_metadata?.lastName || 'User',
            role: isSuper ? 'super_admin' : 'admin',
            organizationId: organization?.id,
            organization: organization ? {
              id: organization.id,
              name: organization.name,
              subscription_plan: organization.subscription_plan
            } : undefined
          }
          setUser(userData)
          setToken(session.access_token)
          saveSession(userData, session.access_token)
        } else {
          setUser(null)
          setToken(null)
          clearSession()
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, []) // Remove dependencies to prevent infinite loop

  // Set up activity tracking and inactivity timer
  useEffect(() => {
    if (user) {
      // Start inactivity timer
      resetInactivityTimer()

      // Add activity event listeners
      const handleActivity = () => {
        resetInactivityTimer()
      }

      ACTIVITY_EVENTS.forEach(event => {
        document.addEventListener(event, handleActivity, { passive: true })
      })

      // Periodic session validity check
      const validityCheckInterval = setInterval(checkSessionValidity, 60000) // Check every minute

      return () => {
        // Cleanup
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current)
        }
        clearInterval(validityCheckInterval)
        ACTIVITY_EVENTS.forEach(event => {
          document.removeEventListener(event, handleActivity)
        })
      }
    }
  }, [user, resetInactivityTimer, checkSessionValidity])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      // Test user without organization - should redirect to organization-required
      if (email === 'noorg@example.com') {
        const mockUser: User = {
          id: 'no-org-user-id',
          email: 'noorg@example.com',
          firstName: 'No',
          lastName: 'Organization',
          role: 'user'
          // No organization assigned
        }
        setUser(mockUser)
        setToken('no-org-token')
        saveSession(mockUser, 'no-org-token')
        router.push('/organization-required')
        return
      }
      
      // For demo purposes, allow demo@example.com with organization
      if (email === 'demo@example.com') {
        const mockUser: User = {
          id: 'demo-user-id',
          email: 'demo@example.com',
          firstName: 'Demo',
          lastName: 'User',
          role: 'admin',
          organizationId: 'demo-company',
          organization: {
            id: 'demo-company',
            name: 'Demo Company'
          }
        }
        setUser(mockUser)
        setToken('demo-token')
        saveSession(mockUser, 'demo-token')
        router.push('/dashboard')
        return
      }

      // Super Admin Demo Login
      if (email === 'testdatacrmpascal@gmail.com') {
        const mockUser: User = {
          id: 'super-admin-id',
          email: 'testdatacrmpascal@gmail.com',
          firstName: 'Super',
          lastName: 'Admin',
          role: 'super_admin',
          organizationId: 'system',
          organization: {
            id: 'system',
            name: 'System Administration'
          }
        }
        setUser(mockUser)
        setToken('super-admin-token')
        saveSession(mockUser, 'super-admin-token')
        router.push('/dashboard')
        return
      }

      // For real users, use Supabase
      const { data, error } = await signIn(email, password)
      if (error) throw error

      if (data.user) {
        // Load user's organization after successful login
        const { getCurrentUserOrganization, isSuperAdmin } = await import('@/lib/supabase')
        
        const isSuper = await isSuperAdmin(data.user.email || '')
        let organization = null
        
        if (!isSuper) {
          const { data: orgData } = await getCurrentUserOrganization()
          organization = orgData
        }

        const userData: User = {
          id: data.user.id,
          email: data.user.email || '',
          firstName: data.user.user_metadata?.firstName || 'User',
          lastName: data.user.user_metadata?.lastName || '',
          role: isSuper ? 'super_admin' : 'user',
          organizationId: organization?.id,
          organization: organization ? {
            id: organization.id,
            name: organization.name,
            subscription_plan: organization.subscription_plan
          } : undefined
        }
        
        setUser(userData)
        setToken(data.session?.access_token || null)
        if (data.session?.access_token) {
          saveSession(userData, data.session.access_token)
        }
        
        // Check if user has organization (except super admin)
        if (!isSuper && !organization) {
          router.push('/organization-required')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error: unknown) {
      console.error('Login error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setLoading(true)
      const { data: authData, error } = await signUp(data.email, data.password)
      if (error) throw error

      if (authData.user) {
        // Create user profile in our database - NO organization creation
        const userProfileData = {
          id: authData.user.id,
          email: authData.user.email || '',
          first_name: data.firstName,
          last_name: data.lastName,
          organization_id: undefined, // No organization assigned initially
          role: 'user' // Default role is 'user', not super_admin
        }

        const { error: profileError } = await createUserProfile(userProfileData)
        if (profileError) {
          console.error('Failed to create user profile:', profileError)
          throw new Error('Failed to create user profile: ' + profileError.message)
        }

        const userData: User = {
          id: authData.user.id,
          email: authData.user.email || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          role: 'user', // Default role
          organizationId: undefined // No organization initially
        }
        setUser(userData)
        setToken(authData.session?.access_token || null)
        if (authData.session?.access_token) {
          saveSession(userData, authData.session.access_token)
        }
        router.push('/dashboard')
      }
    } catch (error: unknown) {
      console.error('Registration error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const logout = useCallback(async () => {
    try {
      // Clear timers
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
      
      // Clear local session
      clearSession()
      setUser(null)
      setToken(null)
      
      // Sign out from Supabase (for real users)
      await signOut()
      
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Even if Supabase logout fails, clear local state
      clearSession()
      setUser(null)
      setToken(null)
      router.push('/login')
    }
  }, [clearSession, router])

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    resetInactivityTimer
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
