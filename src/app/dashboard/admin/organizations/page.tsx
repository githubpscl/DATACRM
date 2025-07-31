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
  createOrganization
} from '@/lib/supabase'
import { 
  Building2, 
  Plus, 
  Users, 
  Crown,
  Mail,
  ExternalLink,
  Phone
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
  user_count?: number
}

export default function OrganizationsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    admin_email: '',
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

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Organisationsname ist erforderlich')
      return
    }
    
    setCreating(true)
    try {
      console.log('Creating organization with data:', formData)
      
      const result = await createOrganization({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        admin_email: formData.admin_email.trim() || undefined,
        industry: formData.industry.trim() || undefined,
        website: formData.website.trim() || undefined,
        phone: formData.phone.trim() || undefined
      })
      
      if (result.success) {
        console.log('Organization created successfully:', result.data)
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          admin_email: '',
          industry: '',
          website: '',
          phone: ''
        })
        setShowCreateForm(false)
        
        // Reload organizations
        await loadOrganizations()
        
        alert('Organisation erfolgreich erstellt!')
      } else {
        console.error('Failed to create organization:', result.error)
        alert('Fehler beim Erstellen der Organisation: ' + (result.error || 'Unbekannter Fehler'))
      }
    } catch (error) {
      console.error('Error creating organization:', error)
      alert('Fehler beim Erstellen der Organisation')
    } finally {
      setCreating(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleJoinOrganization = async (orgId: string, orgName: string) => {
    try {
      console.log('Joining organization:', orgId, orgName)
      router.push(`/dashboard/settings/organizations/${orgId}`)
    } catch (error) {
      console.error('Error joining organization:', error)
      alert('Fehler beim Beitreten der Organisation')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="h-8 w-8 text-yellow-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Organisationen verwalten</h1>
              <p className="text-gray-600">Erstellen und verwalten Sie alle Organisationen im System</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Organisation erstellen</span>
          </Button>
        </div>

        {/* Create Organization Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Neue Organisation erstellen</CardTitle>
              <CardDescription>
                Erstellen Sie eine neue Organisation. Admin-E-Mail ist optional.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateOrganization} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Organisationsname *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="z.B. Musterfirma GmbH"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin_email">Admin E-Mail (optional)</Label>
                    <Input
                      id="admin_email"
                      type="email"
                      value={formData.admin_email}
                      onChange={(e) => handleInputChange('admin_email', e.target.value)}
                      placeholder="admin@musterfirma.de"
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Branche</Label>
                    <Input
                      id="industry"
                      type="text"
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      placeholder="z.B. IT-Services"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://www.musterfirma.de"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+49 123 456789"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Beschreibung</Label>
                  <Input
                    id="description"
                    type="text"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Kurze Beschreibung der Organisation"
                  />
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button type="submit" disabled={creating}>
                    {creating ? 'Erstelle...' : 'Organisation erstellen'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                    disabled={creating}
                  >
                    Abbrechen
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Organizations List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <Card key={org.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        <Building2 className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{org.name}</CardTitle>
                      {org.description && (
                        <CardDescription className="text-sm">
                          {org.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {org.subscription_plan || 'Standard'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Organization Details */}
                <div className="space-y-2 text-sm">
                  {org.email && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{org.email}</span>
                    </div>
                  )}
                  {org.website && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <ExternalLink className="h-4 w-4" />
                      <span>{org.website}</span>
                    </div>
                  )}
                  {org.phone && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{org.phone}</span>
                    </div>
                  )}
                  {org.industry && (
                    <div className="text-gray-600">
                      Branche: {org.industry}
                    </div>
                  )}
                </div>

                {/* User Count */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{org.user_count || 0} Benutzer</span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleJoinOrganization(org.id, org.name)}
                    className="flex-1"
                  >
                    Beitreten & Verwalten
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {organizations.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Noch keine Organisationen vorhanden.</p>
              <Button onClick={() => setShowCreateForm(true)}>
                Erste Organisation erstellen
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
