'use client'

import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  UserPlus, 
  Send, 
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react'
import { 
  getCurrentUserOrganization, 
  getAvailableOrganizationsForJoin,
  createJoinRequest,
  getUserJoinRequests
} from '@/lib/supabase'

interface Organization {
  id: string
  name: string
  description?: string
  industry?: string
  website?: string
}

interface JoinRequest {
  id: string
  organization_id: string
  status: 'pending' | 'approved' | 'rejected'
  message?: string
  requested_at: string
  organization?: {
    name: string
  }
}

export default function OrganizationRequiredPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [availableOrgs, setAvailableOrgs] = useState<Organization[]>([])
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [message, setMessage] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    const checkOrganizationStatus = async () => {
      if (!user) return

      try {
        // Prüfen ob Benutzer bereits einer Organisation angehört
        const userOrg = await getCurrentUserOrganization()
        if (userOrg.data?.organization_id) {
          // Benutzer hat bereits eine Organisation, weiterleiten
          router.push('/dashboard')
          return
        }

        // Verfügbare Organisationen laden
        const orgsResult = await getAvailableOrganizationsForJoin()
        if (orgsResult.data) {
          setAvailableOrgs(orgsResult.data)
        }

        // Bestehende Join-Requests laden
        const requestsResult = await getUserJoinRequests()
        if (requestsResult.data) {
          setJoinRequests(requestsResult.data)
        }

      } catch (error) {
        console.error('Error checking organization status:', error)
      } finally {
        setLoadingData(false)
      }
    }

    if (user) {
      checkOrganizationStatus()
    }
  }, [user, router])

  const handleJoinRequest = async () => {
    if (!selectedOrg || !adminEmail.trim()) {
      alert('Bitte wählen Sie eine Organisation und geben Sie eine Admin-E-Mail ein.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createJoinRequest({
        organization_id: selectedOrg.id,
        admin_email: adminEmail.trim(),
        message: message.trim() || undefined
      })

      if (result.data) {
        alert('Beitrittsanfrage erfolgreich gesendet!')
        
        // Refresh join requests
        const requestsResult = await getUserJoinRequests()
        if (requestsResult.data) {
          setJoinRequests(requestsResult.data)
        }
        
        // Reset form
        setSelectedOrg(null)
        setMessage('')
        setAdminEmail('')
      } else {
        alert('Fehler beim Senden der Anfrage: ' + (
          typeof result.error === 'string' ? result.error : result.error?.message || 'Unbekannter Fehler'
        ))
      }
    } catch (error) {
      console.error('Error creating join request:', error)
      alert('Fehler beim Senden der Anfrage')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Building2 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Organisation erforderlich
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Um das CRM zu nutzen, müssen Sie einer Organisation angehören. 
            Wählen Sie eine bestehende Organisation oder bitten Sie um Einladung.
          </p>
        </div>

        {/* Existing Join Requests */}
        {joinRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Ihre Beitrittsanfragen</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {joinRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{request.organization?.name}</div>
                      <div className="text-sm text-gray-600">
                        Angefragt am {new Date(request.requested_at).toLocaleDateString('de-DE')}
                      </div>
                      {request.message && (
                        <div className="text-sm text-gray-500 mt-1">
                          &quot;{request.message}&quot;
                        </div>
                      )}
                    </div>
                    <Badge 
                      variant={
                        request.status === 'approved' ? 'default' :
                        request.status === 'rejected' ? 'destructive' : 'secondary'
                      }
                    >
                      {request.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {request.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {request.status === 'rejected' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {request.status === 'pending' ? 'Ausstehend' :
                       request.status === 'approved' ? 'Genehmigt' : 'Abgelehnt'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Organizations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Einer Organisation beitreten</span>
            </CardTitle>
            <CardDescription>
              Wählen Sie eine Organisation und senden Sie eine Beitrittsanfrage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Organization Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableOrgs.map((org) => (
                <div
                  key={org.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedOrg?.id === org.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedOrg(org)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Building2 className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    {org.website && (
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{org.name}</h3>
                  {org.description && (
                    <p className="text-sm text-gray-600 mb-2">{org.description}</p>
                  )}
                  {org.industry && (
                    <Badge variant="outline" className="text-xs">
                      {org.industry}
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {availableOrgs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Keine verfügbaren Organisationen gefunden.</p>
                <p className="text-sm mt-1">
                  Kontaktieren Sie einen Administrator, um eine neue Organisation zu erstellen.
                </p>
              </div>
            )}

            {/* Join Request Form */}
            {selectedOrg && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-medium text-gray-900">
                  Beitrittsanfrage für &quot;{selectedOrg.name}&quot;
                </h3>
                
                <div>
                  <Label htmlFor="adminEmail">
                    Admin E-Mail <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@organisation.de"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    E-Mail eines Administrators der Organisation
                  </p>
                </div>

                <div>
                  <Label htmlFor="message">Nachricht (optional)</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Kurze Beschreibung, warum Sie dieser Organisation beitreten möchten..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleJoinRequest}
                  disabled={isSubmitting || !adminEmail.trim()}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Anfrage wird gesendet...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Beitrittsanfrage senden
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">
                Keine passende Organisation gefunden?
              </p>
              <p>
                Kontaktieren Sie Ihren Administrator oder wenden Sie sich an den Support,
                um eine neue Organisation zu erstellen.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
