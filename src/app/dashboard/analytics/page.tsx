'use client'

import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { getAnalyticsData } from '@/lib/supabase'
import { 
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Target
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

export default function AnalyticsPage() {
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Statistiken</h1>
            <p className="text-gray-600 mt-1">Lade Daten...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!analyticsData) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Statistiken</h1>
            <p className="text-gray-600 mt-1">Fehler beim Laden der Daten</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

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
              <CardTitle className="text-sm font-medium">Gesamt Kunden</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalCustomers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{analyticsData.customerGrowthRate}%</span> diesen Monat
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktive Kunden</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.activeCustomers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {analyticsData.totalCustomers > 0 
                  ? `${Math.round((analyticsData.activeCustomers / analyticsData.totalCustomers) * 100)}% Conversion Rate`
                  : 'Keine Kunden'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Neue Leads</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.leadsCount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {analyticsData.prospectsCount} Prospects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wachstum</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.newCustomersThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                Neue Kunden diesen Monat
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Kunden Status Verteilung
              </CardTitle>
              <CardDescription>
                Aufschlüsselung nach Kundenstatus
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(analyticsData.customersByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm capitalize">{status}</h4>
                    <p className="text-lg font-bold text-gray-900">{count} Kunden</p>
                    <p className="text-sm text-gray-600">
                      {analyticsData.totalCustomers > 0 
                        ? `${Math.round((count / analyticsData.totalCustomers) * 100)}% aller Kunden`
                        : '0%'
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={status === 'customer' ? 'default' : 'secondary'}>
                      {Math.round((count / analyticsData.totalCustomers) * 100)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Customer Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Kunden Typ Verteilung
              </CardTitle>
              <CardDescription>
                Personen vs. Unternehmen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Personen</h4>
                  <p className="text-lg font-bold text-gray-900">{analyticsData.customersByType.person} Kunden</p>
                  <p className="text-sm text-gray-600">
                    {analyticsData.totalCustomers > 0 
                      ? `${Math.round((analyticsData.customersByType.person / analyticsData.totalCustomers) * 100)}% aller Kunden`
                      : '0%'
                    }
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">
                    {analyticsData.totalCustomers > 0 
                      ? Math.round((analyticsData.customersByType.person / analyticsData.totalCustomers) * 100)
                      : 0
                    }%
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Unternehmen</h4>
                  <p className="text-lg font-bold text-gray-900">{analyticsData.customersByType.company} Kunden</p>
                  <p className="text-sm text-gray-600">
                    {analyticsData.totalCustomers > 0 
                      ? `${Math.round((analyticsData.customersByType.company / analyticsData.totalCustomers) * 100)}% aller Kunden`
                      : '0%'
                    }
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">
                    {analyticsData.totalCustomers > 0 
                      ? Math.round((analyticsData.customersByType.company / analyticsData.totalCustomers) * 100)
                      : 0
                    }%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Industries */}
        {analyticsData.topIndustries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Branchen
              </CardTitle>
              <CardDescription>
                Die häufigsten Branchen Ihrer Unternehmenskunden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyticsData.topIndustries.map((industry, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{industry.industry}</h4>
                      <p className="text-lg font-bold text-gray-900">{industry.count} Unternehmen</p>
                    </div>
                    <Badge variant="outline">
                      #{index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
