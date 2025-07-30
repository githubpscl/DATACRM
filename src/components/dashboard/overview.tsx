'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Mail, 
  TrendingUp, 
  DollarSign,
  Eye,
  Clock,
  BarChart3,
  Plus,
  ArrowRight,
  Bot,
  Activity
} from 'lucide-react'

const stats = {
  totalCustomers: 12847,
  emailsSent: 45632,
  revenue: 284750,
  conversionRate: 23.4,
  openRate: 31.2,
  clickRate: 8.7
}

const recentActivity = [
  {
    id: 1,
    type: 'campaign',
    title: 'Newsletter Januar gesendet',
    description: '2.847 E-Mails erfolgreich zugestellt',
    time: '2 Stunden',
    status: 'success'
  },
  {
    id: 2,
    type: 'import',
    title: 'Kundendaten importiert',
    description: '156 neue Kontakte hinzugefügt',
    time: '4 Stunden',
    status: 'success'
  },
  {
    id: 3,
    type: 'journey',
    title: 'Willkommens-Journey aktiviert',
    description: 'Automatisierte Sequenz für neue Kunden',
    time: '1 Tag',
    status: 'active'
  }
]

const quickActions = [
  {
    title: 'Neue Kampagne',
    description: 'E-Mail oder WhatsApp Kampagne erstellen',
    icon: Mail,
    href: '/dashboard/campaigns/create',
    color: 'blue'
  },
  {
    title: 'Kunden importieren',
    description: 'CSV-Datei oder API-Import',
    icon: Users,
    href: '/dashboard/data-import',
    color: 'green'
  },
  {
    title: 'Journey erstellen',
    description: 'Automatisierte Kundenreise einrichten',
    icon: Activity,
    href: '/dashboard/journeys/create',
    color: 'purple'
  }
]

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtkunden</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% vom letzten Monat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">E-Mails gesendet</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emailsSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +8% vom letzten Monat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Umsatz</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +23% vom letzten Monat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% vom letzten Monat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Öffnungsrate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openRate}%</div>
            <p className="text-xs text-muted-foreground">
              +1.2% vom letzten Monat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Klickrate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clickRate}%</div>
            <p className="text-xs text-muted-foreground">
              +0.8% vom letzten Monat
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Schnellaktionen
            </CardTitle>
            <CardDescription>
              Häufig verwendete Funktionen schnell erreichen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <div key={action.title} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      action.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      action.color === 'green' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">{action.title}</h4>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Letzte Aktivitäten
            </CardTitle>
            <CardDescription>
              Übersicht über die neuesten Systemaktivitäten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={`p-2 rounded-full ${
                  activity.status === 'success' ? 'bg-green-100 text-green-600' :
                  activity.status === 'active' ? 'bg-blue-100 text-blue-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {activity.type === 'campaign' && <Mail className="h-3 w-3" />}
                  {activity.type === 'import' && <Users className="h-3 w-3" />}
                  {activity.type === 'journey' && <Activity className="h-3 w-3" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{activity.title}</h4>
                  <p className="text-xs text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">vor {activity.time}</p>
                </div>
                <Badge variant={activity.status === 'success' ? 'default' : 'secondary'}>
                  {activity.status === 'success' ? 'Erfolgreich' : 'Aktiv'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            KI-Einblicke & Empfehlungen
          </CardTitle>
          <CardDescription>
            Personalisierte Empfehlungen basierend auf Ihren Daten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <h4 className="font-medium text-blue-900">📈 Performance-Trend</h4>
              <p className="text-sm text-blue-800 mt-2">
                Ihre E-Mail-Kampagnen zeigen eine positive Entwicklung. Die Öffnungsrate ist um 15% gestiegen. 
                Optimal wären jetzt personalisierte Follow-up Nachrichten.
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <h4 className="font-medium text-green-900">🎯 Segmentierung</h4>
              <p className="text-sm text-green-800 mt-2">
                23% Ihrer Kunden sind hochaktiv. Erstellen Sie ein Premium-Segment für gezielte 
                Upselling-Kampagnen mit personalisierten Angeboten.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
