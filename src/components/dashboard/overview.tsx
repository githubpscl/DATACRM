'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/auth-provider'
import { useState, useEffect } from 'react'
import { getAnalyticsData } from '@/lib/supabase'
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
  Activity,
  Shield,
  AlertCircle
} from 'lucide-react'

interface AnalyticsData {
  totalCustomers: number
  activeCustomers: number
  newCustomersThisMonth: number
  leadsCount: number
  prospectsCount: number
  customerGrowthRate: number
  customersByStatus: { [key: string]: number }
  customersByType: { person: number; company: number }
  topIndustries: { industry: string; count: number }[]
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
  const { user } = useAuth()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      const { data, error } = await getAnalyticsData()
      
      if (error) {
        console.error('Error loading analytics data:', error)
        setAnalyticsData(null)
      } else {
        setAnalyticsData(data as AnalyticsData)
      }
    } catch (error) {
      console.error('Error loading analytics data:', error)
      setAnalyticsData(null)
    } finally {
      setLoading(false)
    }
  }
  
  // Check if user is super admin
  const isSuperAdmin = user?.email === 'testdatacrmpascal@gmail.com'
  
  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="mb-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Willkommen im DataCRM Dashboard, {user?.email}!
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Badge variant={isSuperAdmin ? "destructive" : "secondary"}>
                    {isSuperAdmin ? "Super Admin" : "Demo User"}
                  </Badge>
                  {isSuperAdmin && (
                    <span className="text-sm text-muted-foreground">
                      Vollzugriff auf alle Admin-Funktionen
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg border">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">System-Status & Einrichtung:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Führen Sie die SQL-Skripte in Supabase aus (database-setup.sql)</li>
                    <li>• Verwalten Sie Organisationen unter Einstellungen → Organisationen</li>
                    <li>• Team & Berechtigungen unter Einstellungen → Team & Berechtigungen</li>
                    <li>• Session automatisch gespeichert (10 Min. Inaktivitäts-Timeout)</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtkunden</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : (analyticsData?.totalCustomers.toLocaleString() || '0')}
            </div>
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
            <div className="text-2xl font-bold">
              {loading ? '...' : (analyticsData?.activeCustomers.toLocaleString() || '0')}
            </div>
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
            <div className="text-2xl font-bold">
              {loading ? '...' : `${analyticsData?.leadsCount.toLocaleString() || '0'} Leads`}
            </div>
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
            <div className="text-2xl font-bold">
              {loading ? '...' : `${analyticsData?.customerGrowthRate || 0}%`}
            </div>
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
            <div className="text-2xl font-bold">
              {loading ? '...' : `${analyticsData?.newCustomersThisMonth || 0}`}
            </div>
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
            <div className="text-2xl font-bold">
              {loading ? '...' : `${analyticsData?.prospectsCount || 0}`}
            </div>
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
