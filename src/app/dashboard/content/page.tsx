'use client'

import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  PenTool, 
  Mail, 
  MessageSquare, 
  Phone, 
  Plus,
  Eye,
  Edit,
  Copy,
  Trash2
} from 'lucide-react'

const contentTypes = [
  {
    name: 'Email Builder',
    description: 'Erstelle professionelle E-Mail-Templates und Newsletter',
    icon: Mail,
    href: '/dashboard/content/email',
    color: 'blue',
    count: 12
  },
  {
    name: 'WhatsApp Studio',
    description: 'Gestalte ansprechende WhatsApp-Nachrichten',
    icon: MessageSquare,
    href: '/dashboard/content/whatsapp',
    color: 'green',
    count: 8
  },
  {
    name: 'SMS Builder',
    description: 'Kurze und prägnante SMS-Kampagnen erstellen',
    icon: Phone,
    href: '/dashboard/content/sms',
    color: 'purple',
    count: 5
  }
]

const recentTemplates = [
  {
    id: 1,
    name: 'Willkommens-E-Mail',
    type: 'EMAIL',
    lastModified: '2024-01-20',
    status: 'ACTIVE',
    usage: 234
  },
  {
    id: 2,
    name: 'Produkt-Launch WhatsApp',
    type: 'WHATSAPP',
    lastModified: '2024-01-18',
    status: 'DRAFT',
    usage: 0
  },
  {
    id: 3,
    name: 'Reminder SMS',
    type: 'SMS',
    lastModified: '2024-01-15',
    status: 'ACTIVE',
    usage: 156
  }
]

export default function ContentBuilderPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Builder</h1>
            <p className="text-gray-600 mt-1">
              Erstelle und verwalte Templates für alle Kommunikationskanäle
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neues Template
          </Button>
        </div>

        {/* Content Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contentTypes.map((type) => {
            const Icon = type.icon
            return (
              <Card key={type.name} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-${type.color}-100`}>
                      <Icon className={`h-6 w-6 text-${type.color}-600`} />
                    </div>
                    <Badge variant="secondary">{type.count} Templates</Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{type.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <PenTool className="h-4 w-4 mr-2" />
                    Builder öffnen
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recent Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Zuletzt bearbeitet</CardTitle>
            <CardDescription>
              Ihre neuesten Template-Entwürfe und aktive Inhalte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTemplates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {template.type === 'EMAIL' && <Mail className="h-4 w-4" />}
                      {template.type === 'WHATSAPP' && <MessageSquare className="h-4 w-4" />}
                      {template.type === 'SMS' && <Phone className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Bearbeitet: {template.lastModified}</span>
                        <Badge variant={template.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {template.status}
                        </Badge>
                        <span>{template.usage} mal verwendet</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
