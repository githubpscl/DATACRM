'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { apiCall } from '@/components/auth-provider'
import { 
  Search, 
  Plus, 
  Play, 
  Pause, 
  StopCircle,
  Edit,
  Copy,
  Trash2,
  Mail,
  BarChart3,
  Users,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Filter,
  MoreVertical
} from 'lucide-react'

interface Campaign {
  id: string
  name: string
  description?: string
  type: 'email' | 'sms' | 'social' | 'mixed'
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'stopped'
  startDate?: string
  endDate?: string
  targetAudience: {
    total: number
    segmentName?: string
  }
  metrics: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    converted: number
    revenue: number
  }
  createdAt: string
  updatedAt: string
  createdBy: string
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-purple-100 text-purple-800',
  stopped: 'bg-red-100 text-red-800'
}

const typeIcons = {
  email: Mail,
  sms: Users,
  social: Target,
  mixed: BarChart3
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')

  useEffect(() => {
    loadCampaigns()
  }, [])

  useEffect(() => {
    filterCampaigns()
  }, [campaigns, searchTerm, selectedStatus, selectedType])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const response = await apiCall('/api/campaigns')
      setCampaigns(response.campaigns || [])
    } catch (error) {
      console.error('Error loading campaigns:', error)
      // Mock data for demo
      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          name: 'Willkommensserie Neukunden',
          description: 'Automatisierte E-Mail-Serie für neue Kunden',
          type: 'email',
          status: 'active',
          startDate: '2024-01-15',
          endDate: '2024-02-15',
          targetAudience: {
            total: 1250,
            segmentName: 'Neukunden 2024'
          },
          metrics: {
            sent: 3456,
            delivered: 3398,
            opened: 1876,
            clicked: 567,
            converted: 89,
            revenue: 12450
          },
          createdAt: '2024-01-10',
          updatedAt: '2024-01-20',
          createdBy: 'admin'
        },
        {
          id: '2',
          name: 'Black Friday Sale',
          description: 'Multi-Channel Kampagne für Black Friday',
          type: 'mixed',
          status: 'completed',
          startDate: '2023-11-20',
          endDate: '2023-11-27',
          targetAudience: {
            total: 5400,
            segmentName: 'Alle aktiven Kunden'
          },
          metrics: {
            sent: 12890,
            delivered: 12654,
            opened: 7823,
            clicked: 2341,
            converted: 456,
            revenue: 87650
          },
          createdAt: '2023-11-01',
          updatedAt: '2023-11-28',
          createdBy: 'admin'
        },
        {
          id: '3',
          name: 'Produktupdate Ankündigung',
          description: 'Information über neue Features',
          type: 'email',
          status: 'scheduled',
          startDate: '2024-02-01',
          targetAudience: {
            total: 3200,
            segmentName: 'Power Users'
          },
          metrics: {
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            converted: 0,
            revenue: 0
          },
          createdAt: '2024-01-18',
          updatedAt: '2024-01-20',
          createdBy: 'admin'
        },
        {
          id: '4',
          name: 'Re-Engagement Serie',
          description: 'Reaktivierung inaktiver Kunden',
          type: 'email',
          status: 'draft',
          targetAudience: {
            total: 890,
            segmentName: 'Inaktive Kunden'
          },
          metrics: {
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            converted: 0,
            revenue: 0
          },
          createdAt: '2024-01-19',
          updatedAt: '2024-01-20',
          createdBy: 'admin'
        }
      ]
      setCampaigns(mockCampaigns)
    } finally {
      setLoading(false)
    }
  }

  const filterCampaigns = () => {
    let filtered = campaigns

    if (searchTerm) {
      filtered = filtered.filter(campaign =>
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === selectedStatus)
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(campaign => campaign.type === selectedType)
    }

    setFilteredCampaigns(filtered)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%'
    return `${((value / total) * 100).toFixed(1)}%`
  }

  const getTotalMetrics = () => {
    return campaigns.reduce(
      (acc, campaign) => ({
        sent: acc.sent + campaign.metrics.sent,
        delivered: acc.delivered + campaign.metrics.delivered,
        opened: acc.opened + campaign.metrics.opened,
        clicked: acc.clicked + campaign.metrics.clicked,
        converted: acc.converted + campaign.metrics.converted,
        revenue: acc.revenue + campaign.metrics.revenue
      }),
      { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, revenue: 0 }
    )
  }

  const totalMetrics = getTotalMetrics()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Lade Kampagnen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kampagnen</h1>
          <p className="text-gray-600 mt-1">
            Erstellen und verwalten Sie Ihre Marketing-Kampagnen
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neue Kampagne
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gesamt Kampagnen</p>
                <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Play className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktive Kampagnen</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaigns.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Öffnungsrate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(totalMetrics.opened, totalMetrics.sent)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gesamtumsatz</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalMetrics.revenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Suche nach Kampagnenname oder Beschreibung..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Alle Status</option>
                <option value="draft">Entwurf</option>
                <option value="scheduled">Geplant</option>
                <option value="active">Aktiv</option>
                <option value="paused">Pausiert</option>
                <option value="completed">Abgeschlossen</option>
                <option value="stopped">Gestoppt</option>
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Alle Typen</option>
                <option value="email">E-Mail</option>
                <option value="sms">SMS</option>
                <option value="social">Social Media</option>
                <option value="mixed">Multi-Channel</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign) => {
          const IconComponent = typeIcons[campaign.type]
          return (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {campaign.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={statusColors[campaign.status]}>
                      {campaign.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Campaign Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Zielgruppe</p>
                      <p className="font-medium">{campaign.targetAudience.total.toLocaleString()} Kontakte</p>
                      {campaign.targetAudience.segmentName && (
                        <p className="text-xs text-gray-500">{campaign.targetAudience.segmentName}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-600">Typ</p>
                      <p className="font-medium capitalize">{campaign.type}</p>
                    </div>
                  </div>

                  {/* Date Range */}
                  {(campaign.startDate || campaign.endDate) && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {campaign.startDate && new Date(campaign.startDate).toLocaleDateString('de-DE')}
                        {campaign.startDate && campaign.endDate && ' - '}
                        {campaign.endDate && new Date(campaign.endDate).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                  )}

                  {/* Metrics */}
                  {campaign.metrics.sent > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Performance</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Gesendet</span>
                            <span className="font-medium">{campaign.metrics.sent.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Geöffnet</span>
                            <span className="font-medium">
                              {formatPercentage(campaign.metrics.opened, campaign.metrics.sent)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Geklickt</span>
                            <span className="font-medium">
                              {formatPercentage(campaign.metrics.clicked, campaign.metrics.sent)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Umsatz</span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(campaign.metrics.revenue)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    {campaign.status === 'draft' && (
                      <Button size="sm" className="flex-1">
                        <Play className="h-4 w-4 mr-2" />
                        Starten
                      </Button>
                    )}
                    {campaign.status === 'active' && (
                      <Button variant="outline" size="sm" className="flex-1">
                        <Pause className="h-4 w-4 mr-2" />
                        Pausieren
                      </Button>
                    )}
                    {campaign.status === 'paused' && (
                      <Button size="sm" className="flex-1">
                        <Play className="h-4 w-4 mr-2" />
                        Fortsetzen
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredCampaigns.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Kampagnen gefunden</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Keine Kampagnen entsprechen Ihren Suchkriterien.' : 'Erstellen Sie Ihre erste Kampagne.'}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neue Kampagne
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
