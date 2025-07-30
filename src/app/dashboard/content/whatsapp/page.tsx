'use client'

import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ContentWhatsAppPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Studio</h1>
          <p className="text-gray-600 mt-1">WhatsApp-Nachrichten und -Kampagnen erstellen</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>Diese Seite wird bald verfügbar sein.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Hier können Sie zukünftig WhatsApp-Nachrichten und -Kampagnen erstellen.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
