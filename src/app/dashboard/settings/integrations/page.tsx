'use client'

import React, { useState } from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Plug,
  Mail,
  Smartphone,
  Database,
  Webhook,
  Key,
  Settings,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: 'connected' | 'disconnected' | 'error'
  category: 'email' | 'crm' | 'analytics' | 'messaging' | 'automation'
  lastSync?: string
  setupDate?: string
  apiKey?: string
}

interface Webhook {
  id: string
  url: string
  events: string[]
  status: 'active' | 'inactive'
  lastTriggered: string
}

export default function IntegrationsPage() {
  const [showWebhookForm, setShowWebhookForm] = useState(false)
  const [newWebhook, setNewWebhook] = useState({ url: '', events: [] as string[] })
  
  const [integrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'Mailchimp',
      description: 'E-Mail-Marketing-Plattform für Newsletter und Kampagnen',
      icon: Mail,
      status: 'connected',
      category: 'email',
      lastSync: 'Vor 2 Stunden',
      setupDate: '15. Jan 2024',
      apiKey: 'mc_live_1234567890'
    },
    {
      id: '2',
      name: 'Salesforce',
      description: 'CRM-System für Kundenmanagement und Vertrieb',
      icon: Database,
      status: 'connected',
      category: 'crm',
      lastSync: 'Vor 1 Stunde',
      setupDate: '22. Jan 2024'
    },
    {
      id: '3',
      name: 'WhatsApp Business',
      description: 'Messaging-Platform für WhatsApp-Kommunikation',
      icon: Smartphone,
      status: 'error',
      category: 'messaging',
      lastSync: 'Fehler bei letzter Sync',
      setupDate: '3. Feb 2024'
    },
    {
      id: '4',
      name: 'Google Analytics',
      description: 'Web-Analytics für detaillierte Nutzeranalysen',
      icon: Database,
      status: 'disconnected',
      category: 'analytics'
    },
    {
      id: '5',
      name: 'Zapier',
      description: 'Automation-Platform für Workflow-Integration',
      icon: Plug,
      status: 'connected',
      category: 'automation',
      lastSync: 'Vor 30 Minuten',
      setupDate: '10. Feb 2024'
    }
  ])

  const [webhooks] = useState<Webhook[]>([
    {
      id: '1',
      url: 'https://api.example.com/webhooks/campaigns',
      events: ['campaign.sent', 'campaign.opened'],
      status: 'active',
      lastTriggered: 'Vor 2 Stunden'
    },
    {
      id: '2',
      url: 'https://crm.company.com/datacrm-webhook',
      events: ['customer.created', 'customer.updated'],
      status: 'active',
      lastTriggered: 'Vor 1 Tag'
    }
  ])

  const eventTypes = [
    'customer.created',
    'customer.updated',
    'customer.deleted',
    'campaign.sent',
    'campaign.opened',
    'campaign.clicked',
    'journey.started',
    'journey.completed'
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'disconnected':
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'email': return 'bg-blue-100 text-blue-800'
      case 'crm': return 'bg-purple-100 text-purple-800'
      case 'analytics': return 'bg-green-100 text-green-800'
      case 'messaging': return 'bg-yellow-100 text-yellow-800'
      case 'automation': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Integrationen</h1>
            <p className="text-gray-600 mt-1">Verbinden Sie externe Services und APIs mit Ihrem DataCRM</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Neue Integration
          </Button>
        </div>

        {/* Integration Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Verbunden</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {integrations.filter(i => i.status === 'connected').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Fehler</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {integrations.filter(i => i.status === 'error').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
                <Webhook className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Webhooks</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{webhooks.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3">
                <Key className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">API-Keys</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {integrations.filter(i => i.apiKey).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Available Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plug className="h-5 w-5 mr-2 text-blue-600" />
              Verfügbare Integrationen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.map((integration) => {
                const Icon = integration.icon
                return (
                  <div key={integration.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                          <Badge className={getCategoryColor(integration.category)} variant="secondary">
                            {integration.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(integration.status)}
                        <Badge className={getStatusColor(integration.status)}>
                          {integration.status === 'connected' ? 'Verbunden' :
                           integration.status === 'error' ? 'Fehler' : 'Getrennt'}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

                    {integration.status === 'connected' && (
                      <div className="text-xs text-gray-500 mb-3 space-y-1">
                        <div>Letzte Sync: {integration.lastSync}</div>
                        <div>Eingerichtet: {integration.setupDate}</div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {integration.status === 'connected' ? (
                        <>
                          <Button variant="outline" size="sm">
                            <Settings className="mr-2 h-4 w-4" />
                            Konfigurieren
                          </Button>
                          <Button variant="outline" size="sm">
                            Trennen
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" className="w-full">
                          {integration.status === 'error' ? 'Reparieren' : 'Verbinden'}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Webhook className="h-5 w-5 mr-2 text-blue-600" />
                Webhooks
              </CardTitle>
              <Button onClick={() => setShowWebhookForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Webhook hinzufügen
              </Button>
            </div>
            <CardDescription>
              Konfigurieren Sie Webhooks, um automatisch über Ereignisse benachrichtigt zu werden
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showWebhookForm && (
              <Card className="border-blue-200 mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Neuen Webhook hinzufügen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      value={newWebhook.url}
                      onChange={(e) => setNewWebhook({...newWebhook, url: e.target.value})}
                      placeholder="https://api.example.com/webhook"
                    />
                  </div>
                  
                  <div>
                    <Label>Ereignisse</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {eventTypes.map((event) => (
                        <label key={event} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newWebhook.events.includes(event)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewWebhook({
                                  ...newWebhook,
                                  events: [...newWebhook.events, event]
                                })
                              } else {
                                setNewWebhook({
                                  ...newWebhook,
                                  events: newWebhook.events.filter(e => e !== event)
                                })
                              }
                            }}
                            className="h-4 w-4 text-blue-600 rounded"
                          />
                          <span className="text-sm text-gray-700">{event}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button>Webhook erstellen</Button>
                    <Button variant="outline" onClick={() => setShowWebhookForm(false)}>
                      Abbrechen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900 font-mono text-sm">
                          {webhook.url}
                        </h4>
                        <Badge className={getStatusColor(webhook.status)}>
                          {webhook.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="secondary" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        Zuletzt ausgelöst: {webhook.lastTriggered}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2 text-blue-600" />
              API-Dokumentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg text-center">
                <h4 className="font-semibold text-gray-900 mb-2">REST API</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Vollständige REST API für alle DataCRM-Funktionen
                </p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Dokumentation
                </Button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg text-center">
                <h4 className="font-semibold text-gray-900 mb-2">GraphQL</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Flexible GraphQL-Schnittstelle für komplexe Abfragen
                </p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Schema Explorer
                </Button>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg text-center">
                <h4 className="font-semibold text-gray-900 mb-2">SDKs</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Offizielle SDKs für verschiedene Programmiersprachen
                </p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Downloads
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
