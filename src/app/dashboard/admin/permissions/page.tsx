'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  getCurrentUser,
  getUserRole,
  getAllRoles,
  getAllPermissions,
  getOrgUsers,
  assignRole,
  assignPermission
} from '@/lib/supabase'
import { 
  Users, 
  Shield, 
  Settings,
  Plus,
  Crown,
  Star,
  Key
} from 'lucide-react'

interface Role {
  id: string
  name: string
  description: string
  level: number
  color: string
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface User {
  id: string
  email?: string
  full_name?: string
}

interface OrgUser {
  id: string
  user_id: string
  role_id: string
  user: User
  role: Role
}

export default function UserPermissionsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<Role | null>(null)
  const [orgUsers, setOrgUsers] = useState<OrgUser[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return

      setCurrentUser(user)

      // Load current user's role and permissions
      const { data: roleData } = await getUserRole(user.id)
      setCurrentUserRole(roleData)

      // Load organization users (assuming org_id is available)
      // For demo, we'll load all users
      const { data: usersData } = await getOrgUsers('demo-org-id')
      setOrgUsers(usersData || [])

      // Load all roles and permissions
      const { data: rolesData } = await getAllRoles()
      setRoles(rolesData || [])

      const { data: permissionsData } = await getAllPermissions()
      setPermissions(permissionsData || [])

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAssignRole = async (userId: string, roleId: string) => {
    if (!currentUser) return
    
    try {
      const { error } = await assignRole({
        user_id: userId,
        role_id: roleId,
        org_id: 'demo-org-id',
        assigned_by: currentUser.id
      })

      if (error) {
        alert(`Fehler beim Zuweisen der Rolle: ${error.message}`)
      } else {
        alert('✅ Rolle erfolgreich zugewiesen!')
        await loadData()
      }
    } catch (error) {
      console.error('Error assigning role:', error)
      alert('Fehler beim Zuweisen der Rolle.')
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAssignPermission = async (userId: string, permissionId: string) => {
    if (!currentUser) return
    
    try {
      const { error } = await assignPermission({
        user_id: userId,
        permission_id: permissionId,
        org_id: 'demo-org-id',
        assigned_by: currentUser.id
      })

      if (error) {
        alert(`Fehler beim Zuweisen der Berechtigung: ${error.message}`)
      } else {
        alert('✅ Berechtigung erfolgreich zugewiesen!')
        await loadData()
      }
    } catch (error) {
      console.error('Error assigning permission:', error)
      alert('Fehler beim Zuweisen der Berechtigung.')
    }
  }

  const getRoleColor = (role: Role) => {
    const colors: { [key: string]: string } = {
      'red': 'bg-red-100 text-red-800 border-red-200',
      'blue': 'bg-blue-100 text-blue-800 border-blue-200',
      'green': 'bg-green-100 text-green-800 border-green-200',
      'purple': 'bg-purple-100 text-purple-800 border-purple-200',
      'yellow': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
    return colors[role.color] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getRoleIcon = (level: number) => {
    if (level >= 90) return <Crown className="h-4 w-4" />
    if (level >= 70) return <Star className="h-4 w-4" />
    if (level >= 50) return <Shield className="h-4 w-4" />
    return <Key className="h-4 w-4" />
  }

  const getInitials = (email: string, name?: string) => {
    if (name) {
      return name.split(' ').map(word => word.charAt(0)).slice(0, 2).join('').toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  const canManageUser = (targetUserRole: Role) => {
    // Super admin can manage everyone
    if (currentUser?.email === 'testdatacrmpascal@gmail.com') return true
    
    // Can only manage users with lower or equal level
    return (currentUserRole?.level || 0) >= targetUserRole.level
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Lade Benutzerrechte...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Benutzerrechte verwalten</h1>
            <p className="text-gray-600 mt-1">
              Rollen und Berechtigungen für Organisationsmitglieder verwalten
            </p>
          </div>
          <Button 
            onClick={() => setShowAddUser(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Benutzer hinzufügen
          </Button>
        </div>

        {/* Current User Info */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Ihre aktuellen Berechtigungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback>
                  {getInitials(currentUser?.email || '', currentUser?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{currentUser?.email}</p>
                {currentUserRole && (
                  <Badge className={getRoleColor(currentUserRole)}>
                    {getRoleIcon(currentUserRole.level)}
                    <span className="ml-1">{currentUserRole.name}</span>
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Organisationsmitglieder ({orgUsers.length})
            </CardTitle>
            <CardDescription>
              Verwalten Sie Rollen und Berechtigungen für alle Mitglieder
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orgUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Benutzer</h3>
                <p className="text-gray-500 mb-4">
                  Noch keine Benutzer in dieser Organisation.
                </p>
                <Button onClick={() => setShowAddUser(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ersten Benutzer hinzufügen
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orgUsers.map((orgUser) => (
                  <div key={orgUser.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(orgUser.user.email || '', orgUser.user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{orgUser.user.full_name || orgUser.user.email}</p>
                          <p className="text-sm text-gray-600">{orgUser.user.email}</p>
                          <Badge className={getRoleColor(orgUser.role)}>
                            {getRoleIcon(orgUser.role.level)}
                            <span className="ml-1">{orgUser.role.name}</span>
                          </Badge>
                        </div>
                      </div>
                      {canManageUser(orgUser.role) && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Berechtigungen
                          </Button>
                          <Button variant="outline" size="sm">
                            <Shield className="h-4 w-4 mr-2" />
                            Rolle ändern
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Verfügbare Rollen
            </CardTitle>
            <CardDescription>
              Übersicht über alle verfügbaren Rollen und deren Berechtigungsstufen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role) => (
                <div key={role.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getRoleIcon(role.level)}
                    <h4 className="font-medium">{role.name}</h4>
                    <Badge variant="secondary">Level {role.level}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Available Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Verfügbare Berechtigungen
            </CardTitle>
            <CardDescription>
              Alle verfügbaren Einzelberechtigungen nach Kategorien
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(
                permissions.reduce((acc, permission) => {
                  if (!acc[permission.category]) acc[permission.category] = []
                  acc[permission.category].push(permission)
                  return acc
                }, {} as Record<string, Permission[]>)
              ).map(([category, categoryPermissions]) => (
                <div key={category}>
                  <h4 className="font-medium text-gray-900 mb-2 capitalize">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {categoryPermissions.map((permission) => (
                      <div key={permission.id} className="border rounded p-2">
                        <p className="text-sm font-medium">{permission.name}</p>
                        <p className="text-xs text-gray-600">{permission.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
