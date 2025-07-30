'use client'

import React, { useState } from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Shield,
  Smartphone,
  Key,
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw,
  Monitor,
  MapPin,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react'

interface LoginSession {
  id: string
  device: string
  location: string
  lastActive: string
  current: boolean
  browser: string
  ip: string
}

export default function SecurityPage() {
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  
  const [loginSessions] = useState<LoginSession[]>([
    {
      id: '1',
      device: 'Windows Desktop',
      location: 'Berlin, Deutschland',
      lastActive: 'Gerade aktiv',
      current: true,
      browser: 'Chrome 119',
      ip: '192.168.1.100'
    },
    {
      id: '2',
      device: 'iPhone 15 Pro',
      location: 'Berlin, Deutschland',
      lastActive: 'Vor 2 Stunden',
      current: false,
      browser: 'Safari Mobile',
      ip: '192.168.1.101'
    },
    {
      id: '3',
      device: 'MacBook Pro',
      location: 'München, Deutschland',
      lastActive: 'Gestern',
      current: false,
      browser: 'Firefox 120',
      ip: '10.0.0.50'
    }
  ])

  const backupCodes = [
    '1234-5678-90AB',
    'CDEF-1234-5678',
    '90AB-CDEF-1234',
    '5678-90AB-CDEF',
    '1234-CDEF-5678',
    '90AB-1234-CDEF'
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sicherheit</h1>
          <p className="text-gray-600 mt-1">Verwalten Sie Ihre Sicherheitseinstellungen und schützen Sie Ihr Konto</p>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Passwort</h3>
              <p className="text-sm text-gray-600 mt-1">Stark und sicher</p>
              <Badge className="bg-green-100 text-green-800 mt-2">Aktiv</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className={`p-3 ${twoFactorEnabled ? 'bg-green-100' : 'bg-yellow-100'} rounded-full w-fit mx-auto mb-3`}>
                <Smartphone className={`h-6 w-6 ${twoFactorEnabled ? 'text-green-600' : 'text-yellow-600'}`} />
              </div>
              <h3 className="font-semibold text-gray-900">2FA</h3>
              <p className="text-sm text-gray-600 mt-1">Zwei-Faktor-Authentifizierung</p>
              <Badge className={twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                {twoFactorEnabled ? 'Aktiv' : 'Inaktiv'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Aktivität</h3>
              <p className="text-sm text-gray-600 mt-1">Letzte Aktivität überwacht</p>
              <Badge className="bg-blue-100 text-blue-800 mt-2">Normal</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="h-5 w-5 mr-2 text-blue-600" />
              Zwei-Faktor-Authentifizierung (2FA)
            </CardTitle>
            <CardDescription>
              Erhöhen Sie die Sicherheit Ihres Kontos mit einer zusätzlichen Schutzebene
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!twoFactorEnabled ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <h4 className="font-medium text-yellow-800">2FA ist nicht aktiviert</h4>
                    <p className="text-sm text-yellow-700">Aktivieren Sie 2FA für zusätzliche Sicherheit</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button onClick={() => setTwoFactorEnabled(true)}>
                    2FA aktivieren
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-800">2FA ist aktiviert</h4>
                      <p className="text-sm text-green-700">Ihr Konto ist durch 2FA geschützt</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button variant="outline" onClick={() => setShowBackupCodes(true)}>
                    <Download className="mr-2 h-4 w-4" />
                    Backup-Codes anzeigen
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Neue Codes generieren
                  </Button>
                  <Button variant="outline" onClick={() => setTwoFactorEnabled(false)}>
                    2FA deaktivieren
                  </Button>
                </div>
              </div>
            )}

            {showBackupCodes && (
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">Backup-Codes</CardTitle>
                  <CardDescription>
                    Bewahren Sie diese Codes sicher auf. Sie können jeden Code nur einmal verwenden.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg font-mono text-sm text-center">
                        {code}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <Button size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Als PDF herunterladen
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowBackupCodes(false)}>
                      Schließen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2 text-blue-600" />
              Passwort-Einstellungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentPass">Aktuelles Passwort</Label>
                <Input id="currentPass" type="password" />
              </div>
              <div>
                <Label htmlFor="newPass">Neues Passwort</Label>
                <Input id="newPass" type="password" />
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Passwort-Anforderungen:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Mindestens 8 Zeichen</li>
                <li>• Ein Großbuchstabe</li>
                <li>• Ein Kleinbuchstabe</li>
                <li>• Eine Zahl</li>
                <li>• Ein Sonderzeichen</li>
              </ul>
            </div>

            <Button>Passwort aktualisieren</Button>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2 text-blue-600" />
              API-Schlüssel
            </CardTitle>
            <CardDescription>
              Verwalten Sie API-Schlüssel für Integrationen mit Drittanbietern
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Haupt-API-Schlüssel</h4>
                  <p className="text-sm text-gray-600">Erstellt am 15. Januar 2024</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="font-mono text-sm bg-gray-50 px-3 py-1 rounded">
                    {showApiKey ? 'sk_live_1234567890abcdef' : '••••••••••••••••'}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline">
                Neuen Schlüssel erstellen
              </Button>
              <Button variant="outline">
                Schlüssel regenerieren
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="h-5 w-5 mr-2 text-blue-600" />
              Aktive Sitzungen
            </CardTitle>
            <CardDescription>
              Übersicht über alle Geräte, auf denen Sie angemeldet sind
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loginSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Monitor className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                        <span>{session.device}</span>
                        {session.current && (
                          <Badge className="bg-green-100 text-green-800">Aktuell</Badge>
                        )}
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <Monitor className="h-3 w-3" />
                            <span>{session.browser}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{session.location}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{session.lastActive}</span>
                          </span>
                          <span className="text-gray-400">IP: {session.ip}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {!session.current && (
                    <Button variant="outline" size="sm">
                      Sitzung beenden
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline">
                Alle anderen Sitzungen beenden
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Deletion */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Gefahrenbereich
            </CardTitle>
            <CardDescription>
              Irreversible Aktionen für Ihr Konto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Konto löschen</h4>
              <p className="text-sm text-red-700 mb-4">
                Das Löschen Ihres Kontos ist irreversibel. Alle Ihre Daten, Kampagnen und Einstellungen werden dauerhaft entfernt.
              </p>
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                Konto löschen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
