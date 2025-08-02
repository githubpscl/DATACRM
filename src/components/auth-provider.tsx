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
        console.log('🚀 [AUTH INIT] Starting authentication initialization')
        
        // First try to load from localStorage
        const sessionLoaded = loadSession()
        console.log(`💾 [AUTH INIT] LocalStorage session loaded: ${sessionLoaded}`)
        
        if (!sessionLoaded) {
          // Fallback to Supabase session check
          console.log('🔍 [AUTH INIT] Checking Supabase session...')
          const { data: { session } } = await supabase.auth.getSession()
          console.log('🔍 [AUTH INIT] Supabase session result:', {
            hasSession: !!session,
            hasUser: !!session?.user,
            userEmail: session?.user?.email
          })
          
          if (session?.user) {
            // Load user's organization and check admin status
            const { getCurrentUserOrganization, isSuperAdmin } = await import('@/lib/supabase')
            
            // Check if user is super admin first
            console.log('👑 [AUTH INIT] Checking super admin status...')
            const isSuper = await isSuperAdmin(session.user.email || '')
            console.log(`👑 [AUTH INIT] Super admin result: ${isSuper}`)
            
            let organization = null
            let userRole = 'user'
            
            if (isSuper) {
              // Super admin gets system organization and super_admin role
              console.log('👑 [AUTH INIT] Setting up super admin user')
              userRole = 'super_admin'
              organization = {
                id: 'system',
                name: 'System Administration'
              }
            } else {
              // Regular user - check for organization
              console.log('🏢 [AUTH INIT] Checking organization for regular user...')
              const orgResult = await getCurrentUserOrganization()
              console.log('🏢 [AUTH INIT] Organization result:', {
                data: orgResult.data,
                error: orgResult.error
              })
              
              organization = orgResult.data
              
              if (organization) {
                // User has organization - set role to admin
                console.log('✅ [AUTH INIT] User has organization, setting admin role')
                userRole = 'admin'
              } else {
                console.log('❌ [AUTH INIT] User has no organization')
              }
              // If no organization, role stays 'user'
            }

            const userData: User = {
              id: session.user.id,
              email: session.user.email || '',
              firstName: session.user.user_metadata?.firstName || 'Demo',
              lastName: session.user.user_metadata?.lastName || 'User',
              role: userRole,
              organizationId: organization?.id,
              organization: organization ? {
                id: organization.id,
                name: organization.name,
                subscription_plan: organization.subscription_plan
              } : undefined
            }
            
            console.log('👤 [AUTH INIT] Final user data set:', userData)
            setUser(userData)
            setToken(session.access_token)
            saveSession(userData, session.access_token)
          } else {
            console.log('❌ [AUTH INIT] No valid session found')
          }
        }
      } catch (error) {
        console.error('❌ [AUTH INIT] Error initializing auth:', error)
      } finally {
        console.log('✅ [AUTH INIT] Authentication initialization complete')
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔄 [AUTH STATE] Auth state changed - Event: ${event}`)
        console.log('🔄 [AUTH STATE] Session data:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email
        })
        
        if (session?.user) {
          // Load user's organization and check admin status for all users
          const { getCurrentUserOrganization, isSuperAdmin } = await import('@/lib/supabase')
          
          // First check for organization (most users will have one)
          console.log('🏢 [AUTH STATE] Checking organization first...')
          
          // Add comprehensive debug
          const { debugDatabase } = await import('@/lib/supabase-debug')
          await debugDatabase()
          
          let orgResult = await getCurrentUserOrganization()
          console.log('🏢 [AUTH STATE] Organization result:', {
            data: orgResult.data,
            error: orgResult.error
          })
          
          // If main method fails, try simple fallback
          if (orgResult.error || !orgResult.data) {
            console.log('🔄 [AUTH STATE] Main method failed, trying simple fallback...')
            const { getOrganizationSimple } = await import('@/lib/supabase-simple')
            const simpleResult = await getOrganizationSimple()
            console.log('🔄 [AUTH STATE] Simple fallback result:', {
              data: simpleResult.data,
              error: simpleResult.error
            })
            
            if (simpleResult.data && !simpleResult.error) {
              orgResult = simpleResult
            }
          }
          
          let organization = orgResult.data
          let userRole = 'user'
          
          if (organization) {
            // User has organization - set role to admin
            console.log('✅ [AUTH STATE] User has organization, setting admin role')
            userRole = 'admin'
          } else {
            // No organization found - check if user is super admin
            console.log('❌ [AUTH STATE] User has no organization, checking super admin status...')
            const isSuper = await isSuperAdmin(session.user.email || '')
            console.log(`👑 [AUTH STATE] Super admin result: ${isSuper}`)
            
            if (isSuper) {
              // Super admin gets system organization and super_admin role
              console.log('👑 [AUTH STATE] Setting up super admin user')
              userRole = 'super_admin'
              organization = {
                id: 'system',
                name: 'System Administration',
                is_active: true
              }
            } else {
              console.log('❌ [AUTH STATE] User has no organization and is not super admin')
            }
          }

          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            firstName: session.user.user_metadata?.firstName || 'Demo',
            lastName: session.user.user_metadata?.lastName || 'User',
            role: userRole,
            organizationId: organization?.id,
            organization: organization ? {
              id: organization.id,
              name: organization.name,
              subscription_plan: organization.subscription_plan
            } : undefined
          }
          
          console.log('👤 [AUTH STATE] Final user data set:', userData)
          setUser(userData)
          setToken(session.access_token)
          saveSession(userData, session.access_token)
        } else {
          console.log('❌ [AUTH STATE] No session, clearing user data')
          setUser(null)
          setToken(null)
          clearSession()
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intentionally empty to prevent infinite loop

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
      
      // For demo purposes - keep these test users for development
      // TODO: Remove these in production
      if (email === 'noorg@example.com') {
        console.log('🎭 [AUTH] Mock user login: noorg@example.com')
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
        console.log('🎭 [AUTH] Mock user set, redirecting to organization-required')
        router.push('/organization-required')
        return
      }
      
      if (email === 'demo@example.com') {
        console.log('🎭 [AUTH] Mock user login: demo@example.com')
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
        console.log('🎭 [AUTH] Mock user set with organization:', mockUser.organization)
        router.push('/dashboard')
        return
      }

      // For all users (including real Supabase users), use generalized logic
      console.log('🔐 [AUTH] Starting Supabase login for:', email)
      const { data, error } = await signIn(email, password)
      if (error) {
        console.error('❌ [AUTH] Supabase login error:', error)
        throw error
      }

      console.log('✅ [AUTH] Supabase login successful:', {
        userId: data.user?.id,
        email: data.user?.email,
        hasSession: !!data.session
      })

      if (data.user) {
        // Load user's organization first (most efficient for regular users)
        const { getCurrentUserOrganization, isSuperAdmin } = await import('@/lib/supabase')
        
        // Check user's organization first
        console.log('🏢 [AUTH] Checking user organization...')
        let orgResult = await getCurrentUserOrganization()
        console.log('🏢 [AUTH] Organization query result:', {
          data: orgResult.data,
          error: orgResult.error
        })
        
        // If main method fails, try simple fallback
        if (orgResult.error || !orgResult.data) {
          console.log('🔄 [AUTH] Main method failed, trying simple fallback...')
          const { getOrganizationSimple } = await import('@/lib/supabase-simple')
          const simpleResult = await getOrganizationSimple()
          console.log('🔄 [AUTH] Simple fallback result:', {
            data: simpleResult.data,
            error: simpleResult.error
          })
          
          if (simpleResult.data && !simpleResult.error) {
            orgResult = simpleResult
          }
        }
        
        let organization = orgResult.data
        let userRole = 'user'
        
        if (organization) {
          // User has organization - set role to admin
          console.log('✅ [AUTH] User has organization, setting admin role:', organization)
          userRole = 'admin'
        } else {
          // No organization found - check if user is super admin
          console.log('❌ [AUTH] User has no organization, checking if user is super admin...')
          const isSuper = await isSuperAdmin(data.user.email || '')
          console.log(`🔍 [AUTH] Super admin check result: ${isSuper}`)
          
          if (isSuper) {
            // Super admin gets system organization and super_admin role
            console.log('👑 [AUTH] User is super admin, setting system organization')
            userRole = 'super_admin'
            organization = {
              id: 'system',
              name: 'System Administration',
              is_active: true
            }
          } else {
            console.log('❌ [AUTH] User has no organization and is not super admin, keeping user role')
          }
        }

        const userData: User = {
          id: data.user.id,
          email: data.user.email || '',
          firstName: data.user.user_metadata?.firstName || 'User',
          lastName: data.user.user_metadata?.lastName || '',
          role: userRole,
          organizationId: organization?.id,
          organization: organization ? {
            id: organization.id,
            name: organization.name,
            subscription_plan: organization.subscription_plan
          } : undefined
        }
        
        console.log('👤 [AUTH] Final user data:', userData)
        
        setUser(userData)
        setToken(data.session?.access_token || null)
        if (data.session?.access_token) {
          saveSession(userData, data.session.access_token)
        }
        
        // Route user based on their status
        if (userRole === 'super_admin') {
          // Super admin goes to admin dashboard
          console.log('🚀 [AUTH] Redirecting super admin to dashboard')
          router.push('/dashboard')
        } else if (organization) {
          // User with organization goes to dashboard
          console.log('🚀 [AUTH] Redirecting user with organization to dashboard')
          router.push('/dashboard')
        } else {
          // User without organization goes to organization-required page
          console.log('🚀 [AUTH] Redirecting user without organization to organization-required')
          router.push('/organization-required')
        }
      }
    } catch (error: unknown) {
      console.error('❌ [AUTH] Login error:', error)
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
