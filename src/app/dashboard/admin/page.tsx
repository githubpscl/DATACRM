'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  isSuperAdmin,
  getCurrentUser,
  getOrganizations
} from '@/lib/supabase'
import { 
  Building2, 
  Users, 
  Crown,
  AlertCircle,
  Settings,
  BarChart3,
  Shield
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SuperAdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalUsers: 0,
    activeOrganizations: 0
  })

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const user = await getCurrentUser()
        console.log('Current user:', user)
        
        if (!user?.email) {
          console.log('No user email found')
          setIsAuthorized(false)
          setLoading(false)
          return
        }

        console.log('Checking super admin status for:', user.email)
        
        // TEMPORÄR: Zugriff für testdatacrmpascal@gmail.com immer erlauben
        if (user.email === 'testdatacrmpascal@gmail.com') {
          console.log('Emergency access granted for testdatacrmpascal@gmail.com')
          setIsAuthorized(true)
          setLoading(false)
          return
        }
        
        const isSuper = await isSuperAdmin(user.email)
        console.log('isSuperAdmin result:', isSuper)
        
        setIsAuthorized(isSuper)
        
        if (isSuper) {
          await loadStats()
        }
      } catch (error) {
        console.error('Access check failed:', error)
        setIsAuthorized(false)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [])

  const loadStats = async () => {
    try {
      const { data: organizations } = await getOrganizations()
      if (organizations) {
        setStats({
          totalOrganizations: organizations.length,
          totalUsers: organizations.reduce((sum, org) => sum + (org.user_count || 0), 0),
          activeOrganizations: organizations.filter(org => org.is_active).length
        })
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Lade Dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!isAuthorized) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Zugriff verweigert</h3>
            <p className="text-gray-500 mb-4">
              Sie haben keine Berechtigung für diese Seite.
              <br />
              Nur Super-Administratoren können auf diese Funktion zugreifen.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg text-left max-w-md mx-auto">
              <h4 className="font-medium text-gray-900 mb-2">Debug-Informationen:</h4>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Angemeldete E-Mail:</strong> {/* wird durch getCurrentUser() ermittelt */}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Hardcoded Super Admin:</strong> testdatacrmpascal@gmail.com
              </p>
              <p className="text-xs text-gray-500">
                Öffnen Sie die Browser-Konsole (F12) für detaillierte Logs.
                <br />
                Verwenden Sie das SQL-Script "create-super-admin-user.sql" um sich als Super Admin zu setzen.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-6 w-6 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            </div>
            <p className="text-gray-600">
              Willkommen im Super-Administrator-Bereich
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Organisationen</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrganizations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Gesamt Nutzer</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aktive Orgs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeOrganizations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                Organisationen verwalten
              </CardTitle>
              <CardDescription>
                Verwalten Sie alle Organisationen im System
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/dashboard/admin/organizations')}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Alle Organisationen anzeigen
                </Button>
                <Button 
                  onClick={() => router.push('/dashboard/admin/organizations')}
                  variant="outline"
                  className="w-full"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Neue Organisation erstellen
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Benutzer verwalten
              </CardTitle>
              <CardDescription>
                Verwalten Sie alle Benutzer systemweit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/dashboard/settings/users')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Alle Benutzer anzeigen
                </Button>
                <Button 
                  onClick={() => router.push('/dashboard/settings/users')}
                  variant="outline"
                  className="w-full"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Benutzer-Statistiken
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
