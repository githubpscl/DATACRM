'use client'

import DashboardLayout from '@/components/dashboard/layout'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getCustomers } from '@/lib/supabase'
import { 
  Search, 
  Plus, 
  Download, 
  Mail, 
  Phone, 
  Building2,
  User,
  Edit,
  MoreVertical
} from 'lucide-react'

interface Customer {
  id: string
  email: string
  first_name?: string
  last_name?: string
  company?: string
  phone?: string
  created_at?: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    filterCustomers()
  }, [customers, searchTerm])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const { data, error } = await getCustomers()
      
      if (error) {
        console.error('Error loading customers:', error)
        setCustomers([])
      } else {
        setCustomers(data || [])
      }
    } catch (error) {
      console.error('Error loading customers:', error)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const filterCustomers = () => {
    let filtered = customers

    if (searchTerm) {
      filtered = filtered.filter(customer => {
        const firstName = customer.first_name || ''
        const lastName = customer.last_name || ''
        const email = customer.email || ''
        const company = customer.company || ''
        
        return firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               email.toLowerCase().includes(searchTerm.toLowerCase()) ||
               company.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    setFilteredCustomers(filtered)
  }

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id))
    }
  }

  const getInitials = (customer: Customer) => {
    const firstName = customer.first_name || ''
    const lastName = customer.last_name || ''
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    } else if (firstName) {
      return firstName.substring(0, 2).toUpperCase()
    } else if (customer.email) {
      return customer.email.substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  const getDisplayName = (customer: Customer) => {
    const firstName = customer.first_name || ''
    const lastName = customer.last_name || ''
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    } else if (firstName) {
      return firstName
    } else if (lastName) {
      return lastName
    }
    return customer.email.split('@')[0]
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Lade Kunden...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kundenmanagement</h1>
            <p className="text-gray-600 mt-1">
              Verwalten Sie Ihre Kundendaten und -beziehungen ({filteredCustomers.length} Kunden)
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Kunde
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Kunden durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Alle Kunden</span>
              <span className="text-sm font-normal text-gray-500">
                {selectedCustomers.length > 0 && `${selectedCustomers.length} ausgewählt`}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Kunden gefunden</h3>
                <p className="text-gray-500 mb-4">
                  {customers.length === 0 
                    ? 'Noch keine Kunden vorhanden. Importieren Sie Daten oder erstellen Sie neue Kunden.'
                    : 'Keine Kunden entsprechen Ihren Suchkriterien.'
                  }
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ersten Kunden erstellen
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.length === filteredCustomers.length}
                          onChange={handleSelectAll}
                          className="rounded"
                        />
                      </th>
                      <th className="text-left py-3 px-4">Kunde</th>
                      <th className="text-left py-3 px-4">Unternehmen</th>
                      <th className="text-left py-3 px-4">Telefon</th>
                      <th className="text-left py-3 px-4">Erstellt am</th>
                      <th className="text-left py-3 px-4">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedCustomers.includes(customer.id)}
                            onChange={() => handleSelectCustomer(customer.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {getInitials(customer)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">
                                {getDisplayName(customer)}
                              </div>
                              <div className="text-sm text-gray-500">{customer.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {customer.company || '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">
                            {customer.phone || '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">
                            {customer.created_at ? new Date(customer.created_at).toLocaleDateString('de-DE') : '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Mail className="h-4 w-4" />
                            </Button>
                            {customer.phone && (
                              <Button variant="ghost" size="sm">
                                <Phone className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
