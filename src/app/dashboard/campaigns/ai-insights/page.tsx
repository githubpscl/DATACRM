'use client'

import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CampaignsAIInsightsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KI-Zusammenfassung</h1>
          <p className="text-gray-600 mt-1">KI-basierte Analyse und Optimierungsvorschläge für Ihre Kampagnen</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>Diese Seite wird bald verfügbar sein.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Hier erhalten Sie zukünftig KI-basierte Einblicke und Optimierungsvorschläge für Ihre Kampagnen.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
