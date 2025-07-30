'use client'

import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  GitBranch, 
  Plus,
  Play,
  Pause,
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  Bot,
  Eye,
  Edit,
  Copy,
  Trash2
} from 'lucide-react'

const journeyStats = {
  totalJourneys: 7,
  activeJourneys: 5,
  totalContacts: 12847,
  conversionRate: 23.4
}

const activeJourneys = [
  {
    id: 1,
    name: 'Willkommens-Journey',
    status: 'ACTIVE',
    contacts: 1234,
    conversionRate: 28.5,
    steps: 5,
    lastModified: '2024-01-20',
    revenue: 15600
  },
  {
    id: 2,
    name: 'Abandoned Cart Recovery',
    status: 'ACTIVE',
    contacts: 892,
    conversionRate: 42.1,
    steps: 3,
    lastModified: '2024-01-18',
    revenue: 28400
  },
  {
    id: 3,
    name: 'Post-Purchase Follow-up',
    status: 'DRAFT',
    contacts: 0,
    conversionRate: 0,
    steps: 4,
    lastModified: '2024-01-15',
    revenue: 0
  }
]

export default function CustomerJourneysPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Journeys</h1>
            <p className="text-gray-600 mt-1">
              Automatisierte Kundenreisen für personalisierte Kommunikation
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neue Journey
          </Button>
        </div>

        {/* Journey Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Gesamt Journeys</p>
                  <p className="text-2xl font-bold text-gray-900">{journeyStats.totalJourneys}</p>
                </div>
                <GitBranch className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aktive Journeys</p>
                  <p className="text-2xl font-bold text-gray-900">{journeyStats.activeJourneys}</p>
                </div>
                <Play className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aktive Kontakte</p>
                  <p className="text-2xl font-bold text-gray-900">{journeyStats.totalContacts.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{journeyStats.conversionRate}%</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">+5.2% vs. letzter Monat</span>
                  </div>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="h-5 w-5 mr-2 text-purple-600" />
              KI-Insights für Customer Journeys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <h4 className="font-medium text-blue-900">🚀 Performance-Optimierung</h4>
                <p className="text-sm text-blue-800 mt-2">
                  Die &quot;Abandoned Cart Recovery&quot; Journey zeigt die beste Performance mit 42.1% Conversion. 
                  Erwägen Sie ähnliche Timing-Strategien für andere Journeys.
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <h4 className="font-medium text-green-900">📧 Optimaler Sendezeit</h4>
                <p className="text-sm text-green-800 mt-2">
                  E-Mails in Journeys haben zwischen 14-16 Uhr die höchste Öffnungsrate (31.2%). 
                  Passen Sie Ihre Journey-Timings entsprechend an.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Journeys */}
        <Card>
          <CardHeader>
            <CardTitle>Alle Customer Journeys</CardTitle>
            <CardDescription>
              Übersicht über aktive und geplante automatisierte Kundenreisen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeJourneys.map((journey) => (
                <div key={journey.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <GitBranch className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{journey.name}</h4>
                        <Badge variant={journey.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {journey.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-600 mt-1">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {journey.contacts.toLocaleString()} Kontakte
                        </span>
                        <span className="flex items-center">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          {journey.conversionRate}% Conversion
                        </span>
                        <span className="flex items-center">
                          <GitBranch className="h-4 w-4 mr-1" />
                          {journey.steps} Schritte
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {journey.lastModified}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(journey.revenue)}
                      </div>
                      <div className="text-sm text-gray-500">Umsatz</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        {journey.status === 'ACTIVE' ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
