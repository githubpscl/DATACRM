'use client'

import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CustomersMapPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kartenansicht nach Regionen</h1>
          <p className="text-gray-600 mt-1">Geografische Verteilung Ihrer Kunden</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>Diese Seite wird bald verfügbar sein.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Hier sehen Sie zukünftig eine Kartenansicht Ihrer Kunden nach Regionen.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
