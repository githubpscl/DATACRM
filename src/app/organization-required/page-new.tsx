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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Building2, 
  UserPlus, 
  Send, 
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Mail,
  Shield,
  ArrowLeft
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

interface ContactAdminForm {
  organizationName: string
  adminEmail: string
  message: string
}

export default function OrganizationRequiredPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [availableOrgs, setAvailableOrgs] = useState<Organization[]>([])
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactForm, setContactForm] = useState<ContactAdminForm>({
    organizationName: '',
    adminEmail: '',
    message: ''
  })
  const [emailSuccess, setEmailSuccess] = useState(false)

  useEffect(() => {
    const checkOrganizationStatus = async () => {
      if (!user) return

      try {
        // Prüfen ob Benutzer bereits einer Organisation angehört
        const userOrg = await getCurrentUserOrganization()
        if (userOrg.data?.id) {
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
    if (!selectedOrg) {
      alert('Bitte wählen Sie eine Organisation aus.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createJoinRequest({
        organization_id: selectedOrg.id,
        admin_email: user?.email || '',
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

  const handleContactAdmin = async () => {
    if (!contactForm.organizationName.trim() || !contactForm.adminEmail.trim() || !contactForm.message.trim()) {
      alert('Bitte füllen Sie alle Felder aus.')
      return
    }

    setIsSubmitting(true)
    try {
      // Email simulieren (in echter Anwendung würde hier ein Email-Service verwendet)
      const emailContent = `
Von: ${user?.email}
An: ${contactForm.adminEmail}
Betreff: Bitte um Aufnahme in Organisation "${contactForm.organizationName}"

Hallo,

ich würde gerne der Organisation "${contactForm.organizationName}" beitreten.

${contactForm.message}

Meine Daten:
- E-Mail: ${user?.email}
- Name: ${user?.firstName} ${user?.lastName}

Vielen Dank!

Mit freundlichen Grüßen
${user?.firstName} ${user?.lastName}
      `
      
      console.log('Email würde gesendet werden:', emailContent)
      
      // Reset form and show success
      setContactForm({ organizationName: '', adminEmail: '', message: '' })
      setEmailSuccess(true)
      setShowContactForm(false)
      
      setTimeout(() => setEmailSuccess(false), 5000)
      
    } catch (error) {
      console.error('Error sending contact email:', error)
      alert('Fehler beim Senden der E-Mail')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Organisationsstatus wird überprüft...</p>
        </div>
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
          <p className="text-gray-600 max-w-2xl mx-auto mb-4">
            Um das CRM zu nutzen, müssen Sie einer Organisation angehören. 
            Sie können einer bestehenden Organisation beitreten oder einen Administrator kontaktieren.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={() => logout()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {emailSuccess && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Ihre Nachricht wurde erfolgreich versendet! Der Administrator wird sich mit Ihnen in Verbindung setzen.
            </AlertDescription>
          </Alert>
        )}

        {/* Existing Join Requests */}
        {joinRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Ihre Beitrittsanfragen</span>
              </CardTitle>
              <CardDescription>
                Status Ihrer eingereichten Beitrittsanfragen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {joinRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{request.organization?.name}</div>
                      <div className="text-sm text-gray-600">
                        Angefragt am {new Date(request.requested_at).toLocaleDateString('de-DE')}
                      </div>
                      {request.message && (
                        <div className="text-sm text-gray-500 mt-1">
                          Nachricht: &quot;{request.message}&quot;
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
        {!showContactForm && (
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
              {availableOrgs.length > 0 ? (
                <>
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

                  {/* Join Request Form */}
                  {selectedOrg && (
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-medium text-gray-900">
                        Beitrittsanfrage für &quot;{selectedOrg.name}&quot;
                      </h3>
                      
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
                        disabled={isSubmitting}
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
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="mb-2">Keine verfügbaren Organisationen gefunden.</p>
                  <p className="text-sm">
                    Alle verfügbaren Organisationen wurden bereits angefragt oder Sie sind bereits Mitglied.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contact Administrator Form */}
        {showContactForm ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Administrator kontaktieren</span>
              </CardTitle>
              <CardDescription>
                Senden Sie eine E-Mail an einen Administrator, um Ihrer Organisation beizutreten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="orgName">Name der Organisation</Label>
                <Input
                  id="orgName"
                  value={contactForm.organizationName}
                  onChange={(e) => setContactForm({...contactForm, organizationName: e.target.value})}
                  placeholder="Firmenname oder Organisationsname"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="adminEmail">Administrator E-Mail</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={contactForm.adminEmail}
                  onChange={(e) => setContactForm({...contactForm, adminEmail: e.target.value})}
                  placeholder="admin@firma.de"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contactMessage">Nachricht</Label>
                <Textarea
                  id="contactMessage"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  placeholder="Beschreiben Sie, warum Sie der Organisation beitreten möchten..."
                  className="mt-1"
                  rows={4}
                />
              </div>

              <div className="flex space-x-3">
                <Button 
                  onClick={handleContactAdmin}
                  disabled={isSubmitting || !contactForm.organizationName.trim() || !contactForm.adminEmail.trim() || !contactForm.message.trim()}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      E-Mail wird gesendet...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      E-Mail senden
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowContactForm(false)}
                  disabled={isSubmitting}
                >
                  Abbrechen
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Alternative: Administrator kontaktieren</span>
              </CardTitle>
              <CardDescription>
                Falls Ihre Organisation nicht aufgelistet ist, kontaktieren Sie direkt einen Administrator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={() => setShowContactForm(true)}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Administrator per E-Mail kontaktieren
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Help Information */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <h4 className="font-medium text-blue-900 mb-1">Hilfe benötigt?</h4>
                <p className="text-blue-800 mb-2">
                  Falls Sie Probleme beim Beitreten haben oder Ihre Organisation nicht finden:
                </p>
                <ul className="list-disc list-inside text-blue-700 space-y-1">
                  <li>Kontaktieren Sie Ihren IT-Administrator</li>
                  <li>Wenden Sie sich an den DataCRM Support</li>
                  <li>Bitten Sie einen bestehenden Administrator, Sie hinzuzufügen</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
