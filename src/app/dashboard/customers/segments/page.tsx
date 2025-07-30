'use client'

import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CustomersSegmentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nach Segmenten filtern</h1>
          <p className="text-gray-600 mt-1">Kunden nach verschiedenen Segmenten und Kriterien filtern</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>Diese Seite wird bald verfügbar sein.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Hier können Sie zukünftig Ihre Kunden nach Segmenten filtern und verwalten.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
