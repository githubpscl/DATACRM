'use client'

import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function JourneysCreatePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journey erstellen</h1>
          <p className="text-gray-600 mt-1">Drag & Drop Editor für Customer Journeys</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>Diese Seite wird bald verfügbar sein.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Hier können Sie zukünftig neue Customer Journeys mit Drag & Drop erstellen.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
