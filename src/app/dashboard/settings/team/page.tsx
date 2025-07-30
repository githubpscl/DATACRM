'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  getOrganizations, 
  getUserRoles, 
  assignRole, 
  removeRole, 
  isSuperAdmin,
  isOrgAdmin
} from '@/lib/supabase'
import { 
  Users,
  Shield,
  Crown,
  Mail,
  UserPlus,
  Trash2,
  Send,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface User {
  id: string
  email: string
  created_at: string
  last_sign_in_at?: string
}

interface UserRole {
  id: string
  user_id: string
  organization_id: string
  role: 'super_admin' | 'org_admin' | 'user' | 'viewer'
  created_at: string
  user: {
    email: string
  }
  organization: {
    name: string
  }
}

interface Organization {
  id: string
  name: string
  domain?: string
  created_at: string
}

export default function TeamPage() {
  const { user } = useAuth()
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isSuper, setIsSuper] = useState(false)
  const [isOrgAdminUser, setIsOrgAdminUser] = useState(false)
  const [loading, setLoading] = useState(true)
  const [inviting, setInviting] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'org_admin' | 'user' | 'viewer'>('user')
  const [inviteOrgId, setInviteOrgId] = useState('')

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return

      try {
        setLoading(true)

        // Check user permissions
        const superAdminCheck = await isSuperAdmin(user.id)
        setIsSuper(superAdminCheck)

        const orgAdminCheck = await isOrgAdmin(user.id)
        setIsOrgAdminUser(orgAdminCheck)

        // Load organizations
        const { data: orgs } = await getOrganizations()
        setOrganizations(orgs || [])

        // Load user roles
        const { data: rolesData } = await getUserRoles()
        setUserRoles(rolesData || [])

      } catch (error) {
        console.error('Error loading team data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const handleInviteUser = async () => {
    if (!inviteEmail || !inviteRole || !inviteOrgId) {
      alert('Bitte füllen Sie alle Felder aus.')
      return
    }

    setInviting(true)
    try {
      // In a real implementation, you would:
      // 1. Send an email invitation
      // 2. Create a pending invitation record
      // 3. When user signs up, assign the role

      // For now, we'll simulate this
      console.log('Invitation sent:', {
        email: inviteEmail,
        role: inviteRole,
        organizationId: inviteOrgId
      })

      alert(`Einladung an ${inviteEmail} wurde gesendet!`)
      
      setInviteEmail('')
      setInviteRole('user')
      setInviteOrgId('')
      setShowInviteForm(false)

    } catch (error) {
      console.error('Error inviting user:', error)
      alert('Fehler beim Senden der Einladung.')
    } finally {
      setInviting(false)
    }
  }

  const handleChangeRole = async (userId: string, newRole: string, orgId: string) => {
    try {
      const { error } = await assignRole(userId, newRole as 'super_admin' | 'org_admin' | 'user' | 'viewer', orgId)
      if (error) {
        console.error('Error changing role:', error)
        alert('Fehler beim Ändern der Rolle.')
        return
      }

      // Reload data
      const { data: rolesData } = await getUserRoles()
      setUserRoles(rolesData || [])
      
      alert('Rolle erfolgreich geändert!')
    } catch (error) {
      console.error('Error changing role:', error)
      alert('Fehler beim Ändern der Rolle.')
    }
  }

  const handleRemoveUser = async (userId: string, orgId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Benutzer entfernen möchten?')) {
      return
    }

    try {
      const { error } = await removeRole(userId, orgId)
      if (error) {
        console.error('Error removing user:', error)
        alert('Fehler beim Entfernen des Benutzers.')
        return
      }

      // Reload data
      const { data: rolesData } = await getUserRoles()
      setUserRoles(rolesData || [])
      
      alert('Benutzer erfolgreich entfernt!')
    } catch (error) {
      console.error('Error removing user:', error)
      alert('Fehler beim Entfernen des Benutzers.')
    }
  }

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { variant: "default" | "destructive" | "secondary" | "outline", icon: React.ReactNode }> = {
      super_admin: { variant: 'destructive', icon: <Crown className="h-3 w-3 mr-1" /> },
      org_admin: { variant: 'default', icon: <Shield className="h-3 w-3 mr-1" /> },
      user: { variant: 'secondary', icon: <Users className="h-3 w-3 mr-1" /> },
      viewer: { variant: 'outline', icon: <Users className="h-3 w-3 mr-1" /> }
    }

    const config = variants[role] || variants.user

    return (
      <Badge variant={config.variant} className="flex items-center">
        {config.icon}
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Lade Team-Informationen...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Check if user has permission to access this page
  if (!isSuper && !isOrgAdminUser) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Zugriff verweigert</h2>
            <p className="text-gray-600">Sie haben keine Berechtigung, diese Seite zu sehen.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team & Rollen</h1>
            <p className="text-gray-600 mt-1">
              Verwalten Sie Benutzer, Rollen und Berechtigungen
            </p>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={() => setShowInviteForm(true)}
              className="flex items-center"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Benutzer einladen
            </Button>
          </div>
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Neuen Benutzer einladen
              </CardTitle>
              <CardDescription>
                Senden Sie eine Einladung per E-Mail
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="inviteEmail">E-Mail-Adresse</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="benutzer@beispiel.de"
                  />
                </div>
                
                <div>
                  <Label htmlFor="inviteRole">Rolle</Label>
                  <select
                    id="inviteRole"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'org_admin' | 'user' | 'viewer')}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="viewer">Betrachter</option>
                    <option value="user">Benutzer</option>
                    <option value="org_admin">Organisation Admin</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="inviteOrg">Organisation</Label>
                  <select
                    id="inviteOrg"
                    value={inviteOrgId}
                    onChange={(e) => setInviteOrgId(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Organisation wählen</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  onClick={handleInviteUser} 
                  disabled={inviting}
                  className="flex items-center"
                >
                  {inviting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Einladung senden
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowInviteForm(false)}
                >
                  Abbrechen
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Team Members */}
        <Card>
          <CardHeader>
            <CardTitle>Team-Mitglieder</CardTitle>
            <CardDescription>
              Übersicht aller Benutzer und deren Rollen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userRoles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Noch keine Team-Mitglieder vorhanden</p>
                </div>
              ) : (
                userRoles.map((userRole) => (
                  <div key={`${userRole.user_id}-${userRole.organization_id}`} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{userRole.user.email}</p>
                          <p className="text-sm text-gray-500">
                            {userRole.organization.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {getRoleBadge(userRole.role)}
                        
                        {(isSuper || (isOrgAdminUser && userRole.role !== 'super_admin')) && (
                          <div className="flex space-x-2">
                            <select
                              value={userRole.role}
                              onChange={(e) => handleChangeRole(userRole.user_id, e.target.value, userRole.organization_id)}
                              className="text-sm p-1 border rounded"
                            >
                              {userRole.role !== 'super_admin' && (
                                <>
                                  <option value="viewer">Betrachter</option>
                                  <option value="user">Benutzer</option>
                                  <option value="org_admin">Org Admin</option>
                                </>
                              )}
                              {isSuper && <option value="super_admin">Super Admin</option>}
                            </select>
                            
                            {userRole.role !== 'super_admin' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveUser(userRole.user_id, userRole.organization_id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Role Permissions Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Rollen-Übersicht</CardTitle>
            <CardDescription>
              Berechtigungen der verschiedenen Rollen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center mb-3">
                  <Crown className="h-5 w-5 text-red-500 mr-2" />
                  <h4 className="font-medium">Super Admin</h4>
                </div>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Alle Organisationen verwalten</li>
                  <li>• Alle Benutzer verwalten</li>
                  <li>• System-Einstellungen</li>
                  <li>• Vollzugriff auf alle Daten</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center mb-3">
                  <Shield className="h-5 w-5 text-blue-500 mr-2" />
                  <h4 className="font-medium">Organisation Admin</h4>
                </div>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Organisation verwalten</li>
                  <li>• Team-Mitglieder einladen</li>
                  <li>• Rollen zuweisen</li>
                  <li>• Daten der Organisation</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center mb-3">
                  <Users className="h-5 w-5 text-green-500 mr-2" />
                  <h4 className="font-medium">Benutzer</h4>
                </div>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Daten bearbeiten</li>
                  <li>• Kampagnen erstellen</li>
                  <li>• Berichte ansehen</li>
                  <li>• Standard-Funktionen</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center mb-3">
                  <Users className="h-5 w-5 text-gray-500 mr-2" />
                  <h4 className="font-medium">Betrachter</h4>
                </div>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Nur Lese-Zugriff</li>
                  <li>• Berichte ansehen</li>
                  <li>• Dashboard einsehen</li>
                  <li>• Keine Bearbeitung</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
