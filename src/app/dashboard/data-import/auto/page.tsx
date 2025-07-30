'use client'

import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DataImportAutoPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automatisches synchronisieren</h1>
          <p className="text-gray-600 mt-1">Automatische Datensynchronisation einrichten und verwalten</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>Diese Seite wird bald verfügbar sein.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Hier können Sie zukünftig automatische Synchronisation einrichten.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
