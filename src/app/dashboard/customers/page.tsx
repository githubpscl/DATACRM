'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { apiCall } from '@/components/auth-provider'
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Mail, 
  Phone, 
  Building2,
  User,
  Trash2,
  Edit,
  MoreVertical,
  MapPin
} from 'lucide-react'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  position?: string
  address?: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  tags: string[]
  status: 'active' | 'inactive' | 'lead' | 'prospect'
  source: string
  createdAt: string
  lastActivity?: string
  totalValue?: number
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  lead: 'bg-blue-100 text-blue-800',
  prospect: 'bg-yellow-100 text-yellow-800'
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    filterCustomers()
  }, [customers, searchTerm, selectedStatus])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const response = await apiCall('/api/customers')
      setCustomers(response.customers || [])
    } catch (error) {
      console.error('Error loading customers:', error)
      // Mock data for demo
      const mockCustomers: Customer[] = [
        {
          id: '1',
          firstName: 'Anna',
          lastName: 'Schmidt',
          email: 'anna.schmidt@example.com',
          phone: '+49 170 1234567',
          company: 'TechStart GmbH',
          position: 'Marketing Director',
          address: {
            street: 'Hauptstraße 123',
            city: 'München',
            state: 'Bayern',
            postalCode: '80331',
            country: 'Deutschland'
          },
          tags: ['premium', 'tech'],
          status: 'active',
          source: 'Website',
          createdAt: '2024-01-15',
          lastActivity: '2024-01-20',
          totalValue: 15000
        },
        {
          id: '2',
          firstName: 'Michael',
          lastName: 'Weber',
          email: 'michael.weber@corp.com',
          phone: '+49 171 9876543',
          company: 'Corporate Solutions',
          position: 'CEO',
          address: {
            street: 'Geschäftsstraße 45',
            city: 'Hamburg',
            state: 'Hamburg',
            postalCode: '20095',
            country: 'Deutschland'
          },
          tags: ['enterprise', 'vip'],
          status: 'prospect',
          source: 'LinkedIn',
          createdAt: '2024-01-10',
          lastActivity: '2024-01-18',
          totalValue: 25000
        },
        {
          id: '3',
          firstName: 'Sarah',
          lastName: 'Müller',
          email: 'sarah.mueller@startup.de',
          company: 'Innovation Labs',
          position: 'CTO',
          tags: ['startup', 'tech'],
          status: 'lead',
          source: 'Event',
          createdAt: '2024-01-12',
          totalValue: 8000
        }
      ]
      setCustomers(mockCustomers)
    } finally {
      setLoading(false)
    }
  }

  const filterCustomers = () => {
    let filtered = customers

    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(customer => customer.status === selectedStatus)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Lade Kunden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kundenmanagement</h1>
          <p className="text-gray-600 mt-1">
            Verwalten Sie Ihre Kundendaten und -beziehungen
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gesamt Kunden</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktive Kunden</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Leads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.status === 'lead').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Phone className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gesamtwert</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(customers.reduce((sum, c) => sum + (c.totalValue || 0), 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Suche nach Name, E-Mail oder Unternehmen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Alle Status</option>
                <option value="active">Aktiv</option>
                <option value="inactive">Inaktiv</option>
                <option value="lead">Lead</option>
                <option value="prospect">Prospect</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Kundenliste</CardTitle>
            {selectedCustomers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedCustomers.length} ausgewählt
                </span>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  E-Mail senden
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Löschen
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left py-3 px-4">Kunde</th>
                  <th className="text-left py-3 px-4">Unternehmen</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Tags</th>
                  <th className="text-left py-3 px-4">Quelle</th>
                  <th className="text-left py-3 px-4">Wert</th>
                  <th className="text-left py-3 px-4">Letzte Aktivität</th>
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
                            {getInitials(customer.firstName, customer.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                          {customer.phone && (
                            <div className="text-sm text-gray-500">{customer.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{customer.company}</div>
                        {customer.position && (
                          <div className="text-sm text-gray-500">{customer.position}</div>
                        )}
                        {customer.address?.city && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {customer.address.city}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={statusColors[customer.status]}>
                        {customer.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {customer.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {customer.source}
                    </td>
                    <td className="py-3 px-4">
                      {customer.totalValue && (
                        <span className="font-medium text-gray-900">
                          {formatCurrency(customer.totalValue)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {customer.lastActivity && new Date(customer.lastActivity).toLocaleDateString('de-DE')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredCustomers.length === 0 && (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Kunden gefunden</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Keine Kunden entsprechen Ihren Suchkriterien.' : 'Erstellen Sie Ihren ersten Kunden.'}
                </p>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Neuer Kunde
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
