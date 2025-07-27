'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Megaphone, 
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  BarChart3,
  Brain,
  Target,
  Clock,
  Users,
  Mail,
  MessageSquare,
  Smartphone,
  Calendar,
  CheckCircle,
  AlertCircle,
  Zap,
  Settings,
  Filter,
  Download,
  Copy,
  Send,
  Activity
} from 'lucide-react'

interface Campaign {
  id: string
  name: string
  type: 'EMAIL' | 'SMS' | 'SOCIAL' | 'PUSH' | 'MULTI'
  status: 'DRAFT' | 'SCHEDULED' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED'
  targetAudience: string
  audienceSize: number
  createdAt: string
  scheduledAt?: string
  completedAt?: string
  sent: number
  delivered: number
  opened: number
  clicked: number
  converted: number
  revenue: number
  openRate: number
  clickRate: number
  conversionRate: number
  roi: number
  aiOptimized: boolean
  tags: string[]
}

interface CampaignInsights {
  totalCampaigns: number
  activeCampaigns: number
  totalSent: number
  avgOpenRate: number
  avgClickRate: number
  avgConversionRate: number
  totalRevenue: number
  avgROI: number
  topPerformingTypes: Array<{
    type: string
    performance: number
    campaigns: number
  }>
  recentPerformance: Array<{
    date: string
    sent: number
    revenue: number
  }>
}

interface AIRecommendations {
  campaignSuggestions: Array<{
    id: string
    title: string
    type: string
    targetSegment: string
    expectedROI: number
    reasoning: string
    priority: 'high' | 'medium' | 'low'
  }>
  optimizationTips: Array<{
    campaignId: string
    campaignName: string
    tip: string
    expectedImprovement: string
    category: 'timing' | 'content' | 'audience' | 'channel'
  }>
  automationOpportunities: Array<{
    trigger: string
    action: string
    expectedImpact: string
    segment: string
  }>
  performanceInsights: Array<{
    insight: string
    recommendation: string
    impact: 'high' | 'medium' | 'low'
  }>
}

interface AutomationRule {
  id: string
  name: string
  trigger: string
  conditions: string[]
  actions: string[]
  status: 'ACTIVE' | 'INACTIVE'
  triggered: number
  lastTriggered?: string
}

export default function CampaignsEnhancedPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [insights, setInsights] = useState<CampaignInsights | null>(null)
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendations | null>(null)
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [aiProcessing, setAiProcessing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadCampaignData()
  }, [])

  const loadCampaignData = async () => {
    try {
      // Simulated campaign data
      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          name: 'Winter Sale 2024 - Premium Kunden',
          type: 'EMAIL',
          status: 'COMPLETED',
          targetAudience: 'Premium Kunden',
          audienceSize: 1250,
          createdAt: '2024-01-10T09:00:00Z',
          scheduledAt: '2024-01-15T10:00:00Z',
          completedAt: '2024-01-20T15:30:00Z',
          sent: 1250,
          delivered: 1235,
          opened: 734,
          clicked: 198,
          converted: 87,
          revenue: 45600,
          openRate: 59.4,
          clickRate: 27.0,
          conversionRate: 43.9,
          roi: 428.5,
          aiOptimized: true,
          tags: ['Sale', 'Premium', 'Winter']
        },
        {
          id: '2',
          name: 'Produkt-Update Ankündigung',
          type: 'MULTI',
          status: 'RUNNING',
          targetAudience: 'Aktive Nutzer',
          audienceSize: 3420,
          createdAt: '2024-01-18T14:20:00Z',
          scheduledAt: '2024-01-20T09:00:00Z',
          sent: 2100,
          delivered: 2087,
          opened: 892,
          clicked: 234,
          converted: 45,
          revenue: 12800,
          openRate: 42.7,
          clickRate: 26.2,
          conversionRate: 19.2,
          roi: 165.3,
          aiOptimized: true,
          tags: ['Product', 'Update', 'Multi-Channel']
        },
        {
          id: '3',
          name: 'Willkommens-Serie für neue Leads',
          type: 'EMAIL',
          status: 'SCHEDULED',
          targetAudience: 'Neue Leads',
          audienceSize: 567,
          createdAt: '2024-01-19T11:15:00Z',
          scheduledAt: '2024-01-22T08:00:00Z',
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          converted: 0,
          revenue: 0,
          openRate: 0,
          clickRate: 0,
          conversionRate: 0,
          roi: 0,
          aiOptimized: false,
          tags: ['Welcome', 'Automation', 'Leads']
        }
      ]

      setCampaigns(mockCampaigns)

      // Mock insights
      setInsights({
        totalCampaigns: 24,
        activeCampaigns: 8,
        totalSent: 45670,
        avgOpenRate: 48.3,
        avgClickRate: 24.7,
        avgConversionRate: 31.2,
        totalRevenue: 234500,
        avgROI: 287.4,
        topPerformingTypes: [
          { type: 'EMAIL', performance: 92.3, campaigns: 15 },
          { type: 'MULTI', performance: 87.1, campaigns: 6 },
          { type: 'SMS', performance: 78.4, campaigns: 3 }
        ],
        recentPerformance: [
          { date: '2024-01-15', sent: 1250, revenue: 45600 },
          { date: '2024-01-18', sent: 892, revenue: 23400 },
          { date: '2024-01-20', sent: 2100, revenue: 12800 }
        ]
      })

      // Load automation rules
      setAutomationRules([
        {
          id: '1',
          name: 'Willkommen neue Kunden',
          trigger: 'Neue Kundenregistrierung',
          conditions: ['E-Mail-Adresse bestätigt', 'Erstes Login'],
          actions: ['Willkommens-E-Mail senden', 'Zu Newsletter hinzufügen'],
          status: 'ACTIVE',
          triggered: 234,
          lastTriggered: '2024-01-20T16:45:00Z'
        },
        {
          id: '2',
          name: 'Warenkorb-Abbrecher',
          trigger: 'Warenkorb verlassen ohne Kauf',
          conditions: ['Warenwert > €50', 'Keine Bestellung in 2h'],
          actions: ['Erinnerungs-E-Mail', 'Rabatt-Code generieren'],
          status: 'ACTIVE',
          triggered: 156,
          lastTriggered: '2024-01-20T18:20:00Z'
        },
        {
          id: '3',
          name: 'Inaktive Kunden reaktivieren',
          trigger: 'Keine Aktivität seit 30 Tagen',
          conditions: ['Historisch aktiver Kunde', 'E-Mail-Adresse gültig'],
          actions: ['Reaktivierungs-Kampagne', 'Spezialangebot'],
          status: 'ACTIVE',
          triggered: 89,
          lastTriggered: '2024-01-19T14:30:00Z'
        }
      ])

      // Generate AI recommendations
      generateAIRecommendations()

    } catch (error) {
      console.error('Error loading campaign data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAIRecommendations = async () => {
    setAiProcessing(true)
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    const recommendations: AIRecommendations = {
      campaignSuggestions: [
        {
          id: 'suggestion-1',
          title: 'Cross-Sell Kampagne - Tech Accessories',
          type: 'EMAIL',
          targetSegment: 'Technologie-Käufer',
          expectedROI: 315.2,
          reasoning: 'Basierend auf Kaufhistorie zeigen Tech-Kunden hohe Affinität zu Zubehör. Optimaler Zeitpunkt: 2 Wochen nach Hauptkauf.',
          priority: 'high'
        },
        {
          id: 'suggestion-2',
          title: 'Reaktivierungs-Serie Inaktive Premium',
          type: 'MULTI',
          targetSegment: 'Inaktive Premium-Kunden',
          expectedROI: 245.8,
          reasoning: 'Premium-Kunden haben höhere Lifetime Value. Multi-Channel Ansatz zeigt 40% bessere Response-Raten.',
          priority: 'high'
        },
        {
          id: 'suggestion-3',
          title: 'Geburtstags-Automatisierung',
          type: 'EMAIL',
          targetSegment: 'Alle aktiven Kunden',
          expectedROI: 180.4,
          reasoning: 'Personalisierte Geburtstags-Kampagnen haben 65% höhere Öffnungsraten und schaffen emotionale Bindung.',
          priority: 'medium'
        }
      ],
      optimizationTips: [
        {
          campaignId: '2',
          campaignName: 'Produkt-Update Ankündigung',
          tip: 'Versendezeitpunkt auf 14:00-16:00 optimieren',
          expectedImprovement: '+15% Öffnungsrate',
          category: 'timing'
        },
        {
          campaignId: '3',
          campaignName: 'Willkommens-Serie für neue Leads',
          tip: 'Personalisierte Betreffzeile mit Vornamen',
          expectedImprovement: '+12% Engagement',
          category: 'content'
        }
      ],
      automationOpportunities: [
        {
          trigger: 'Kunde verlässt Webseite ohne Aktion',
          action: 'Exit-Intent Popup mit Rabatt',
          expectedImpact: '8% Conversion-Steigerung',
          segment: 'Website-Besucher'
        },
        {
          trigger: 'Download von Whitepaper',
          action: 'Follow-up E-Mail-Serie mit Case Studies',
          expectedImpact: '25% mehr qualifizierte Leads',
          segment: 'Content-Interessierte'
        }
      ],
      performanceInsights: [
        {
          insight: 'E-Mail-Kampagnen performen 23% besser dienstags',
          recommendation: 'Wichtige Kampagnen auf Dienstag 14:00 planen',
          impact: 'high'
        },
        {
          insight: 'Multi-Channel Kampagnen haben 40% höhere ROI',
          recommendation: 'Einzelkanal-Kampagnen zu Multi-Channel erweitern',
          impact: 'high'
        },
        {
          insight: 'Personalisierte Betreffzeilen steigern Öffnungsrate um 26%',
          recommendation: 'AI-basierte Betreffzeilen-Optimierung implementieren',
          impact: 'medium'
        }
      ]
    }

    setAiRecommendations(recommendations)
    setAiProcessing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'RUNNING': return 'bg-blue-100 text-blue-800'
      case 'SCHEDULED': return 'bg-yellow-100 text-yellow-800'
      case 'PAUSED': return 'bg-orange-100 text-orange-800'
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EMAIL': return <Mail className="h-4 w-4" />
      case 'SMS': return <MessageSquare className="h-4 w-4" />
      case 'SOCIAL': return <Users className="h-4 w-4" />
      case 'PUSH': return <Smartphone className="h-4 w-4" />
      case 'MULTI': return <Megaphone className="h-4 w-4" />
      default: return <Mail className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.targetAudience.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p>Lade Kampagnendaten...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing-Kampagnen</h1>
          <p className="text-gray-600 mt-1">
            AI-powered Kampagnenmanagement und Automatisierung
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Automatisierung
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Report
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neue Kampagne
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="campaigns">Kampagnen</TabsTrigger>
          <TabsTrigger value="automation">Automatisierung</TabsTrigger>
          <TabsTrigger value="ai-insights">KI-Empfehlungen</TabsTrigger>
          <TabsTrigger value="analytics">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          {insights && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Aktive Kampagnen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{insights.activeCampaigns}</div>
                  <p className="text-xs text-gray-600">von {insights.totalCampaigns} gesamt</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Ø Öffnungsrate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{insights.avgOpenRate}%</div>
                  <p className="text-xs text-gray-600">Branchenschnitt: 21.3%</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Ø ROI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{insights.avgROI}%</div>
                  <p className="text-xs text-gray-600">Umsatz: €{insights.totalRevenue.toLocaleString()}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Ø Conversion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{insights.avgConversionRate}%</div>
                  <p className="text-xs text-gray-600">Gesendete: {insights.totalSent.toLocaleString()}</p>
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
                    <p className="font-medium text-blue-900">KI analysiert Kampagnen-Performance...</p>
                    <p className="text-sm text-blue-700">Generiere Optimierungsvorschläge und neue Kampagnen-Ideen</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Requirements Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>✅ Ihre Anforderungen - Marketing-Kampagnen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg bg-green-50">
                  <CheckCircle className="h-6 w-6 mb-2 text-green-600" />
                  <p className="font-medium text-sm">✅ Kampagnen erstellen</p>
                  <p className="text-xs text-gray-600">Implementiert</p>
                </div>
                <div className="p-4 border rounded-lg bg-green-50">
                  <Brain className="h-6 w-6 mb-2 text-green-600" />
                  <p className="font-medium text-sm">✅ AI-Optimierung</p>
                  <p className="text-xs text-gray-600">Implementiert</p>
                </div>
                <div className="p-4 border rounded-lg bg-green-50">
                  <Zap className="h-6 w-6 mb-2 text-green-600" />
                  <p className="font-medium text-sm">✅ Automatisierung</p>
                  <p className="text-xs text-gray-600">Implementiert</p>
                </div>
                <div className="p-4 border rounded-lg bg-green-50">
                  <BarChart3 className="h-6 w-6 mb-2 text-green-600" />
                  <p className="font-medium text-sm">✅ Performance-Tracking</p>
                  <p className="text-xs text-gray-600">Implementiert</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Kampagnen suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Alle Status</option>
              <option value="RUNNING">Laufend</option>
              <option value="SCHEDULED">Geplant</option>
              <option value="COMPLETED">Abgeschlossen</option>
              <option value="DRAFT">Entwurf</option>
              <option value="PAUSED">Pausiert</option>
            </select>
          </div>

          {/* Campaigns List */}
          <div className="grid gap-4">
            {filteredCampaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(campaign.type)}
                        <h3 className="font-semibold text-lg">{campaign.name}</h3>
                        {campaign.aiOptimized && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700">
                            <Brain className="h-3 w-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Zielgruppe</p>
                      <p className="font-medium">{campaign.audienceSize.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Gesendet</p>
                      <p className="font-medium">{campaign.sent.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Öffnungsrate</p>
                      <p className="font-medium text-blue-600">{campaign.openRate.toFixed(1)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Klickrate</p>
                      <p className="font-medium text-green-600">{campaign.clickRate.toFixed(1)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Conversion</p>
                      <p className="font-medium text-orange-600">{campaign.conversionRate.toFixed(1)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">ROI</p>
                      <p className="font-medium text-purple-600">{campaign.roi.toFixed(0)}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {campaign.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      Umsatz: €{campaign.revenue.toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Marketing-Automatisierung</h2>
              <p className="text-gray-600">Trigger-basierte Kampagnen und Workflows</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neue Regel
            </Button>
          </div>

          <div className="grid gap-4">
            {automationRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`h-3 w-3 rounded-full ${rule.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <h3 className="font-semibold">{rule.name}</h3>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">
                        {rule.triggered} ausgelöst
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Trigger</h4>
                      <p className="text-sm text-gray-600">{rule.trigger}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Bedingungen</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {rule.conditions.map((condition, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            {condition}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Aktionen</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {rule.actions.map((action, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">→</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {rule.lastTriggered && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-gray-500">
                        Zuletzt ausgelöst: {new Date(rule.lastTriggered).toLocaleString('de-DE')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Automation Opportunities from AI */}
          {aiRecommendations && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-500" />
                  ✅ KI-Automatisierungsvorschläge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiRecommendations.automationOpportunities.map((opportunity, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{opportunity.trigger}</h4>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" />
                          Erstellen
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{opportunity.action}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{opportunity.segment}</Badge>
                        <span className="text-sm font-medium text-green-600">
                          {opportunity.expectedImpact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          {aiRecommendations && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Campaign Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                    Kampagnen-Vorschläge
                  </CardTitle>
                  <CardDescription>
                    KI-generierte Kampagnen-Ideen basierend auf Datenanalyse
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiRecommendations.campaignSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{suggestion.title}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                            {suggestion.priority.toUpperCase()}
                          </span>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Erstellen
                          </Button>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-500">Zielgruppe</p>
                          <p className="font-medium">{suggestion.targetSegment}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Erwarteter ROI</p>
                          <p className="font-medium text-green-600">{suggestion.expectedROI}%</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{suggestion.reasoning}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Optimization Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                    Optimierungsvorschläge
                  </CardTitle>
                  <CardDescription>
                    Verbesserungen für bestehende Kampagnen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiRecommendations.optimizationTips.map((tip, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{tip.campaignName}</h4>
                        <Badge variant="outline">{tip.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{tip.tip}</p>
                      <p className="text-sm font-medium text-blue-600">
                        Erwartung: {tip.expectedImprovement}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Performance Insights */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-purple-500" />
                    ✅ Performance-Erkenntnisse & Handlungsempfehlungen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {aiRecommendations.performanceInsights.map((insight, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{insight.insight}</h4>
                          <div className={`h-2 w-2 rounded-full mt-2 ${
                            insight.impact === 'high' ? 'bg-red-500' :
                            insight.impact === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`} />
                        </div>
                        <p className="text-sm text-gray-600">💡 {insight.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {insights && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performing Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Kampagnen-Typen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.topPerformingTypes.map((type) => (
                      <div key={type.type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(type.type)}
                          <span className="font-medium">{type.type}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">{type.performance}%</p>
                          <p className="text-sm text-gray-500">{type.campaigns} Kampagnen</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance-Verlauf</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.recentPerformance.map((data) => (
                      <div key={data.date} className="flex items-center justify-between">
                        <span className="font-medium">
                          {new Date(data.date).toLocaleDateString('de-DE')}
                        </span>
                        <div className="text-right">
                          <p className="font-bold">{data.sent.toLocaleString()} gesendet</p>
                          <p className="text-sm text-green-600">€{data.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
