'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  createOrganization, 
  getOrganizations, 
  isSuperAdmin,
  assignRole
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
      const { data, error } = await createOrganization(newOrgName, newOrgDomain || undefined)
      
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
                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Benutzer verwalten
                  </Button>
                  {isSuper && (
                    <Button variant="outline" className="w-full">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Admin hinzufügen
                    </Button>
                  )}
                  <Button variant="outline" className="w-full">
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
    </DashboardLayout>
  )
}
