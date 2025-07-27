'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiCall } from '@/components/auth-provider'
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Mail,
  MousePointer,
  Target,
  DollarSign,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Activity,
  Zap,
  Award
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalCustomers: number
    totalCampaigns: number
    totalRevenue: number
    averageOrderValue: number
    customerGrowthRate: number
    campaignSuccessRate: number
  }
  campaignMetrics: {
    totalSent: number
    deliveryRate: number
    openRate: number
    clickRate: number
    conversionRate: number
    unsubscribeRate: number
  }
  revenueMetrics: {
    totalRevenue: number
    monthlyRecurringRevenue: number
    averageCustomerValue: number
    customerLifetimeValue: number
  }
  customerMetrics: {
    totalCustomers: number
    activeCustomers: number
    newCustomers: number
    churnRate: number
    segmentBreakdown: { [key: string]: number }
  }
  topCampaigns: Array<{
    id: string
    name: string
    type: string
    sent: number
    openRate: number
    clickRate: number
    revenue: number
  }>
  monthlyTrends: Array<{
    month: string
    customers: number
    revenue: number
    campaigns: number
  }>
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const response = await apiCall(`/api/analytics?timeRange=${timeRange}`)
      setAnalytics(response.analytics || getMockAnalytics())
    } catch (error) {
      console.error('Error loading analytics:', error)
      setAnalytics(getMockAnalytics())
    } finally {
      setLoading(false)
    }
  }

  const getMockAnalytics = (): AnalyticsData => ({
    overview: {
      totalCustomers: 2847,
      totalCampaigns: 23,
      totalRevenue: 145670,
      averageOrderValue: 287.50,
      customerGrowthRate: 12.5,
      campaignSuccessRate: 78.3
    },
    campaignMetrics: {
      totalSent: 45680,
      deliveryRate: 98.7,
      openRate: 24.3,
      clickRate: 4.2,
      conversionRate: 2.8,
      unsubscribeRate: 0.3
    },
    revenueMetrics: {
      totalRevenue: 145670,
      monthlyRecurringRevenue: 23450,
      averageCustomerValue: 287.50,
      customerLifetimeValue: 1245.80
    },
    customerMetrics: {
      totalCustomers: 2847,
      activeCustomers: 2234,
      newCustomers: 234,
      churnRate: 3.2,
      segmentBreakdown: {
        'Premium': 456,
        'Standard': 1678,
        'Basic': 713
      }
    },
    topCampaigns: [
      {
        id: '1',
        name: 'Willkommensserie Neukunden',
        type: 'email',
        sent: 1250,
        openRate: 32.4,
        clickRate: 8.7,
        revenue: 12450
      },
      {
        id: '2',
        name: 'Black Friday Sale',
        type: 'mixed',
        sent: 5400,
        openRate: 28.9,
        clickRate: 6.2,
        revenue: 87650
      },
      {
        id: '3',
        name: 'Produktupdate Ankündigung',
        type: 'email',
        sent: 3200,
        openRate: 35.7,
        clickRate: 12.4,
        revenue: 5670
      }
    ],
    monthlyTrends: [
      { month: 'Jan', customers: 2234, revenue: 34560, campaigns: 8 },
      { month: 'Feb', customers: 2456, revenue: 38970, campaigns: 12 },
      { month: 'Mar', customers: 2678, revenue: 42340, campaigns: 9 },
      { month: 'Apr', customers: 2847, revenue: 45670, campaigns: 15 }
    ]
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const refreshAnalytics = async () => {
    setRefreshing(true)
    await loadAnalytics()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Lade Analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return <div>Fehler beim Laden der Analytics-Daten</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Detaillierte Einblicke in Ihre Marketing-Performance
          </p>
        </div>
        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="7d">Letzte 7 Tage</option>
            <option value="30d">Letzte 30 Tage</option>
            <option value="90d">Letzte 90 Tage</option>
            <option value="1y">Letztes Jahr</option>
          </select>
          <Button variant="outline" onClick={refreshAnalytics} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gesamt Kunden</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.overview.totalCustomers.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">
                    +{formatPercentage(analytics.overview.customerGrowthRate)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktive Kampagnen</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.overview.totalCampaigns}
                </p>
                <div className="flex items-center mt-1">
                  <Award className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">
                    {formatPercentage(analytics.overview.campaignSuccessRate)} Erfolgsrate
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gesamtumsatz</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analytics.overview.totalRevenue)}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">
                    ∅ {formatCurrency(analytics.overview.averageOrderValue)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(analytics.campaignMetrics.conversionRate)}
                </p>
                <div className="flex items-center mt-1">
                  <Zap className="h-4 w-4 text-orange-600 mr-1" />
                  <span className="text-sm text-orange-600">
                    {analytics.campaignMetrics.totalSent.toLocaleString()} gesendet
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Kampagnen-Performance</CardTitle>
            <CardDescription>
              Wichtige Metriken Ihrer E-Mail-Kampagnen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Eye className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium">Öffnungsrate</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {formatPercentage(analytics.campaignMetrics.openRate)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {(analytics.campaignMetrics.totalSent * analytics.campaignMetrics.openRate / 100).toLocaleString()} Öffnungen
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <MousePointer className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium">Klickrate</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {formatPercentage(analytics.campaignMetrics.clickRate)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {(analytics.campaignMetrics.totalSent * analytics.campaignMetrics.clickRate / 100).toLocaleString()} Klicks
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Target className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium">Conversion Rate</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {formatPercentage(analytics.campaignMetrics.conversionRate)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {(analytics.campaignMetrics.totalSent * analytics.campaignMetrics.conversionRate / 100).toLocaleString()} Conversions
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-orange-600 mr-2" />
                  <span className="text-sm font-medium">Zustellrate</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {formatPercentage(analytics.campaignMetrics.deliveryRate)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {(analytics.campaignMetrics.totalSent * analytics.campaignMetrics.deliveryRate / 100).toLocaleString()} zugestellt
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Kampagnen</CardTitle>
            <CardDescription>
              Ihre erfolgreichsten Kampagnen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topCampaigns.map((campaign, index) => (
                <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                        <span>{campaign.sent.toLocaleString()} gesendet</span>
                        <span>{formatPercentage(campaign.openRate)} geöffnet</span>
                        <span>{formatPercentage(campaign.clickRate)} geklickt</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {formatCurrency(campaign.revenue)}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {campaign.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Kunden-Segmente</CardTitle>
            <CardDescription>
              Aufteilung Ihrer Kundenbasis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.customerMetrics.segmentBreakdown).map(([segment, count]) => {
                const percentage = (count / analytics.customerMetrics.totalCustomers) * 100
                return (
                  <div key={segment} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">{segment}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{count.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{formatPercentage(percentage)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kunden-Metriken</CardTitle>
            <CardDescription>
              Wichtige Kennzahlen zu Ihren Kunden
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Aktive Kunden</span>
                  <span className="font-medium">{analytics.customerMetrics.activeCustomers.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(analytics.customerMetrics.activeCustomers / analytics.customerMetrics.totalCustomers) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Neue Kunden ({timeRange})</span>
                  <span className="font-medium">{analytics.customerMetrics.newCustomers.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Churn Rate</span>
                  <span className="font-medium text-red-600">
                    {formatPercentage(analytics.customerMetrics.churnRate)}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Customer Lifetime Value</span>
                  <span className="font-medium">
                    {formatCurrency(analytics.revenueMetrics.customerLifetimeValue)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Umsatz-Übersicht</CardTitle>
            <CardDescription>
              Finanzielle Performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Gesamtumsatz</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analytics.revenueMetrics.totalRevenue)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Monatlich wiederkehrender Umsatz</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(analytics.revenueMetrics.monthlyRecurringRevenue)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Durchschnittlicher Bestellwert</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(analytics.revenueMetrics.averageCustomerValue)}
                </p>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Umsatz pro Kunde</span>
                  <span className="font-medium">
                    {formatCurrency(analytics.revenueMetrics.totalRevenue / analytics.customerMetrics.totalCustomers)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monatliche Trends</CardTitle>
          <CardDescription>
            Entwicklung von Kunden, Umsatz und Kampagnen über die Zeit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Monat</th>
                  <th className="text-left py-3 px-4">Kunden</th>
                  <th className="text-left py-3 px-4">Umsatz</th>
                  <th className="text-left py-3 px-4">Kampagnen</th>
                  <th className="text-left py-3 px-4">Trend</th>
                </tr>
              </thead>
              <tbody>
                {analytics.monthlyTrends.map((trend, index) => {
                  const previousTrend = analytics.monthlyTrends[index - 1]
                  const revenueGrowth = previousTrend 
                    ? ((trend.revenue - previousTrend.revenue) / previousTrend.revenue) * 100
                    : 0

                  return (
                    <tr key={trend.month} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{trend.month}</td>
                      <td className="py-3 px-4">{trend.customers.toLocaleString()}</td>
                      <td className="py-3 px-4">{formatCurrency(trend.revenue)}</td>
                      <td className="py-3 px-4">{trend.campaigns}</td>
                      <td className="py-3 px-4">
                        {index > 0 && (
                          <div className="flex items-center">
                            {revenueGrowth > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                            )}
                            <span className={`text-sm ${revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {Math.abs(revenueGrowth).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
