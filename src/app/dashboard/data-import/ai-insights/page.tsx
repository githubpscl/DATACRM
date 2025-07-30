'use client'

import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DataImportAIInsightsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KI-Zusammenfassung</h1>
          <p className="text-gray-600 mt-1">KI-basierte Analyse und Handlungsempfehlungen für Ihre Daten</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>Diese Seite wird bald verfügbar sein.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Hier erhalten Sie zukünftig KI-basierte Einblicke zu Ihren Importen.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
