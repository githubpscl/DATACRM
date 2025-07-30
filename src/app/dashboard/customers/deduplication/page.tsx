'use client'

import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CustomersDeduplicationPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deduplizierungs-Regeln</h1>
          <p className="text-gray-600 mt-1">Regeln zur automatischen Erkennung und Bereinigung von Duplikaten</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>Diese Seite wird bald verfügbar sein.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Hier können Sie zukünftig Regeln für die Deduplizierung verwalten.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
