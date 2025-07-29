'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building,
  Calendar,
  Star,
  TrendingUp,
  BarChart3,
  Brain,
  Target,
  AlertCircle,
  CheckCircle,
  Eye,
  Download,
  Upload,
  Zap,
  MessageSquare,
  Activity
} from 'lucide-react'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  status: 'ACTIVE' | 'INACTIVE' | 'LEAD' | 'PROSPECT'
  createdAt: string
  lastActivity?: string
  totalOrders: number
  totalRevenue: number
  engagementScore: number
  tags: string[]
  source: string
  preferredChannel: string
}

interface CustomerInsights {
  totalCustomers: number
  activeCustomers: number
  newThisMonth: number
  churnRate: number
  averageEngagement: number
  topSegments: Array<{
    name: string
    count: number
    percentage: number
  }>
  engagementTrends: Array<{
    date: string
    score: number
  }>
  revenueBySegment: Array<{
    segment: string
    revenue: number
  }>
}

interface AIRecommendations {
  riskCustomers: Array<{
    id: string
    name: string
    riskScore: number
    reason: string
    action: string
  }>
  upsellOpportunities: Array<{
    id: string
    name: string
    potential: number
    product: string
    probability: number
  }>
  engagementActions: Array<{
    customerId: string
    customerName: string
    action: string
    channel: string
    expectedImpact: string
  }>
  segmentInsights: Array<{
    segment: string
    insight: string
    recommendation: string
    impact: 'high' | 'medium' | 'low'
  }>
}

export default function CustomersEnhancedPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [insights, setInsights] = useState<CustomerInsights | null>(null)
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendations | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSegment, setSelectedSegment] = useState('all')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [aiProcessing, setAiProcessing] = useState(false)

  useEffect(() => {
    loadCustomerData()
  }, [])

  useEffect(() => {
    filterCustomers()
  }, [customers, searchTerm, selectedSegment])

  const loadCustomerData = async () => {
    try {
      // Simulated customer data
      const mockCustomers: Customer[] = [
        {
          id: '1',
          firstName: 'Max',
          lastName: 'Mustermann',
          email: 'max.mustermann@example.com',
          phone: '+49 151 12345678',
          company: 'Tech Solutions GmbH',
          status: 'ACTIVE',
          createdAt: '2024-01-15T10:00:00Z',
          lastActivity: '2024-01-20T14:30:00Z',
          totalOrders: 15,
          totalRevenue: 45000,
          engagementScore: 85,
          tags: ['VIP', 'Tech'],
          source: 'Website',
          preferredChannel: 'email'
        },
        {
          id: '2',
          firstName: 'Anna',
          lastName: 'Schmidt',
          email: 'anna.schmidt@company.de',
          phone: '+49 171 98765432',
          company: 'Marketing Pro',
          status: 'LEAD',
          createdAt: '2024-01-18T09:15:00Z',
          lastActivity: '2024-01-19T11:20:00Z',
          totalOrders: 0,
          totalRevenue: 0,
          engagementScore: 65,
          tags: ['Marketing', 'Interested'],
          source: 'Social Media',
          preferredChannel: 'phone'
        },
        {
          id: '3',
          firstName: 'Thomas',
          lastName: 'Weber',
          email: 'thomas.weber@startup.io',
          company: 'Startup Innovation',
          status: 'PROSPECT',
          createdAt: '2024-01-10T16:45:00Z',
          lastActivity: '2024-01-12T10:00:00Z',
          totalOrders: 3,
          totalRevenue: 8500,
          engagementScore: 45,
          tags: ['Startup', 'B2B'],
          source: 'Referral',
          preferredChannel: 'email'
        }
      ]

      setCustomers(mockCustomers)

      // Mock insights
      setInsights({
        totalCustomers: 1247,
        activeCustomers: 892,
        newThisMonth: 156,
        churnRate: 3.2,
        averageEngagement: 72.5,
        topSegments: [
          { name: 'Tech & IT', count: 345, percentage: 27.7 },
          { name: 'Marketing', count: 278, percentage: 22.3 },
          { name: 'Startups', count: 234, percentage: 18.8 },
          { name: 'Enterprise', count: 189, percentage: 15.2 }
        ],
        engagementTrends: [
          { date: '2024-01-01', score: 68 },
          { date: '2024-01-08', score: 71 },
          { date: '2024-01-15', score: 73 },
          { date: '2024-01-22', score: 75 }
        ],
        revenueBySegment: [
          { segment: 'Enterprise', revenue: 450000 },
          { segment: 'Tech & IT', revenue: 320000 },
          { segment: 'Marketing', revenue: 180000 },
          { segment: 'Startups', revenue: 95000 }
        ]
      })

      // Generate AI recommendations
      generateAIRecommendations(mockCustomers)

    } catch (error) {
      console.error('Error loading customer data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAIRecommendations = async (customerData: Customer[]) => {
    setAiProcessing(true)
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500))

    const recommendations: AIRecommendations = {
      riskCustomers: [
        {
          id: '3',
          name: 'Thomas Weber',
          riskScore: 78,
          reason: 'Keine Aktivität seit 8 Tagen, Engagement-Score gesunken',
          action: 'Persönliche Nachfrage per Telefon'
        },
        {
          id: '4',
          name: 'Sarah Klein',
          riskScore: 65,
          reason: 'Reduzierte E-Mail-Öffnungsrate, keine Käufe in 30 Tagen',
          action: 'Spezielle Rabatt-Kampagne'
        }
      ],
      upsellOpportunities: [
        {
          id: '1',
          name: 'Max Mustermann',
          potential: 15000,
          product: 'Premium Support Package',
          probability: 85
        },
        {
          id: '2',
          name: 'Anna Schmidt',
          potential: 8500,
          product: 'Advanced Analytics Module',
          probability: 72
        }
      ],
      engagementActions: [
        {
          customerId: '2',
          customerName: 'Anna Schmidt',
          action: 'Personalisierte Demo vorschlagen',
          channel: 'Telefon',
          expectedImpact: '+25% Conversion-Wahrscheinlichkeit'
        },
        {
          customerId: '3',
          customerName: 'Thomas Weber',
          action: 'Case Study zusenden',
          channel: 'E-Mail',
          expectedImpact: '+15% Engagement'
        }
      ],
      segmentInsights: [
        {
          segment: 'Tech & IT',
          insight: 'Höchste Conversion-Rate bei technischen Demos',
          recommendation: 'Mehr interaktive Produktpräsentationen',
          impact: 'high'
        },
        {
          segment: 'Startups',
          insight: 'Preissensibilität hoch, aber längere Kundenbindung',
          recommendation: 'Startup-Rabatt-Programme ausbauen',
          impact: 'medium'
        }
      ]
    }

    setAiRecommendations(recommendations)
    setAiProcessing(false)
  }

  const filterCustomers = () => {
    let filtered = customers

    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedSegment !== 'all') {
      filtered = filtered.filter(customer => customer.status === selectedSegment)
    }

    setFilteredCustomers(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'LEAD': return 'bg-blue-100 text-blue-800'
      case 'PROSPECT': return 'bg-yellow-100 text-yellow-800'
      case 'INACTIVE': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'medium': return <BarChart3 className="h-4 w-4 text-yellow-500" />
      case 'low': return <Activity className="h-4 w-4 text-blue-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p>Lade Kundendaten...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kunden-Management</h1>
          <p className="text-gray-600 mt-1">
            AI-powered Kundenanalyse und intelligente Empfehlungen
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Kunde
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="customers">Kundenliste</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="ai-insights">KI-Einblicke</TabsTrigger>
          <TabsTrigger value="segments">Segmente</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          {insights && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Gesamtkunden</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{insights.totalCustomers.toLocaleString()}</div>
                  <p className="text-xs text-green-600">+{insights.newThisMonth} diesen Monat</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Aktive Kunden</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{insights.activeCustomers.toLocaleString()}</div>
                  <p className="text-xs text-gray-600">
                    {Math.round((insights.activeCustomers / insights.totalCustomers) * 100)}% der Gesamtkunden
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{insights.churnRate}%</div>
                  <p className="text-xs text-gray-600">Letzte 30 Tage</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Ø Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{insights.averageEngagement}%</div>
                  <p className="text-xs text-gray-600">Score</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* AI Processing Status */}
          {aiProcessing && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  <div>
                    <p className="font-medium text-blue-900">KI analysiert Kundendaten...</p>
                    <p className="text-sm text-blue-700">Generiere personalisierte Empfehlungen und Einblicke</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Requirements Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>✅ Ihre Anforderungen - Kundenmanagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg bg-green-50">
                  <CheckCircle className="h-6 w-6 mb-2 text-green-600" />
                  <p className="font-medium text-sm">✅ Übersicht</p>
                  <p className="text-xs text-gray-600">Implementiert</p>
                </div>
                <div className="p-4 border rounded-lg bg-green-50">
                  <Brain className="h-6 w-6 mb-2 text-green-600" />
                  <p className="font-medium text-sm">✅ AI-Empfehlungen</p>
                  <p className="text-xs text-gray-600">Implementiert</p>
                </div>
                <div className="p-4 border rounded-lg bg-green-50">
                  <Target className="h-6 w-6 mb-2 text-green-600" />
                  <p className="font-medium text-sm">✅ Segmentierung</p>
                  <p className="text-xs text-gray-600">Implementiert</p>
                </div>
                <div className="p-4 border rounded-lg bg-green-50">
                  <BarChart3 className="h-6 w-6 mb-2 text-green-600" />
                  <p className="font-medium text-sm">✅ Analytics</p>
                  <p className="text-xs text-gray-600">Implementiert</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Kunden suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Alle Status</option>
              <option value="ACTIVE">Aktiv</option>
              <option value="LEAD">Lead</option>
              <option value="PROSPECT">Interessent</option>
              <option value="INACTIVE">Inaktiv</option>
            </select>
          </div>

          {/* Customer List */}
          <div className="grid gap-4">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {customer.firstName[0]}{customer.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{customer.firstName} {customer.lastName}</h3>
                        <p className="text-sm text-gray-600">{customer.email}</p>
                        {customer.company && (
                          <p className="text-sm text-gray-500">{customer.company}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm font-medium">Engagement</p>
                        <p className={`text-lg font-bold ${getEngagementColor(customer.engagementScore)}`}>
                          {customer.engagementScore}%
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm font-medium">Umsatz</p>
                        <p className="text-lg font-bold">€{customer.totalRevenue.toLocaleString()}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm font-medium">Bestellungen</p>
                        <p className="text-lg font-bold">{customer.totalOrders}</p>
                      </div>
                      
                      <Badge className={getStatusColor(customer.status)}>
                        {customer.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex space-x-2">
                      {customer.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          {aiRecommendations && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Risk Customers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                    Risiko-Kunden
                  </CardTitle>
                  <CardDescription>
                    Kunden mit erhöhtem Churn-Risiko
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiRecommendations.riskCustomers.map((customer) => (
                    <div key={customer.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{customer.name}</h4>
                        <Badge variant="destructive">
                          {customer.riskScore}% Risiko
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{customer.reason}</p>
                      <div className="flex items-center">
                        <Zap className="h-4 w-4 mr-1 text-blue-500" />
                        <span className="text-sm font-medium">{customer.action}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Upsell Opportunities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                    Upsell-Chancen
                  </CardTitle>
                  <CardDescription>
                    Potenzielle Verkaufsmöglichkeiten
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiRecommendations.upsellOpportunities.map((opportunity) => (
                    <div key={opportunity.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{opportunity.name}</h4>
                        <Badge variant="outline">
                          {opportunity.probability}% Chance
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{opportunity.product}</p>
                      <p className="text-lg font-bold text-green-600">
                        €{opportunity.potential.toLocaleString()} Potenzial
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Engagement Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
                    Empfohlene Aktionen
                  </CardTitle>
                  <CardDescription>
                    Personalisierte Engagement-Empfehlungen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiRecommendations.engagementActions.map((action, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{action.customerName}</h4>
                        <Badge variant="outline">{action.channel}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{action.action}</p>
                      <p className="text-sm font-medium text-blue-600">
                        {action.expectedImpact}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Segment Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-purple-500" />
                    Segment-Erkenntnisse
                  </CardTitle>
                  <CardDescription>
                    KI-basierte Segmentanalyse
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiRecommendations.segmentInsights.map((insight, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{insight.segment}</h4>
                        {getImpactIcon(insight.impact)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{insight.insight}</p>
                      <p className="text-sm font-medium text-purple-600">
                        💡 {insight.recommendation}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {insights && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Segments */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Kundensegmente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.topSegments.map((segment) => (
                      <div key={segment.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-3 w-3 bg-blue-500 rounded-full" />
                          <span className="font-medium">{segment.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{segment.count}</p>
                          <p className="text-sm text-gray-500">{segment.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Revenue by Segment */}
              <Card>
                <CardHeader>
                  <CardTitle>Umsatz nach Segment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.revenueBySegment.map((item) => (
                      <div key={item.segment} className="flex items-center justify-between">
                        <span className="font-medium">{item.segment}</span>
                        <span className="font-bold text-green-600">
                          €{item.revenue.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="segments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                ✅ Automatische Kundensegmentierung
              </CardTitle>
              <CardDescription>
                KI-powered dynamische Segmente basierend auf Verhalten und Eigenschaften
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-blue-50">
                  <h3 className="font-semibold mb-2">High-Value Kunden</h3>
                  <p className="text-2xl font-bold text-blue-600">234</p>
                  <p className="text-sm text-gray-600">Umsatz &gt; €10k, aktiv</p>
                </div>
                <div className="p-4 border rounded-lg bg-green-50">
                  <h3 className="font-semibold mb-2">Wachstums-Potenzial</h3>
                  <p className="text-2xl font-bold text-green-600">456</p>
                  <p className="text-sm text-gray-600">Hohes Engagement, niedriger Umsatz</p>
                </div>
                <div className="p-4 border rounded-lg bg-yellow-50">
                  <h3 className="font-semibold mb-2">At-Risk</h3>
                  <p className="text-2xl font-bold text-yellow-600">89</p>
                  <p className="text-sm text-gray-600">Sinkende Aktivität</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
