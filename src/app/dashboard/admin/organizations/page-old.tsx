'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  getOrganizations, 
  createOrganization,
  getAllUsers
} from '@/lib/supabase'
import { 
  Building2, 
  Plus, 
  Users, 
  Shield, 
  Settings,
  Crown,
  Mail,
  ExternalLink,
  Phone
} from 'lucide-react'

interface Organization {
  id: string
  name: string
  description?: string
  email?: string // Changed from admin_email to email
  industry?: string
  website?: string
  phone?: string
  subscription_plan?: string
  created_at: string
  user_count?: number
}

export default function SuperAdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)

  const debugUsers = async () => {
    console.log('=== DEBUG: Checking all users ===')
    const result = await getAllUsers()
    if (result.data) {
      console.log('Users found:', result.data.length)
      result.data.forEach(user => {
        console.log(`- ${user.email} (ID: ${user.id}, Role: ${user.role})`)
      })
    } else {
      console.log('No users found or error:', result.error)
    }
  }

  const handleJoinOrganization = async (orgId: string, orgName: string) => {
    try {
      // Implementiere die Logik zum Beitreten einer Organisation
      // Hier würde normalerweise der Super-Admin temporär der Organisation beitreten
      // um sie zu verwalten
      console.log('Joining organization:', orgId, orgName)
      
      // Für jetzt nur zu den Einstellungen der Organisation navigieren
      // Später kann hier eine echte "Join" Funktionalität implementiert werden
      router.push(`/dashboard/settings/organizations/${orgId}`)
    } catch (error) {
      console.error('Error joining organization:', error)
      alert('Fehler beim Beitreten der Organisation')
    }
  }
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    admin_email: '', // Optional admin email
    industry: '',
    website: '',
    phone: ''
  })

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Load organizations
  const loadOrganizations = useCallback(async () => {
    if (!user) return
    
    try {
      const result = await getOrganizations()
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
      
      if (isSuper) {
        await loadOrganizations()
      }
    } catch (error) {
      console.error('Access check failed:', error)
      setIsAuthorized(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAccess()
  }, [checkAccess])

  const loadOrganizations = async () => {
    try {
      const { data, error } = await getOrganizations()
      if (error) {
        console.error('Error loading organizations:', error)
      } else {
        setOrganizations(data || [])
      }
    } catch (error) {
      console.error('Error loading organizations:', error)
    }
  }

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Only require name - admin email is now optional
    if (!formData.name.trim()) {
      alert('Organisation Name ist erforderlich.')
      return
    }

    setCreating(true)
    try {
      console.log('Creating organization with data:', formData)
      
      const result = await createOrganization({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        admin_email: formData.admin_email.trim() || undefined, // Optional
        industry: formData.industry.trim() || undefined,
        website: formData.website.trim() || undefined,
        phone: formData.phone.trim() || undefined
      })
      
      console.log('CreateOrganization result:', result)

      if (result.error) {
        console.error('Error creating organization:', result.error)
        
        // Check for specific error types
        if (result.error.code === 'USER_NOT_FOUND') {
          alert(`❌ ${result.error.message}`)
        } else {
          alert(`❌ Fehler beim Erstellen der Organisation: ${result.error.message || 'Unbekannter Fehler'}`)
        }
      } else {
        const successMessage = formData.admin_email 
          ? `✅ Organisation "${formData.name}" erfolgreich erstellt und "${formData.admin_email}" als Administrator zugewiesen!`
          : `✅ Organisation "${formData.name}" erfolgreich erstellt!`
        
        alert(successMessage)
        setFormData({ 
          name: '', 
          description: '', 
          admin_email: '',
          industry: '',
          website: '',
          phone: ''
        })
        setShowCreateForm(false)
        await loadOrganizations()
      }
    } catch (error) {
      console.error('Unexpected error creating organization:', error)
      alert(`Fehler beim Erstellen der Organisation: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`)
    } finally {
      setCreating(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Prüfe Berechtigung...</p>
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
            <p className="text-gray-500">
              Sie haben keine Berechtigung für diese Seite.
              <br />
              Nur Super-Administratoren können auf diese Funktion zugreifen.
            </p>
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
              <h1 className="text-3xl font-bold text-gray-900">Super Admin Panel</h1>
            </div>
            <p className="text-gray-600">
              Verwalten Sie Organisationen und deren Administratoren
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Neue Organisation
            </Button>
            <Button 
              onClick={debugUsers}
              variant="outline"
              className="text-xs"
            >
              Debug: Benutzer anzeigen
            </Button>
          </div>
        </div>

        {/* Create Organization Form */}
        {showCreateForm && (
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                Neue Organisation erstellen
              </CardTitle>
              <CardDescription>
                Erstellen Sie eine neue Organisation. Falls Sie eine Admin-E-Mail angeben, wird der entsprechende Benutzer automatisch als Administrator zugewiesen (der Benutzer muss bereits registriert sein).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateOrg} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="org-name">Organisationsname *</Label>
                    <Input
                      id="org-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="z.B. Mustermann GmbH"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-email">Administrator E-Mail (optional)</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={formData.admin_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, admin_email: e.target.value }))}
                      placeholder="admin@unternehmen.de"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="org-description">Beschreibung (optional)</Label>
                  <Input
                    id="org-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Kurze Beschreibung der Organisation"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="industry">Branche (optional)</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder="IT, Healthcare, Finance..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website (optional)</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefon (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+49 123 456789"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    disabled={creating}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {creating ? 'Wird erstellt...' : 'Organisation erstellen'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false)
                      setFormData({ 
                        name: '', 
                        description: '', 
                        admin_email: '',
                        industry: '',
                        website: '',
                        phone: ''
                      })
                    }}
                  >
                    Abbrechen
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Organizations List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Alle Organisationen ({organizations.length})
            </CardTitle>
            <CardDescription>
              Übersicht über alle registrierten Organisationen
            </CardDescription>
          </CardHeader>
          <CardContent>
            {organizations.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Organisationen</h3>
                <p className="text-gray-500 mb-4">
                  Noch keine Organisationen vorhanden. Erstellen Sie die erste Organisation.
                </p>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Erste Organisation erstellen
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {organizations.map((org) => (
                  <div key={org.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 bg-purple-100">
                          <AvatarFallback className="text-purple-600 font-medium">
                            {getInitials(org.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{org.name}</h4>
                          {org.description && (
                            <p className="text-sm text-gray-600">{org.description}</p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-4 mt-2">
                            {org.email && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                Admin: {org.email}
                              </span>
                            )}
                            {org.industry && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {org.industry}
                              </span>
                            )}
                            {org.website && (
                              <a 
                                href={org.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Website
                              </a>
                            )}
                            {org.phone && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {org.phone}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              Erstellt: {new Date(org.created_at).toLocaleDateString('de-DE')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          <Users className="h-3 w-3 mr-1" />
                          {org.user_count || 0} Nutzer
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleJoinOrganization(org.id, org.name)}
                          className="text-purple-600 border-purple-600 hover:bg-purple-50"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Beitreten & Verwalten
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Organisationen</p>
                  <p className="text-2xl font-bold text-gray-900">{organizations.length}</p>
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
                  <p className="text-2xl font-bold text-gray-900">
                    {organizations.reduce((sum, org) => sum + (org.user_count || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aktive Admins</p>
                  <p className="text-2xl font-bold text-gray-900">{organizations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
