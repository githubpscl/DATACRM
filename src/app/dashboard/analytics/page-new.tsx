'use client'

import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3,
  TrendingUp,
  Users,
  Mail,
  DollarSign,
  Calendar,
  Target
} from 'lucide-react'

const analyticsData = {
  totalRevenue: 284750,
  totalCustomers: 12847,
  emailsSent: 45632,
  avgOpenRate: 31.2,
  avgClickRate: 8.7,
  conversionRate: 23.4,
  monthlyGrowth: 12.3,
  campaignsActive: 7
}

const performanceMetrics = [
  {
    title: 'Beste E-Mail-Kampagne',
    value: 'Newsletter Januar',
    metric: '47.2% Öffnungsrate',
    change: '+12.4%',
    trend: 'up'
  },
  {
    title: 'Top Customer Journey',
    value: 'Willkommens-Sequenz',
    metric: '34.8% Conversion',
    change: '+8.1%',
    trend: 'up'
  },
  {
    title: 'Stärkste Region',
    value: 'Deutschland Nord',
    metric: '€48.2k Umsatz',
    change: '+23.7%',
    trend: 'up'
  },
  {
    title: 'Aktivste Kundengruppe',
    value: 'Premium Segment',
    metric: '89% Engagement',
    change: '+5.3%',
    trend: 'up'
  }
]

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Statistiken</h1>
          <p className="text-gray-600 mt-1">Umfassende Analyse Ihrer CRM-Performance</p>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamtumsatz</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{analyticsData.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{analyticsData.monthlyGrowth}%</span> vom letzten Monat
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktive Kunden</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalCustomers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8.2%</span> neue Registrierungen
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">E-Mails gesendet</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.emailsSent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Ø Öffnungsrate: <span className="font-medium">{analyticsData.avgOpenRate}%</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2.1%</span> Verbesserung
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Performance Metriken
              </CardTitle>
              <CardDescription>
                Ihre erfolgreichsten Kampagnen und Aktivitäten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{metric.title}</h4>
                    <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                    <p className="text-sm text-gray-600">{metric.metric}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={metric.trend === 'up' ? 'default' : 'secondary'}>
                      {metric.change}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Campaign Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Kampagnen-Performance
              </CardTitle>
              <CardDescription>
                Aktuelle Kampagnen im Überblick
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Newsletter Januar</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '47%'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">47.2%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Produkt Launch</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '31%'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">31.4%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Black Friday</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: '28%'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">28.9%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Willkommens-Serie</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{width: '24%'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">24.1%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monatliche Entwicklung
            </CardTitle>
            <CardDescription>
              Ihre CRM-Performance der letzten 6 Monate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {['Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'].map((month, index) => (
                <div key={month} className="text-center p-4 border rounded-lg">
                  <h4 className="text-sm font-medium text-gray-600">{month}</h4>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    €{(45 + index * 8 + Math.random() * 10).toFixed(0)}k
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    +{(5 + index * 2).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
