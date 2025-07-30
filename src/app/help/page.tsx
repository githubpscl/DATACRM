'use client'

import React from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  HelpCircle,
  MessageCircle,
  FileText,
  Video,
  Phone,
  Mail,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react'

const helpCategories = [
  {
    title: 'Erste Schritte',
    description: 'Grundlagen und Setup für neue Benutzer',
    icon: HelpCircle,
    articles: [
      { title: 'Account einrichten', time: '5 min' },
      { title: 'Erste Daten importieren', time: '10 min' },
      { title: 'Dashboard verstehen', time: '8 min' }
    ]
  },
  {
    title: 'Datenmanagement',
    description: 'Import, Export und Verwaltung Ihrer Kundendaten',
    icon: FileText,
    articles: [
      { title: 'CSV-Import Anleitung', time: '12 min' },
      { title: 'Daten-Segmentierung', time: '15 min' },
      { title: 'Deduplizierung einrichten', time: '10 min' }
    ]
  },
  {
    title: 'Kampagnen & Automation',
    description: 'E-Mail-Kampagnen und Customer Journeys erstellen',
    icon: MessageCircle,
    articles: [
      { title: 'E-Mail-Kampagne erstellen', time: '20 min' },
      { title: 'Customer Journey aufsetzen', time: '25 min' },
      { title: 'A/B-Tests durchführen', time: '18 min' }
    ]
  },
  {
    title: 'Integrationen',
    description: 'APIs und Drittanbieter-Services verbinden',
    icon: Search,
    articles: [
      { title: 'WhatsApp Business API', time: '15 min' },
      { title: 'CRM-Integration', time: '12 min' },
      { title: 'Webhook Setup', time: '10 min' }
    ]
  }
]

const supportOptions = [
  {
    title: 'Live Chat',
    description: 'Sofortiger Support für dringende Fragen',
    icon: MessageCircle,
    available: 'Mo-Fr 9:00-18:00',
    action: 'Chat öffnen'
  },
  {
    title: 'E-Mail Support',
    description: 'Detaillierte Anfragen und Dokumentation',
    icon: Mail,
    available: 'Antwort innerhalb 4h',
    action: 'E-Mail senden'
  },
  {
    title: 'Telefon Support',
    description: 'Persönliche Beratung für Premium-Kunden',
    icon: Phone,
    available: 'Mo-Fr 10:00-16:00',
    action: 'Termin buchen'
  }
]

export default function HelpPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Hilfe & Support</h1>
          <p className="text-gray-600 mt-2">
            Finden Sie Antworten auf Ihre Fragen oder kontaktieren Sie unser Support-Team
          </p>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Suchen Sie nach Hilfe-Artikeln, Tutorials oder FAQ..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Help Categories */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Hilfe-Kategorien</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {helpCategories.map((category) => {
              const Icon = category.icon
              return (
                <Card key={category.title} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {category.articles.map((article, index) => (
                        <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                          <span className="text-sm text-gray-700">{article.title}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">{article.time}</span>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Schnelle Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Video className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Video Tutorials</h3>
                <p className="text-sm text-gray-600 mb-4">Schritt-für-Schritt Anleitungen</p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Tutorials ansehen
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">API Dokumentation</h3>
                <p className="text-sm text-gray-600 mb-4">Entwickler-Ressourcen</p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Docs öffnen
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <MessageCircle className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Community Forum</h3>
                <p className="text-sm text-gray-600 mb-4">Austausch mit anderen Nutzern</p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Forum besuchen
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Support Options */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Support kontaktieren</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportOptions.map((option) => {
              const Icon = option.icon
              return (
                <Card key={option.title}>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{option.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                      <p className="text-xs text-gray-500 mb-4">{option.available}</p>
                      <Button className="w-full">
                        {option.action}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              System Status - Alle Services funktionieren
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-green-600">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-600">&lt; 200ms</div>
                <div className="text-sm text-gray-600">Response Time</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-purple-600">0</div>
                <div className="text-sm text-gray-600">Incidents</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-orange-600">Operational</div>
                <div className="text-sm text-gray-600">All Systems</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
