'use client'

import { useState, useEffect, useCallback } from 'react'
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
  isSuperAdmin,
  getCurrentUser 
} from '@/lib/supabase'
import { 
  Building2, 
  Plus, 
  Users, 
  Shield, 
  Settings,
  Crown,
  AlertCircle
} from 'lucide-react'

interface Organization {
  id: string
  name: string
  description?: string
  admin_email: string
  created_at: string
  user_count?: number
}

export default function SuperAdminPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    admin_email: ''
  })

  const checkAccess = useCallback(async () => {
    try {
      const user = await getCurrentUser()
      if (!user?.email) {
        setIsAuthorized(false)
        setLoading(false)
        return
      }

      const isSuper = await isSuperAdmin(user.email)
      setIsAuthorized(isSuper)
      
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
    
    if (!formData.name.trim() || !formData.admin_email.trim()) {
      alert('Name und Admin-E-Mail sind erforderlich.')
      return
    }

    setCreating(true)
    try {
      const { error } = await createOrganization({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        admin_email: formData.admin_email.trim()
      })

      if (error) {
        console.error('Error creating organization:', error)
        alert(`Fehler beim Erstellen der Organisation: ${error.message}`)
      } else {
        alert(`✅ Organisation "${formData.name}" erfolgreich erstellt!`)
        setFormData({ name: '', description: '', admin_email: '' })
        setShowCreateForm(false)
        await loadOrganizations()
      }
    } catch (error) {
      console.error('Error creating organization:', error)
      alert('Fehler beim Erstellen der Organisation.')
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
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neue Organisation
          </Button>
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
                Erstellen Sie eine neue Organisation mit einem Administrator
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
                    <Label htmlFor="admin-email">Administrator E-Mail *</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={formData.admin_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, admin_email: e.target.value }))}
                      placeholder="admin@unternehmen.de"
                      required
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
                      setFormData({ name: '', description: '', admin_email: '' })
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
                        <div>
                          <h4 className="font-medium text-gray-900">{org.name}</h4>
                          <p className="text-sm text-gray-600">{org.description || 'Keine Beschreibung'}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-gray-500">
                              Admin: {org.admin_email}
                            </span>
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
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Verwalten
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
