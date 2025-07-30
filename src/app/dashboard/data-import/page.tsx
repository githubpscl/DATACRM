'use client'

import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Upload,
  FileText,
  Database,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3
} from 'lucide-react'

const recentImports = [
  {
    id: 1,
    name: 'Kundendaten_Januar.csv',
    date: '2024-01-20',
    status: 'success',
    records: 1234,
    type: 'CSV'
  },
  {
    id: 2,
    name: 'Newsletter_Abonnenten.xlsx',
    date: '2024-01-18',
    status: 'processing',
    records: 892,
    type: 'Excel'
  },
  {
    id: 3,
    name: 'API_Sync_Shopify',
    date: '2024-01-15',
    status: 'success',
    records: 456,
    type: 'API'
  }
]

const importStats = {
  totalImports: 45,
  successfulImports: 41,
  recordsImported: 28750,
  lastImport: '2 Stunden'
}

export default function DataImportPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daten hinzufügen</h1>
          <p className="text-gray-600 mt-1">Importieren Sie neue Daten in Ihr CRM-System</p>
        </div>

        {/* Import Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">CSV/Excel Import</CardTitle>
              <CardDescription>
                Laden Sie CSV oder Excel-Dateien hoch
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Datei hochladen
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-green-500">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Database className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">API Integration</CardTitle>
              <CardDescription>
                Verbinden Sie externe Systeme über API
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                API einrichten
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-purple-500">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Manueller Import</CardTitle>
              <CardDescription>
                Daten manuell eingeben oder kopieren
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Manuell hinzufügen
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Imports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Letzte Importe
              </CardTitle>
              <CardDescription>
                Übersicht über Ihre neuesten Datenimporte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentImports.map((importItem) => (
                <div key={importItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      importItem.status === 'success' ? 'bg-green-100 text-green-600' :
                      importItem.status === 'processing' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {importItem.status === 'success' && <CheckCircle className="h-4 w-4" />}
                      {importItem.status === 'processing' && <Clock className="h-4 w-4" />}
                      {importItem.status === 'error' && <AlertCircle className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{importItem.name}</h4>
                      <p className="text-xs text-gray-600">
                        {importItem.records.toLocaleString()} Datensätze • {importItem.date}
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    importItem.status === 'success' ? 'default' :
                    importItem.status === 'processing' ? 'secondary' : 'destructive'
                  }>
                    {importItem.type}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Import Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Import-Statistiken
              </CardTitle>
              <CardDescription>
                Überblick über Ihre Import-Performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">{importStats.totalImports}</div>
                  <div className="text-sm text-blue-600">Gesamt Importe</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">{importStats.successfulImports}</div>
                  <div className="text-sm text-green-600">Erfolgreich</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Erfolgsrate</span>
                  <span className="text-sm text-gray-600">
                    {((importStats.successfulImports / importStats.totalImports) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(importStats.successfulImports / importStats.totalImports) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Datensätze importiert</span>
                  <span className="text-lg font-bold">{importStats.recordsImported.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Letzter Import: vor {importStats.lastImport}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
