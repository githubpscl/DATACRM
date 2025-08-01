'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/auth-provider'
import DashboardLayout from '@/components/dashboard/layout'
import SuperAdminGuard from '@/components/admin/super-admin-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  getAllOrganizationsWithUserCounts,
  createOrganization,
  getOrganizationUsers,
  addUserToOrganization,
  addAdminToOrganization
} from '@/lib/supabase'
import { 
  Building2, 
  Plus, 
  Users, 
  Crown,
  ExternalLink,
  UserPlus,
  Settings,
  Shield,
  Eye,
  Loader2
} from 'lucide-react'

interface Organization {
  id: string
  name: string
  description?: string
  email?: string
  industry?: string
  website?: string
  phone?: string
  subscription_plan?: string
  created_at: string
  user_count: number
}

interface OrganizationUser {
  id: string
  email: string
  first_name?: string
  last_name?: string
  role: string
  is_active: boolean
  created_at: string
}

export default function OrganizationsPage() {
  const { user, loading: authLoading } = useAuth()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)

  // User management state
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [orgUsers, setOrgUsers] = useState<OrganizationUser[]>([])
  const [showUserManagement, setShowUserManagement] = useState(false)
  const [showAddUser, setShowAddUser] = useState(false)
  const [showAddAdmin, setShowAddAdmin] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [addingUser, setAddingUser] = useState(false)

  // Form states
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
    admin_email: '',
    industry: '',
    website: '',
    phone: ''
  })

  const [userFormData, setUserFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    temporary_password: ''
  })

  const [adminFormData, setAdminFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    temporary_password: ''
  })

  // Load organizations with user counts
  const loadOrganizations = useCallback(async () => {
    if (!user) return
    
    try {
      const result = await getAllOrganizationsWithUserCounts()
      if (result.data) {
        setOrganizations(result.data)
      }
    } catch (error) {
      console.error('Error loading organizations:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadOrganizations()
    }
  }, [user, loadOrganizations])

  // Load users for selected organization
  const loadOrganizationUsers = async (orgId: string) => {
    setLoadingUsers(true)
    try {
      const result = await getOrganizationUsers(orgId)
      if (result.data) {
        setOrgUsers(result.data)
      }
    } catch (error) {
      console.error('Error loading organization users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!createFormData.name.trim() || !createFormData.admin_email.trim()) {
      alert('Organisationsname und Admin-E-Mail sind erforderlich')
      return
    }
    
    setCreating(true)
    try {
      const result = await createOrganization({
        name: createFormData.name.trim(),
        description: createFormData.description.trim() || undefined,
        admin_email: createFormData.admin_email.trim(),
        industry: createFormData.industry.trim() || undefined,
        website: createFormData.website.trim() || undefined,
        phone: createFormData.phone.trim() || undefined
      })

      if (result.data) {
        alert('Organisation erfolgreich erstellt!')
        setShowCreateForm(false)
        setCreateFormData({
          name: '',
          description: '',
          admin_email: '',
          industry: '',
          website: '',
          phone: ''
        })
        await loadOrganizations()
      } else {
        console.error('Error creating organization:', result.error)
        alert('Fehler beim Erstellen der Organisation')
      }
    } catch (error) {
      console.error('Error creating organization:', error)
      alert('Fehler beim Erstellen der Organisation')
    } finally {
      setCreating(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedOrg || !userFormData.email.trim() || !userFormData.first_name.trim() || !userFormData.last_name.trim()) {
      alert('Alle Felder sind erforderlich')
      return
    }
    
    setAddingUser(true)
    try {
      const result = await addUserToOrganization({
        email: userFormData.email.trim(),
        first_name: userFormData.first_name.trim(),
        last_name: userFormData.last_name.trim(),
        organization_id: selectedOrg.id,
        temporary_password: userFormData.temporary_password.trim() || undefined
      })

      if (result.data) {
        alert('Benutzer erfolgreich hinzugefügt!')
        setShowAddUser(false)
        setUserFormData({
          email: '',
          first_name: '',
          last_name: '',
          temporary_password: ''
        })
        await loadOrganizationUsers(selectedOrg.id)
        await loadOrganizations() // Refresh user counts
      } else {
        console.error('Error adding user:', result.error)
        alert('Fehler beim Hinzufügen des Benutzers')
      }
    } catch (error) {
      console.error('Error adding user:', error)
      alert('Fehler beim Hinzufügen des Benutzers')
    } finally {
      setAddingUser(false)
    }
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedOrg || !adminFormData.email.trim() || !adminFormData.first_name.trim() || !adminFormData.last_name.trim()) {
      alert('Alle Felder sind erforderlich')
      return
    }
    
    setAddingUser(true)
    try {
      const result = await addAdminToOrganization({
        email: adminFormData.email.trim(),
        first_name: adminFormData.first_name.trim(),
        last_name: adminFormData.last_name.trim(),
        organization_id: selectedOrg.id,
        temporary_password: adminFormData.temporary_password.trim() || undefined
      })

      if (result.data) {
        alert('Administrator erfolgreich hinzugefügt!')
        setShowAddAdmin(false)
        setAdminFormData({
          email: '',
          first_name: '',
          last_name: '',
          temporary_password: ''
        })
        await loadOrganizationUsers(selectedOrg.id)
        await loadOrganizations() // Refresh user counts
      } else {
        console.error('Error adding admin:', result.error)
        alert('Fehler beim Hinzufügen des Administrators')
      }
    } catch (error) {
      console.error('Error adding admin:', error)
      alert('Fehler beim Hinzufügen des Administrators')
    } finally {
      setAddingUser(false)
    }
  }

  const handleManageUsers = (org: Organization) => {
    setSelectedOrg(org)
    setShowUserManagement(true)
    loadOrganizationUsers(org.id)
  }

  if (authLoading || loading) {
    return (
      <SuperAdminGuard>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Lade Organisationen...</p>
            </div>
          </div>
        </DashboardLayout>
      </SuperAdminGuard>
    )
  }

  return (
    <SuperAdminGuard>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Organisationen verwalten</h1>
              <p className="text-gray-600 mt-1">
                Übersicht aller Organisationen und Benutzer im System
              </p>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Neue Organisation
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Organisationen</p>
                    <p className="text-2xl font-bold text-gray-900">{organizations.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Gesamt Benutzer</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {organizations.reduce((sum, org) => sum + (org.user_count ?? 0), 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Crown className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Super Admin</p>
                    <p className="text-2xl font-bold text-gray-900">1</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Organizations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <Card key={org.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                          {org.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{org.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {org.user_count} Benutzer
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {org.description && (
                    <CardDescription className="mt-2">
                      {org.description}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {org.industry && (
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{org.industry}</Badge>
                      </div>
                    )}
                    
                    {org.website && (
                      <div className="flex items-center space-x-2 text-sm">
                        <ExternalLink className="h-4 w-4 text-gray-500" />
                        <a 
                          href={org.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Website
                        </a>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500">
                      Erstellt: {new Date(org.created_at ?? '').toLocaleDateString('de-DE')}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-4 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleManageUsers(org)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Anzeigen
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Verwalten
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedOrg(org)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Benutzer
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Benutzer hinzufügen</DialogTitle>
                            <DialogDescription>
                              Neuen Benutzer zu "{org.name}" hinzufügen
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleAddUser} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="firstName">Vorname</Label>
                                <Input
                                  id="firstName"
                                  value={userFormData.first_name}
                                  onChange={(e) => setUserFormData({...userFormData, first_name: e.target.value})}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="lastName">Nachname</Label>
                                <Input
                                  id="lastName"
                                  value={userFormData.last_name}
                                  onChange={(e) => setUserFormData({...userFormData, last_name: e.target.value})}
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="email">E-Mail</Label>
                              <Input
                                id="email"
                                type="email"
                                value={userFormData.email}
                                onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="tempPassword">Temporäres Passwort (optional)</Label>
                              <Input
                                id="tempPassword"
                                type="password"
                                value={userFormData.temporary_password}
                                onChange={(e) => setUserFormData({...userFormData, temporary_password: e.target.value})}
                                placeholder="Falls leer: TempPass123!"
                              />
                            </div>
                            <Button type="submit" disabled={addingUser} className="w-full">
                              {addingUser ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Wird hinzugefügt...
                                </>
                              ) : (
                                <>
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Benutzer hinzufügen
                                </>
                              )}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedOrg(org)}
                          >
                            <Shield className="h-4 w-4 mr-1" />
                            Admin
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Administrator hinzufügen</DialogTitle>
                            <DialogDescription>
                              Neuen Administrator zu "{org.name}" hinzufügen
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleAddAdmin} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="adminFirstName">Vorname</Label>
                                <Input
                                  id="adminFirstName"
                                  value={adminFormData.first_name}
                                  onChange={(e) => setAdminFormData({...adminFormData, first_name: e.target.value})}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="adminLastName">Nachname</Label>
                                <Input
                                  id="adminLastName"
                                  value={adminFormData.last_name}
                                  onChange={(e) => setAdminFormData({...adminFormData, last_name: e.target.value})}
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="adminEmail">E-Mail</Label>
                              <Input
                                id="adminEmail"
                                type="email"
                                value={adminFormData.email}
                                onChange={(e) => setAdminFormData({...adminFormData, email: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="adminTempPassword">Temporäres Passwort (optional)</Label>
                              <Input
                                id="adminTempPassword"
                                type="password"
                                value={adminFormData.temporary_password}
                                onChange={(e) => setAdminFormData({...adminFormData, temporary_password: e.target.value})}
                                placeholder="Falls leer: TempPass123!"
                              />
                            </div>
                            <Button type="submit" disabled={addingUser} className="w-full">
                              {addingUser ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Wird hinzugefügt...
                                </>
                              ) : (
                                <>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Administrator hinzufügen
                                </>
                              )}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      disabled
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Rechte verwalten
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {organizations.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Keine Organisationen gefunden
                </h3>
                <p className="text-gray-500 mb-4">
                  Erstellen Sie Ihre erste Organisation, um zu beginnen.
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erste Organisation erstellen
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Create Organization Dialog */}
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Neue Organisation erstellen</DialogTitle>
                <DialogDescription>
                  Erstellen Sie eine neue Organisation mit einem Administrator
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateOrganization} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name der Organisation *</Label>
                  <Input
                    id="name"
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})}
                    placeholder="z.B. Musterfirma GmbH"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="adminEmail">Administrator E-Mail *</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={createFormData.admin_email}
                    onChange={(e) => setCreateFormData({...createFormData, admin_email: e.target.value})}
                    placeholder="admin@musterfirma.de"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Beschreibung</Label>
                  <Input
                    id="description"
                    value={createFormData.description}
                    onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
                    placeholder="Kurze Beschreibung der Organisation"
                  />
                </div>
                
                <div>
                  <Label htmlFor="industry">Branche</Label>
                  <Input
                    id="industry"
                    value={createFormData.industry}
                    onChange={(e) => setCreateFormData({...createFormData, industry: e.target.value})}
                    placeholder="z.B. IT, Handel, Dienstleistung"
                  />
                </div>
                
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={createFormData.website}
                    onChange={(e) => setCreateFormData({...createFormData, website: e.target.value})}
                    placeholder="https://www.musterfirma.de"
                  />
                </div>
                
                <Button type="submit" disabled={creating} className="w-full">
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Organisation wird erstellt...
                    </>
                  ) : (
                    <>
                      <Building2 className="h-4 w-4 mr-2" />
                      Organisation erstellen
                    </>
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* User Management Dialog */}
          <Dialog open={showUserManagement} onOpenChange={setShowUserManagement}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Benutzer verwalten - {selectedOrg?.name}</DialogTitle>
                <DialogDescription>
                  Übersicht aller Benutzer in dieser Organisation
                </DialogDescription>
              </DialogHeader>
              
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {orgUsers.length > 0 ? (
                    <div className="space-y-2">
                      {orgUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {(user.first_name?.[0] || '') + (user.last_name?.[0] || user.email[0].toUpperCase())}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {user.first_name} {user.last_name} 
                                {(!user.first_name && !user.last_name) && user.email}
                              </p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant={user.role === 'org_admin' ? 'default' : 'secondary'}>
                                  {user.role === 'org_admin' ? 'Administrator' : 'Benutzer'}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  Seit {new Date(user.created_at).toLocaleDateString('de-DE')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Keine Benutzer in dieser Organisation</p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </SuperAdminGuard>
  )
}
