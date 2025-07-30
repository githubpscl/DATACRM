'use client'

import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User,
  Users,
  Plug,
  Bell,
  Shield,
  CreditCard,
  Database,
  Mail,
  Smartphone
} from 'lucide-react'

const settingsSections = [
  {
    name: 'Profil',
    description: 'Persönliche Informationen und Account-Einstellungen',
    icon: User,
    href: '/dashboard/settings/profile',
    color: 'blue'
  },
  {
    name: 'Team',
    description: 'Teammitglieder verwalten und Rollen zuweisen',
    icon: Users,
    href: '/dashboard/settings/team',
    color: 'green'
  },
  {
    name: 'Integrationen',
    description: 'API-Verbindungen und externe Services',
    icon: Plug,
    href: '/dashboard/settings/integrations',
    color: 'purple'
  },
  {
    name: 'Benachrichtigungen',
    description: 'E-Mail und Push-Benachrichtigungen konfigurieren',
    icon: Bell,
    href: '/dashboard/settings/notifications',
    color: 'orange'
  },
  {
    name: 'Sicherheit',
    description: '2FA, Passwort und Sicherheitseinstellungen',
    icon: Shield,
    href: '/dashboard/settings/security',
    color: 'red'
  },
  {
    name: 'Abrechnung',
    description: 'Subscription und Zahlungsmethoden',
    icon: CreditCard,
    href: '/dashboard/settings/billing',
    color: 'yellow'
  }
]

const connectedIntegrations = [
  {
    name: 'Supabase',
    type: 'Database',
    status: 'connected',
    icon: Database,
    description: 'Haupt-Datenbank für Kunden und Kampagnen'
  },
  {
    name: 'SendGrid',
    type: 'Email Service',
    status: 'disconnected',
    icon: Mail,
    description: 'E-Mail Versand-Service'
  },
  {
    name: 'WhatsApp Business API',
    type: 'Messaging',
    status: 'pending',
    icon: Smartphone,
    description: 'WhatsApp-Nachrichten versenden'
  }
]

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Einstellungen</h1>
          <p className="text-gray-600 mt-1">
            Verwalte dein Account, Team und Integrationen
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsSections.map((section) => {
            const Icon = section.icon
            return (
              <Card key={section.name} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg bg-${section.color}-100 group-hover:bg-${section.color}-200 transition-colors`}>
                      <Icon className={`h-6 w-6 text-${section.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-gray-700">
                        {section.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Account Übersicht
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Plan</span>
                <Badge>Kostenlos</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Kunden</span>
                <span className="text-sm text-gray-900">12,847 / ∞</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">E-Mails/Monat</span>
                <span className="text-sm text-gray-900">2,456 / 10,000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Storage</span>
                <span className="text-sm text-gray-900">245 MB / 500 MB</span>
              </div>
              <div className="pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  Plan upgraden
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Integrations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plug className="h-5 w-5 mr-2 text-purple-600" />
                Integrationen
              </CardTitle>
              <CardDescription>
                Verbundene Services und APIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connectedIntegrations.map((integration) => {
                  const Icon = integration.icon
                  return (
                    <div key={integration.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Icon className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{integration.name}</h4>
                          <p className="text-xs text-gray-500">{integration.description}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          integration.status === 'connected' ? 'default' : 
                          integration.status === 'pending' ? 'secondary' : 
                          'destructive'
                        }
                      >
                        {integration.status}
                      </Badge>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  Neue Integration hinzufügen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-600" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-lg font-semibold text-green-900">Operational</div>
                <div className="text-sm text-green-700">Alle Systeme funktionieren</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-lg font-semibold text-blue-900">99.9% Uptime</div>
                <div className="text-sm text-blue-700">Letzte 30 Tage</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-lg font-semibold text-purple-900">&lt; 200ms</div>
                <div className="text-sm text-purple-700">Durchschnittliche Antwortzeit</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
