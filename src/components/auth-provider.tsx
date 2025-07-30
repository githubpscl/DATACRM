'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, signIn, signUp, signOut } from '@/lib/supabase'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: string
  companyId?: string
  company?: {
    id: string
    name: string
    domain?: string
  }
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  loading: boolean
}

interface RegisterData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  companyName?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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

  useEffect(() => {
    // Check initial auth state
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            firstName: session.user.user_metadata?.firstName || 'Demo',
            lastName: session.user.user_metadata?.lastName || 'User',
            role: 'admin'
          }
          setUser(userData)
          setToken(session.access_token)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            firstName: session.user.user_metadata?.firstName || 'Demo',
            lastName: session.user.user_metadata?.lastName || 'User',
            role: 'admin'
          }
          setUser(userData)
          setToken(session.access_token)
        } else {
          setUser(null)
          setToken(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      // For demo purposes, allow demo@example.com and super admin with any password
      if (email === 'demo@example.com') {
        const mockUser: User = {
          id: 'demo-user-id',
          email: 'demo@example.com',
          firstName: 'Demo',
          lastName: 'User',
          role: 'admin',
          companyId: 'demo-company',
          company: {
            id: 'demo-company',
            name: 'Demo Company'
          }
        }
        setUser(mockUser)
        setToken('demo-token')
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
          companyId: 'system',
          company: {
            id: 'system',
            name: 'System Administration'
          }
        }
        setUser(mockUser)
        setToken('super-admin-token')
        router.push('/dashboard')
        return
      }

      // For real users, use Supabase
      const { data, error } = await signIn(email, password)
      if (error) throw error

      if (data.user) {
        const userData: User = {
          id: data.user.id,
          email: data.user.email || '',
          firstName: data.user.user_metadata?.firstName || 'User',
          lastName: data.user.user_metadata?.lastName || '',
          role: 'user'
        }
        setUser(userData)
        setToken(data.session?.access_token || null)
        router.push('/dashboard')
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
        // Update user metadata
        await supabase.auth.updateUser({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            companyName: data.companyName
          }
        })

        const userData: User = {
          id: authData.user.id,
          email: authData.user.email || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          role: 'user'
        }
        setUser(userData)
        setToken(authData.session?.access_token || null)
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

  const logout = async () => {
    try {
      await signOut()
      setUser(null)
      setToken(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading
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
