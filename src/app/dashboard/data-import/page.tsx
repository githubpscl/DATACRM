'use client'

import { useState, useRef } from 'react'
import Papa from 'papaparse'
import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { addCustomersBulk } from '@/lib/supabase'
import { 
  Upload,
  Database,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  X,
  FileSpreadsheet
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
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      handleFiles(Array.from(files))
    }
  }

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  // Process uploaded files
  const handleFiles = (files: File[]) => {
    // Filter for allowed file types
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    const validFiles = files.filter(file => 
      allowedTypes.includes(file.type) || 
      file.name.toLowerCase().endsWith('.csv') ||
      file.name.toLowerCase().endsWith('.xlsx') ||
      file.name.toLowerCase().endsWith('.xls')
    )

    if (validFiles.length !== files.length) {
      alert('Nur CSV und Excel-Dateien sind erlaubt.')
    }

    // Add files to preview list (no upload yet)
    setUploadedFiles(prev => [...prev, ...validFiles])
  }

  // Process and upload files to database
  const processFiles = async () => {
    if (uploadedFiles.length === 0) {
      alert('Bitte wählen Sie zuerst Dateien aus.')
      return
    }

    setIsUploading(true)
    let successCount = 0
    let failCount = 0

    for (const file of uploadedFiles) {
      try {
        await processFile(file)
        successCount++
      } catch (error) {
        failCount++
        console.error(`Failed to process ${file.name}:`, error)
      }
    }

    setIsUploading(false)
    
    // Show final summary
    if (successCount > 0 && failCount === 0) {
      alert(`🎉 Alle ${successCount} Datei(en) erfolgreich verarbeitet! Die Daten sind jetzt in Ihrer Datenbank verfügbar.`)
    } else if (successCount > 0 && failCount > 0) {
      alert(`⚠️ ${successCount} Datei(en) erfolgreich verarbeitet, ${failCount} Datei(en) fehlgeschlagen.`)
    } else {
      alert(`❌ Alle ${failCount} Datei(en) konnten nicht verarbeitet werden.`)
    }
    
    // Clear the uploaded files after processing attempt
    if (successCount > 0) {
      setUploadedFiles([])
      setUploadProgress({})
    }
  }

  // Process individual file
  const processFile = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string
          
          // Update progress to show parsing
          setUploadProgress(prev => ({ ...prev, [file.name]: 10 }))
          
          // Parse CSV data
          Papa.parse(content, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
              try {
                const csvData = results.data as Record<string, string>[]
                
                // Update progress to show data validation
                setUploadProgress(prev => ({ ...prev, [file.name]: 30 }))
                
                // Map CSV columns to database fields
                const customers = csvData.map((row) => {
                  // Try different common column name variations
                  const email = row.email || row.Email || row.EMAIL || row['E-Mail'] || row.mail
                  const firstName = row.first_name || row.First_Name || row.firstname || row.Vorname || row['First Name']
                  const lastName = row.last_name || row.Last_Name || row.lastname || row.Nachname || row['Last Name']
                  const company = row.company || row.Company || row.Unternehmen || row.Firma
                  const phone = row.phone || row.Phone || row.Telefon || row.Tel || row['Phone Number']
                  
                  // Skip rows without email
                  if (!email) return null
                  
                  return {
                    email: email.trim(),
                    first_name: firstName?.trim() || null,
                    last_name: lastName?.trim() || null,
                    company: company?.trim() || null,
                    phone: phone?.trim() || null
                  }
                }).filter(customer => customer !== null)
                
                console.log(`Parsed ${customers.length} customers from ${file.name}`)
                
                // Update progress to show database insertion
                setUploadProgress(prev => ({ ...prev, [file.name]: 60 }))
                
                // Insert data into Supabase
                if (customers.length > 0) {
                  const { data, error } = await addCustomersBulk(customers)
                  
                  if (error) {
                    console.error('Database error:', error)
                    alert(`Fehler beim Speichern der Daten aus ${file.name}: ${error.message}`)
                    setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
                    reject(error)
                    return
                  }
                  
                  console.log(`Successfully inserted ${data?.length || customers.length} customers`)
                  
                  // Complete progress
                  setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
                  
                  // Show success message with details
                  setTimeout(() => {
                    alert(`✅ ${file.name}: ${customers.length} Kundendaten erfolgreich importiert!`)
                  }, 500)
                  
                } else {
                  alert(`⚠️ ${file.name}: Keine gültigen Kundendaten gefunden. Stellen Sie sicher, dass die Datei eine 'email' Spalte enthält.`)
                  setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
                }
                
                resolve()
                
              } catch (error) {
                console.error('Processing error:', error)
                alert(`Fehler beim Verarbeiten von ${file.name}: ${error}`)
                setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
                reject(error)
              }
            },
            error: (error: Error) => {
              console.error('CSV parsing error:', error)
              alert(`Fehler beim Lesen der CSV-Datei ${file.name}: ${error.message}`)
              setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
              reject(error)
            }
          })
          
        } catch (error) {
          console.error('File reading error:', error)
          alert(`Fehler beim Lesen der Datei ${file.name}`)
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
          reject(error)
        }
      }
      
      reader.onerror = () => {
        alert(`Fehler beim Lesen der Datei ${file.name}`)
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
        reject(new Error('File reading failed'))
      }
      
      reader.readAsText(file)
    })
  }

  // Remove uploaded file
  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(file => file.name !== fileName))
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[fileName]
      return newProgress
    })
  }

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daten hinzufügen</h1>
          <p className="text-gray-600 mt-1">Importieren Sie neue Daten in Ihr CRM-System</p>
        </div>

        {/* Import Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">CSV/Excel Import</CardTitle>
              <CardDescription>
                Laden Sie CSV oder Excel-Dateien hoch
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {/* Drag and drop zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400'
                }`}
                onClick={triggerFileInput}
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  {uploadedFiles.length > 0 
                    ? 'Weitere Dateien hinzufügen'
                    : 'Dateien hier ablegen oder klicken zum Auswählen'
                  }
                </p>
                <p className="text-xs text-gray-500">
                  CSV, XLS, XLSX (max. 10MB)
                </p>
              </div>

              {/* Uploaded files list */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileSpreadsheet className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm truncate block" title={file.name}>{file.name}</span>
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB • Bereit zur Verarbeitung
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {uploadProgress[file.name] !== undefined && uploadProgress[file.name] < 100 && (
                          <div className="text-xs text-blue-600 font-medium">
                            {Math.round(uploadProgress[file.name])}%
                          </div>
                        )}
                        {uploadProgress[file.name] === 100 && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {!uploadProgress[file.name] && (
                          <Clock className="h-4 w-4 text-gray-400" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(file.name)
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Button 
                  onClick={uploadedFiles.length > 0 ? processFiles : triggerFileInput}
                  className="w-full"
                  disabled={isUploading}
                  variant={uploadedFiles.length > 0 ? "default" : "outline"}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading 
                    ? 'Wird verarbeitet...' 
                    : uploadedFiles.length > 0 
                      ? `${uploadedFiles.length} Datei(en) verarbeiten`
                      : 'Dateien auswählen'
                  }
                </Button>
                
                {uploadedFiles.length > 0 && !isUploading && (
                  <Button 
                    onClick={triggerFileInput}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Weitere Dateien hinzufügen
                  </Button>
                )}
              </div>
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
