'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Mail, 
  TrendingUp, 
  Target,
  Database,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  BarChart3,
  Bot
} from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import Link from 'next/link'

// Mock data - in production this would come from API
const mockStats = {
  totalCustomers: 12847,
  totalCampaigns: 23,
  openRate: 24.3,
  clickRate: 8.7,
  monthlyGrowth: 12.5,
  activeJourneys: 7
}

const recentCampaigns = [
  {
    id: 1,
    name: 'Welcome Series',
    type: 'EMAIL',
    status: 'ACTIVE',
    sent: 1234,
    openRate: 28.5,
    clickRate: 12.3
  },
  {
    id: 2,
    name: 'Product Launch',
    type: 'EMAIL',
    status: 'COMPLETED',
    sent: 5678,
    openRate: 31.2,
    clickRate: 15.8
  },
  {
    id: 3,
    name: 'Holiday Sale',
    type: 'SMS',
    status: 'DRAFT',
    sent: 0,
    openRate: 0,
    clickRate: 0
  }
]

const aiInsights = [
  {
    title: 'Customer Segmentation Opportunity',
    description: 'AI identified 3 new customer segments with 85% accuracy. Create targeted campaigns for better engagement.',
    type: 'opportunity',
    action: 'Create Segments'
  },
  {
    title: 'Email Send Time Optimization',
    description: 'Best engagement times: Tuesday 10 AM (32% higher open rates) and Thursday 2 PM.',
    type: 'insight',
    action: 'Optimize Schedule'
  },
  {
    title: 'Campaign Performance Alert',
    description: 'Welcome Series open rates dropped by 15% this week. Consider A/B testing subject lines.',
    type: 'alert',
    action: 'Investigate'
  }
]

export default function DashboardOverview() {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here&apos;s what&apos;s happening with your marketing automation today.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button asChild>
            <Link href="/dashboard/campaigns">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="flex items-center text-green-600">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +{mockStats.monthlyGrowth}% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.activeJourneys} automated journeys running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Open Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.openRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="flex items-center text-green-600">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +2.1% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Click Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.clickRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="flex items-center text-red-600">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                -0.5% from last month
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Campaigns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Campaigns</CardTitle>
                  <CardDescription>
                    Performance overview of your latest marketing campaigns
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/campaigns">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View All
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {campaign.type === 'EMAIL' ? (
                          <Mail className="h-8 w-8 text-blue-500" />
                        ) : (
                          <Zap className="h-8 w-8 text-green-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{campaign.name}</h4>
                        <p className="text-sm text-gray-600">
                          {campaign.sent > 0 ? `Sent to ${campaign.sent.toLocaleString()} contacts` : 'Draft campaign'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        {campaign.sent > 0 && (
                          <>
                            <p className="text-sm font-medium">{campaign.openRate}% open</p>
                            <p className="text-sm text-gray-600">{campaign.clickRate}% click</p>
                          </>
                        )}
                      </div>
                      <Badge 
                        variant={
                          campaign.status === 'ACTIVE' ? 'default' : 
                          campaign.status === 'COMPLETED' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-purple-500" />
                <div>
                  <CardTitle>AI Insights</CardTitle>
                  <CardDescription>
                    Automated recommendations and insights
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <Badge 
                        variant={
                          insight.type === 'opportunity' ? 'default' :
                          insight.type === 'alert' ? 'destructive' :
                          'secondary'
                        }
                        className="text-xs"
                      >
                        {insight.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{insight.description}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      {insight.action}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Get started with common tasks and workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/dashboard/data-import">
                <Database className="h-6 w-6 mb-2" />
                <span>Import Data</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/dashboard/customers">
                <Users className="h-6 w-6 mb-2" />
                <span>Manage Customers</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/dashboard/content">
                <Mail className="h-6 w-6 mb-2" />
                <span>Create Content</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/dashboard/journeys">
                <Target className="h-6 w-6 mb-2" />
                <span>Build Journey</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
