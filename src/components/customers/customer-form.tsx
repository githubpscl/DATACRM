'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { addCustomer } from '@/lib/supabase'
import { CustomerFormData } from '@/types/database'
import { X, User, Building2, Mail, Phone, MapPin, Tag, Star } from 'lucide-react'

interface CustomerFormProps {
  onClose: () => void
  onSuccess: () => void
  customer?: any // For editing existing customers
}

export default function CustomerForm({ onClose, onSuccess, customer }: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    customer_type: customer?.customer_type || 'person',
    email: customer?.email || '',
    first_name: customer?.first_name || '',
    last_name: customer?.last_name || '',
    company_name: customer?.company_name || '',
    phone: customer?.phone || '',
    mobile: customer?.mobile || '',
    salutation: customer?.salutation || '',
    industry: customer?.industry || '',
    customer_status: customer?.customer_status || 'lead',
    priority: customer?.priority || 'normal',
    notes: customer?.notes || '',
    website: customer?.website || '',
    street: customer?.street || '',
    house_number: customer?.house_number || '',
    postal_code: customer?.postal_code || '',
    city: customer?.city || '',
    country: customer?.country || 'Deutschland'
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (customer) {
        // Update existing customer logic would go here
        console.log('Update customer not implemented yet')
      } else {
        const { data, error } = await addCustomer(formData)
        if (error) throw error
      }
      
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center">
            {formData.customer_type === 'company' ? (
              <Building2 className="h-5 w-5 mr-2" />
            ) : (
              <User className="h-5 w-5 mr-2" />
            )}
            {customer ? 'Kunde bearbeiten' : 'Neuen Kunden erstellen'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Customer Type Selection */}
            <div className="space-y-2">
              <Label>Kundentyp *</Label>
              <select 
                value={formData.customer_type} 
                onChange={(e) => handleInputChange('customer_type', e.target.value as 'person' | 'company')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Kundentyp auswählen</option>
                <option value="person">👤 Person</option>
                <option value="company">🏢 Unternehmen</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Grunddaten
                </h3>
                
                {formData.customer_type === 'person' ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="salutation">Anrede</Label>
                        <select 
                          value={formData.salutation} 
                          onChange={(e) => handleInputChange('salutation', e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Anrede</option>
                          <option value="Herr">Herr</option>
                          <option value="Frau">Frau</option>
                          <option value="Dr.">Dr.</option>
                          <option value="Prof.">Prof.</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">Vorname *</Label>
                        <Input
                          id="first_name"
                          value={formData.first_name}
                          onChange={(e) => handleInputChange('first_name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Nachname *</Label>
                        <Input
                          id="last_name"
                          value={formData.last_name}
                          onChange={(e) => handleInputChange('last_name', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Firmenname *</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail-Adresse *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Branche</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    placeholder="z.B. IT, Automotive, Marketing"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Contact & Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Kontakt & Status
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+49 ..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobil</Label>
                    <Input
                      id="mobile"
                      value={formData.mobile}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      placeholder="+49 ..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Kundenstatus</Label>
                  <select 
                    value={formData.customer_status} 
                    onChange={(e) => handleInputChange('customer_status', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="lead">Lead</option>
                    <option value="prospect">Interessent</option>
                    <option value="customer">Kunde</option>
                    <option value="inactive">Inaktiv</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Star className="h-4 w-4 mr-2" />
                    Priorität
                  </Label>
                  <select 
                    value={formData.priority} 
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="low">Niedrig</option>
                    <option value="normal">Normal</option>
                    <option value="high">Hoch</option>
                    <option value="critical">Kritisch</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Adresse
                  </h4>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="street">Straße</Label>
                      <Input
                        id="street"
                        value={formData.street}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="house_number">Nr.</Label>
                      <Input
                        id="house_number"
                        value={formData.house_number}
                        onChange={(e) => handleInputChange('house_number', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">PLZ</Label>
                      <Input
                        id="postal_code"
                        value={formData.postal_code}
                        onChange={(e) => handleInputChange('postal_code', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="city">Ort</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Notizen
              </Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                placeholder="Zusätzliche Informationen über den Kunden..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Speichern...
                  </>
                ) : (
                  customer ? 'Aktualisieren' : 'Erstellen'
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
