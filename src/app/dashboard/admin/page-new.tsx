'use client'

import { useAuth } from '@/components/auth-provider'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  Users, 
  Crown,
  Settings,
  BarChart3,
  Shield,
  UserPlus,
  Building
} from 'lucide-react'
import { getOrganizations, getAllUsers } from '@/lib/supabase'

export default function SuperAdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalUsers: 0,
    activeOrganizations: 0
  })
  const [loadingStats, setLoadingStats] = useState(true)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Load statistics
  useEffect(() => {
    const loadStats = async () => {
      if (!user) return
      
      try {
        const organizationsResult = await getOrganizations()
        const usersResult = await getAllUsers()
        
        const organizations = organizationsResult.data || []
        const users = usersResult.data || []
        
        setStats({
          totalOrganizations: organizations.length,
          totalUsers: users.length,
          activeOrganizations: organizations.filter((org: any) => org.is_active).length
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoadingStats(false)
      }
    }

    if (user) {
      loadStats()
    }
  }, [user])

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Crown className="h-8 w-8 text-yellow-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-gray-600">Systemweite Verwaltung und Übersicht</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organisationen</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? '...' : stats.totalOrganizations}
              </div>
              <p className="text-xs text-muted-foreground">
                {loadingStats ? '' : `${stats.activeOrganizations} aktiv`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Benutzer</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingStats ? '...' : stats.totalUsers}
              </div>
              <p className="text-xs text-muted-foreground">
                Gesamt registriert
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Online</div>
              <p className="text-xs text-muted-foreground">
                Alle Services aktiv
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span>Organisationen verwalten</span>
              </CardTitle>
              <CardDescription>
                Organisationen erstellen, bearbeiten und verwalten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push('/dashboard/admin/organizations')}
                className="w-full"
              >
                Organisationen öffnen
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <span>Benutzer verwalten</span>
              </CardTitle>
              <CardDescription>
                Benutzerkonten und Berechtigungen verwalten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push('/dashboard/admin/users')}
                variant="outline"
                className="w-full"
              >
                Benutzer verwalten
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-gray-600" />
                <span>System-Einstellungen</span>
              </CardTitle>
              <CardDescription>
                Globale Systemkonfiguration und Einstellungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push('/dashboard/admin/settings')}
                variant="outline"
                className="w-full"
              >
                Einstellungen
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Current User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span>Super Admin Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Angemeldet als:</strong> {user.email}
              </p>
              <p className="text-sm text-gray-600">
                Sie haben vollständigen Zugriff auf alle Systemfunktionen.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
