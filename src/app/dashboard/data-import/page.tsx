'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { apiCall } from '@/components/auth-provider'
import { 
  Upload,
  FileText,
  Database,
  CheckCircle,
  AlertCircle,
  XCircle,
  Download,
  Settings,
  Users,
  Building2,
  Mail,
  Phone,
  MapPin,
  Tag,
  Calendar,
  Target,
  BarChart3,
  RefreshCw
} from 'lucide-react'

interface ImportJob {
  id: string
  fileName: string
  status: 'processing' | 'completed' | 'failed' | 'validating'
  totalRecords: number
  processedRecords: number
  validRecords: number
  invalidRecords: number
  duplicateRecords: number
  createdAt: string
  completedAt?: string
  errors: string[]
  mapping: FieldMapping
}

interface FieldMapping {
  [key: string]: string // CSV column -> database field
}

interface ImportPreview {
  headers: string[]
  sampleData: string[][]
  detectedFields: { [key: string]: string }
  totalRows: number
}

const availableFields = [
  { key: 'firstName', label: 'Vorname', icon: Users, required: false },
  { key: 'lastName', label: 'Nachname', icon: Users, required: false },
  { key: 'email', label: 'E-Mail', icon: Mail, required: true },
  { key: 'phone', label: 'Telefon', icon: Phone, required: false },
  { key: 'company', label: 'Unternehmen', icon: Building2, required: false },
  { key: 'position', label: 'Position', icon: Target, required: false },
  { key: 'street', label: 'Straße', icon: MapPin, required: false },
  { key: 'city', label: 'Stadt', icon: MapPin, required: false },
  { key: 'postalCode', label: 'PLZ', icon: MapPin, required: false },
  { key: 'country', label: 'Land', icon: MapPin, required: false },
  { key: 'tags', label: 'Tags', icon: Tag, required: false },
  { key: 'source', label: 'Quelle', icon: BarChart3, required: false }
]

export default function DataImportPage() {
  const [importJobs, setImportJobs] = useState<ImportJob[]>([])
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null)
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({})
  const [importStep, setImportStep] = useState<'upload' | 'mapping' | 'processing'>('upload')

  // File upload handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Bitte wählen Sie eine CSV-Datei aus.')
      return
    }

    setSelectedFile(file)
    setLoading(true)

    try {
      // Simulate file processing for preview
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const sampleData = lines.slice(1, 6).map(line => 
        line.split(',').map(cell => cell.trim().replace(/"/g, ''))
      )

      // Auto-detect field mappings
      const detectedFields: { [key: string]: string } = {}
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase()
        if (lowerHeader.includes('email') || lowerHeader.includes('e-mail')) {
          detectedFields[header] = 'email'
        } else if (lowerHeader.includes('first') || lowerHeader.includes('vorname')) {
          detectedFields[header] = 'firstName'
        } else if (lowerHeader.includes('last') || lowerHeader.includes('nachname')) {
          detectedFields[header] = 'lastName'
        } else if (lowerHeader.includes('company') || lowerHeader.includes('unternehmen')) {
          detectedFields[header] = 'company'
        } else if (lowerHeader.includes('phone') || lowerHeader.includes('telefon')) {
          detectedFields[header] = 'phone'
        } else if (lowerHeader.includes('city') || lowerHeader.includes('stadt')) {
          detectedFields[header] = 'city'
        }
      })

      setImportPreview({
        headers,
        sampleData,
        detectedFields,
        totalRows: lines.length - 1
      })

      setFieldMapping(detectedFields)
      setImportStep('mapping')
    } catch (error) {
      console.error('Error processing file:', error)
      alert('Fehler beim Verarbeiten der Datei')
    } finally {
      setLoading(false)
    }
  }

  const handleFieldMappingChange = (csvColumn: string, dbField: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [csvColumn]: dbField
    }))
  }

  const startImport = async () => {
    if (!selectedFile || !importPreview) return

    // Validate required fields
    const hasRequiredEmail = Object.values(fieldMapping).includes('email')
    if (!hasRequiredEmail) {
      alert('E-Mail-Feld ist erforderlich. Bitte ordnen Sie eine Spalte dem E-Mail-Feld zu.')
      return
    }

    setImportStep('processing')
    setLoading(true)

    try {
      // Simulate import process
      const newJob: ImportJob = {
        id: Date.now().toString(),
        fileName: selectedFile.name,
        status: 'processing',
        totalRecords: importPreview.totalRows,
        processedRecords: 0,
        validRecords: 0,
        invalidRecords: 0,
        duplicateRecords: 0,
        createdAt: new Date().toISOString(),
        errors: [],
        mapping: fieldMapping
      }

      setImportJobs(prev => [newJob, ...prev])

      // Simulate processing with progress updates
      const updateProgress = (processed: number, valid: number, invalid: number, duplicates: number) => {
        setImportJobs(prev => prev.map(job => 
          job.id === newJob.id 
            ? { 
                ...job, 
                processedRecords: processed,
                validRecords: valid,
                invalidRecords: invalid,
                duplicateRecords: duplicates,
                status: processed === importPreview.totalRows ? 'completed' : 'processing'
              }
            : job
        ))
      }

      // Simulate progress
      for (let i = 0; i <= importPreview.totalRows; i += Math.ceil(importPreview.totalRows / 10)) {
        await new Promise(resolve => setTimeout(resolve, 500))
        const processed = Math.min(i, importPreview.totalRows)
        const valid = Math.floor(processed * 0.85)
        const invalid = Math.floor(processed * 0.10)
        const duplicates = processed - valid - invalid
        
        updateProgress(processed, valid, invalid, duplicates)
      }

      // Reset form
      setSelectedFile(null)
      setImportPreview(null)
      setFieldMapping({})
      setImportStep('upload')
    } catch (error) {
      console.error('Import error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: ImportJob['status']) => {
    switch (status) {
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'validating':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: ImportJob['status']) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'validating':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Datenimport</h1>
          <p className="text-gray-600 mt-1">
            Importieren Sie Kundendaten aus CSV-Dateien
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Vorlage herunterladen
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Import-Einstellungen
          </Button>
        </div>
      </div>

      {/* Import Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gesamt Importe</p>
                <p className="text-2xl font-bold text-gray-900">{importJobs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Erfolgreiche Importe</p>
                <p className="text-2xl font-bold text-gray-900">
                  {importJobs.filter(job => job.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Importierte Datensätze</p>
                <p className="text-2xl font-bold text-gray-900">
                  {importJobs.reduce((sum, job) => sum + job.validRecords, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <RefreshCw className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktive Importe</p>
                <p className="text-2xl font-bold text-gray-900">
                  {importJobs.filter(job => job.status === 'processing').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Upload Section */}
      {importStep === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Neue Datei importieren</CardTitle>
            <CardDescription>
              Laden Sie eine CSV-Datei hoch, um Kundendaten zu importieren
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Datei hier ablegen oder klicken zum Auswählen
              </h3>
              <p className="text-gray-600 mb-4">
                Unterstützte Formate: CSV (max. 10MB)
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button disabled={loading}>
                  {loading ? 'Verarbeite...' : 'Datei auswählen'}
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Field Mapping */}
      {importStep === 'mapping' && importPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Feld-Zuordnung</CardTitle>
            <CardDescription>
              Ordnen Sie die CSV-Spalten den entsprechenden Datenbankfeldern zu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* File Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="font-medium">{selectedFile?.name}</span>
                  </div>
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    <span>{importPreview.totalRows.toLocaleString()} Datensätze</span>
                  </div>
                  <div className="flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    <span>{importPreview.headers.length} Spalten</span>
                  </div>
                </div>
              </div>

              {/* Mapping Table */}
              <div className="overflow-x-auto">
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-3 border-b">CSV-Spalte</th>
                      <th className="text-left p-3 border-b">Beispieldaten</th>
                      <th className="text-left p-3 border-b">Datenbankfeld</th>
                      <th className="text-left p-3 border-b">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.headers.map((header, index) => {
                      const mappedField = fieldMapping[header]
                      const fieldInfo = availableFields.find(f => f.key === mappedField)
                      const isRequired = fieldInfo?.required
                      const hasMapping = !!mappedField

                      return (
                        <tr key={header} className="border-b">
                          <td className="p-3 font-medium">{header}</td>
                          <td className="p-3 text-sm text-gray-600">
                            {importPreview.sampleData[0]?.[index] || '-'}
                          </td>
                          <td className="p-3">
                            <select
                              value={mappedField || ''}
                              onChange={(e) => handleFieldMappingChange(header, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                              <option value="">-- Nicht zuordnen --</option>
                              {availableFields.map(field => (
                                <option key={field.key} value={field.key}>
                                  {field.label} {field.required ? '*' : ''}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3">
                            {hasMapping && (
                              <Badge className={isRequired ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                                {isRequired ? 'Erforderlich' : 'Optional'}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Sample Preview */}
              <div>
                <h4 className="font-medium mb-3">Datenvorschau</h4>
                <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        {importPreview.headers.map(header => (
                          <th key={header} className="text-left p-2 border-b">
                            {header}
                            {fieldMapping[header] && (
                              <div className="text-xs text-blue-600 mt-1">
                                → {availableFields.find(f => f.key === fieldMapping[header])?.label}
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.sampleData.slice(0, 3).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="p-2 border-b text-gray-700">
                              {cell || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setImportStep('upload')}>
                  Zurück
                </Button>
                <Button onClick={startImport} disabled={!Object.values(fieldMapping).includes('email')}>
                  Import starten
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Jobs History */}
      <Card>
        <CardHeader>
          <CardTitle>Import-Verlauf</CardTitle>
          <CardDescription>
            Übersicht über alle Datenimports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {importJobs.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Noch keine Importe</h3>
              <p className="text-gray-600">Starten Sie Ihren ersten Datenimport.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {importJobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <h4 className="font-medium text-gray-900">{job.fileName}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(job.createdAt).toLocaleString('de-DE')}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 text-sm">
                    <div>
                      <p className="text-gray-600">Gesamt</p>
                      <p className="font-medium">{job.totalRecords.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Verarbeitet</p>
                      <p className="font-medium">{job.processedRecords.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Gültig</p>
                      <p className="font-medium text-green-600">{job.validRecords.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Ungültig</p>
                      <p className="font-medium text-red-600">{job.invalidRecords.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duplikate</p>
                      <p className="font-medium text-yellow-600">{job.duplicateRecords.toLocaleString()}</p>
                    </div>
                  </div>

                  {job.status === 'processing' && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Fortschritt</span>
                        <span>{Math.round((job.processedRecords / job.totalRecords) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${(job.processedRecords / job.totalRecords) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
