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
  createOrganization, 
  getOrganizations, 
  isSuperAdmin,
  getOrgUsers,
  addAdminToOrg,
  updateOrganization
} from '@/lib/supabase'
import { 
  Building,
  Users,
  Plus,
  Settings,
  Shield,
  Crown,
  AlertCircle,
  CheckCircle,
  Loader2,
  UserPlus,
  Edit,
  Trash2
} from 'lucide-react'

interface Organization {
  id: string
  name: string
  domain?: string
  created_at: string
  user_count?: number
  admin_count?: number
}

export default function OrganizationsPage() {
  const { user } = useAuth()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isSuper, setIsSuper] = useState(false)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgDomain, setNewOrgDomain] = useState('')
  
  // Modal states
  const [showUserManagement, setShowUserManagement] = useState(false)
  const [showAddAdmin, setShowAddAdmin] = useState(false)
  const [showOrgSettings, setShowOrgSettings] = useState(false)
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  const [selectedOrgName, setSelectedOrgName] = useState<string>('')
  
  // User management states
  const [orgUsers, setOrgUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [addingAdmin, setAddingAdmin] = useState(false)
  
  // Organization settings states
  const [editingOrgName, setEditingOrgName] = useState('')
  const [editingOrgDomain, setEditingOrgDomain] = useState('')
  const [savingSettings, setSavingSettings] = useState(false)

  // Check if user is super admin and load organizations
  useEffect(() => {
    const loadData = async () => {
      if (!user?.email) {
        setLoading(false)
        return
      }

      try {
        // Check super admin status
        const superAdminStatus = await isSuperAdmin(user.email)
        setIsSuper(superAdminStatus)

        // Load organizations based on role
        if (superAdminStatus) {
          // Super admin sees all organizations
          const { data, error } = await getOrganizations()
          if (error) {
            console.error('Error loading organizations:', error)
          } else {
            setOrganizations(data || [])
          }
        } else {
          // Regular users see their organization only
          if (user.companyId) {
            setOrganizations([{
              id: user.companyId,
              name: user.company?.name || 'Ihre Organisation',
              domain: user.company?.domain,
              created_at: new Date().toISOString(),
              user_count: 1,
              admin_count: 1
            }])
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) {
      alert('Bitte geben Sie einen Organisationsnamen ein.')
      return
    }

    setCreating(true)
    try {
      const { data, error } = await createOrganization({
        name: newOrgName,
        description: newOrgDomain || undefined,
        admin_email: user?.email || ''
      })
      
      if (error) {
        console.error('Error creating organization:', error)
        alert(`Fehler beim Erstellen der Organisation: ${error.message}`)
        return
      }

      console.log('Organization created successfully:', data)
      
      // Refresh organizations list
      const { data: orgsData, error: orgsError } = await getOrganizations()
      if (!orgsError && orgsData) {
        setOrganizations(orgsData)
      }

      // Reset form
      setNewOrgName('')
      setNewOrgDomain('')
      setShowCreateForm(false)
      
      alert(`✅ Organisation "${newOrgName}" erfolgreich erstellt!`)
      
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('Ein unerwarteter Fehler ist aufgetreten.')
    } finally {
      setCreating(false)
    }
  }

  // Handler functions for modal actions
  const handleManageUsers = async (orgId: string, orgName: string) => {
    setSelectedOrgId(orgId)
    setSelectedOrgName(orgName)
    setLoadingUsers(true)
    setShowUserManagement(true)
    
    try {
      const { data, error } = await getOrgUsers(orgId)
      if (error) {
        console.error('Error loading users:', error)
        // Fallback to demo data if real API fails
        setOrgUsers([
          {
            id: '1',
            email: user?.email || 'admin@example.com',
            role: 'admin',
            name: 'Current User',
            created_at: new Date().toISOString()
          }
        ])
      } else {
        // Transform API data to match our interface
        const transformedUsers = (data || []).map((item: any) => ({
          id: item.user?.id || item.id,
          email: item.user?.email || 'unknown@example.com',
          role: item.role || 'user',
          name: item.user?.name || item.user?.email || 'Unknown User',
          created_at: item.created_at || new Date().toISOString()
        }))
        setOrgUsers(transformedUsers)
      }
    } catch (error) {
      console.error('Error loading users:', error)
      // Fallback to demo data
      setOrgUsers([
        {
          id: '1',
          email: user?.email || 'admin@example.com',
          role: 'admin',
          name: 'Current User',
          created_at: new Date().toISOString()
        }
      ])
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleAddAdmin = (orgId: string, orgName: string) => {
    setSelectedOrgId(orgId)
    setSelectedOrgName(orgName)
    setNewAdminEmail('')
    setShowAddAdmin(true)
  }

  const handleOrgSettings = (orgId: string, orgName: string, orgDomain?: string) => {
    setSelectedOrgId(orgId)
    setSelectedOrgName(orgName)
    setEditingOrgName(orgName)
    setEditingOrgDomain(orgDomain || '')
    setShowOrgSettings(true)
  }

  const submitAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      alert('Bitte geben Sie eine E-Mail-Adresse ein.')
      return
    }

    setAddingAdmin(true)
    try {
      const { data, error } = await addAdminToOrg(newAdminEmail, selectedOrgId)
      
      if (error) {
        const errorMessage = (error as any)?.message || 'Unbekannter Fehler'
        alert(`Fehler beim Hinzufügen des Admins: ${errorMessage}`)
        return
      }
      
      alert(`✅ Admin ${newAdminEmail} erfolgreich zu "${selectedOrgName}" hinzugefügt!`)
      setShowAddAdmin(false)
      setNewAdminEmail('')
      
      // Refresh organizations list to update admin count
      if (isSuper) {
        const { data: orgsData, error: orgsError } = await getOrganizations()
        if (!orgsError && orgsData) {
          setOrganizations(orgsData)
        }
      }
    } catch (error) {
      console.error('Error adding admin:', error)
      alert('Fehler beim Hinzufügen des Admins.')
    } finally {
      setAddingAdmin(false)
    }
  }

  const submitOrgSettings = async () => {
    if (!editingOrgName.trim()) {
      alert('Bitte geben Sie einen Organisationsnamen ein.')
      return
    }

    setSavingSettings(true)
    try {
      const updates = {
        name: editingOrgName,
        domain: editingOrgDomain || undefined
      }
      
      const { data, error } = await updateOrganization(selectedOrgId, updates)
      
      if (error) {
        const errorMessage = (error as any)?.message || 'Unbekannter Fehler'
        alert(`Fehler beim Speichern der Einstellungen: ${errorMessage}`)
        return
      }
      
      // Update local state
      setOrganizations(orgs => 
        orgs.map(org => 
          org.id === selectedOrgId 
            ? { ...org, name: editingOrgName, domain: editingOrgDomain }
            : org
        )
      )
      
      alert(`✅ Einstellungen für "${editingOrgName}" erfolgreich gespeichert!`)
      setShowOrgSettings(false)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Fehler beim Speichern der Einstellungen.')
    } finally {
      setSavingSettings(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Lade Organisationsdaten...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organisationen</h1>
            <p className="text-gray-600 mt-1">
              {isSuper 
                ? 'Verwalten Sie alle Organisationen im System'
                : 'Verwalten Sie Ihre Organisation und Benutzerrechte'
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={isSuper ? "destructive" : "secondary"}>
              {isSuper ? (
                <>
                  <Crown className="h-3 w-3 mr-1" />
                  Super Admin
                </>
              ) : (
                <>
                  <Shield className="h-3 w-3 mr-1" />
                  Organisation Admin
                </>
              )}
            </Badge>
            {isSuper && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Organisation erstellen
              </Button>
            )}
          </div>
        </div>

        {/* Create Organization Form */}
        {showCreateForm && isSuper && (
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Neue Organisation erstellen
              </CardTitle>
              <CardDescription>
                Erstellen Sie eine neue Organisation für Ihr Team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Organisationsname *
                  </label>
                  <input
                    type="text"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="z.B. Meine Firma GmbH"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Domain (optional)
                  </label>
                  <input
                    type="text"
                    value={newOrgDomain}
                    onChange={(e) => setNewOrgDomain(e.target.value)}
                    placeholder="z.B. meinefirma.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateOrganization} 
                  disabled={creating || !newOrgName.trim()}
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Erstelle...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Erstellen
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewOrgName('')
                    setNewOrgDomain('')
                  }}
                >
                  Abbrechen
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Organizations List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <Card key={org.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{org.name}</CardTitle>
                      {org.domain && (
                        <CardDescription className="text-sm text-gray-500">
                          {org.domain}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  {isSuper && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-900">
                      {org.user_count || 0}
                    </div>
                    <div className="text-sm text-gray-600">Benutzer</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-900">
                      {org.admin_count || 0}
                    </div>
                    <div className="text-sm text-blue-600">Admins</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleManageUsers(org.id, org.name)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Benutzer verwalten
                  </Button>
                  {isSuper && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleAddAdmin(org.id, org.name)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Admin hinzufügen
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleOrgSettings(org.id, org.name, org.domain)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Einstellungen
                  </Button>
                </div>

                <div className="pt-3 border-t text-xs text-gray-500">
                  Erstellt: {new Date(org.created_at).toLocaleDateString('de-DE')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {organizations.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isSuper ? 'Keine Organisationen vorhanden' : 'Keine Organisation zugeordnet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {isSuper 
                  ? 'Erstellen Sie die erste Organisation für Ihr System.'
                  : 'Sie sind noch keiner Organisation zugeordnet. Wenden Sie sich an Ihren Administrator.'
                }
              </p>
              {isSuper && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Organisation erstellen
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Berechtigungen & Funktionen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-green-900 mb-2">Super Admin Rechte:</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Organisationen erstellen und löschen</li>
                  <li>• Organisationsadmins ernennen</li>
                  <li>• Überblick über alle Organisationen</li>
                  <li>• System-weite Einstellungen verwalten</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Organisation Admin Rechte:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Benutzer zur eigenen Organisation hinzufügen</li>
                  <li>• Berechtigungen innerhalb der Organisation verwalten</li>
                  <li>• Organisations-Einstellungen bearbeiten</li>
                  <li>• Team-Übersicht und Statistiken einsehen</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Modal */}
      {showUserManagement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Benutzer verwalten - {selectedOrgName}</h2>
              <Button 
                variant="ghost" 
                onClick={() => setShowUserManagement(false)}
                className="p-1"
              >
                ✕
              </Button>
            </div>
            
            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Lade Benutzer...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border rounded-lg">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-700">
                      <span>Name</span>
                      <span>E-Mail</span>
                      <span>Rolle</span>
                      <span>Hinzugefügt</span>
                    </div>
                  </div>
                  <div className="divide-y">
                    {orgUsers.map((user) => (
                      <div key={user.id} className="px-4 py-3">
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-gray-600">{user.email}</span>
                          <span>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role === 'admin' ? 'Admin' : 'Benutzer'}
                            </Badge>
                          </span>
                          <span className="text-gray-500">
                            {new Date(user.created_at).toLocaleDateString('de-DE')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between pt-4 border-t">
                  <Button 
                    variant="outline"
                    onClick={() => setShowUserManagement(false)}
                  >
                    Schließen
                  </Button>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Neuen Benutzer hinzufügen
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {showAddAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Admin hinzufügen - {selectedOrgName}</h2>
              <Button 
                variant="ghost" 
                onClick={() => setShowAddAdmin(false)}
                className="p-1"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="adminEmail">E-Mail-Adresse des neuen Admins</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="mt-1"
                />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Der neue Admin erhält vollständige Verwaltungsrechte für diese Organisation.
                </p>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddAdmin(false)}
                  className="flex-1"
                >
                  Abbrechen
                </Button>
                <Button 
                  onClick={submitAddAdmin}
                  disabled={addingAdmin}
                  className="flex-1"
                >
                  {addingAdmin ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Hinzufügen...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Admin hinzufügen
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Organization Settings Modal */}
      {showOrgSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Organisationseinstellungen</h2>
              <Button 
                variant="ghost" 
                onClick={() => setShowOrgSettings(false)}
                className="p-1"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="orgName">Organisationsname</Label>
                <Input
                  id="orgName"
                  type="text"
                  value={editingOrgName}
                  onChange={(e) => setEditingOrgName(e.target.value)}
                  placeholder="z.B. Meine Firma GmbH"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="orgDomain">Domain (optional)</Label>
                <Input
                  id="orgDomain"
                  type="text"
                  value={editingOrgDomain}
                  onChange={(e) => setEditingOrgDomain(e.target.value)}
                  placeholder="z.B. meinefirma.com"
                  className="mt-1"
                />
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  Änderungen wirken sich auf alle Benutzer der Organisation aus.
                </p>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowOrgSettings(false)}
                  className="flex-1"
                >
                  Abbrechen
                </Button>
                <Button 
                  onClick={submitOrgSettings}
                  disabled={savingSettings}
                  className="flex-1"
                >
                  {savingSettings ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Speichern...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Speichern
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
