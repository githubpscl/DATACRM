'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  isSuperAdmin,
  getOrganizations,
  getOrgUsers,
  getAllUsers,
  getUnassignedUsers,
  updateUserProfile,
  addAdminToOrg,
  removeRole,
  assignRole
} from '@/lib/supabase'
import { 
  Users,
  Search,
  Filter,
  UserPlus,
  UserMinus,
  Shield,
  Building,
  Crown,
  AlertCircle,
  CheckCircle,
  Loader2,
  Edit,
  Trash2,
  Settings,
  ChevronDown,
  ChevronRight,
  Mail,
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react'

interface User {
  id: string
  email: string
  name?: string
  created_at: string
  last_sign_in_at?: string
  organization?: {
    id: string
    name: string
  }
  role?: string
  status: 'active' | 'inactive' | 'pending'
}

interface Organization {
  id: string
  name: string
  domain?: string
  created_at: string
  users: User[]
}

export default function UsersManagementPage() {
  const { user } = useAuth()
  const [isSuper, setIsSuper] = useState(false)
  const [loading, setLoading] = useState(true)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [unassignedUsers, setUnassignedUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterOrganization, setFilterOrganization] = useState<string>('all')
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set())
  const [showUnassigned, setShowUnassigned] = useState(true)
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<{
    name: string
    role: string
    organizationId: string
  }>({ name: '', role: '', organizationId: '' })
  const [savingUser, setSavingUser] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      if (!user?.email) {
        setLoading(false)
        return
      }

      try {
        // Check super admin status
        const superAdminStatus = await isSuperAdmin(user.email)
        setIsSuper(superAdminStatus)

        if (!superAdminStatus) {
          setLoading(false)
          return
        }

        // Load organizations and their users
        const { data: orgsData, error: orgsError } = await getOrganizations()
        if (orgsError) {
          console.error('Error loading organizations:', orgsError)
        } else {
          const orgsWithUsers: Organization[] = []
          
          for (const org of orgsData || []) {
            const { data: usersData, error: usersError } = await getOrgUsers(org.id)
            if (!usersError && usersData) {
              const transformedUsers = usersData.map((item: any) => ({
                id: item.user?.id || item.id,
                email: item.user?.email || 'unknown@example.com',
                name: item.user?.name || item.user?.email?.split('@')[0],
                created_at: item.created_at || new Date().toISOString(),
                last_sign_in_at: item.user?.last_sign_in_at,
                organization: { id: org.id, name: org.name },
                role: item.role || 'user',
                status: 'active' as const
              }))
              
              orgsWithUsers.push({
                ...org,
                users: transformedUsers
              })
            } else {
              orgsWithUsers.push({
                ...org,
                users: []
              })
            }
          }
          
          setOrganizations(orgsWithUsers)
        }

        // Load unassigned users
        const { data: unassignedData, error: unassignedError } = await getUnassignedUsers()
        if (unassignedError) {
          console.error('Error loading unassigned users:', unassignedError)
          // Fallback to demo data
          setUnassignedUsers([
            {
              id: 'unassigned-1',
              email: 'newuser@example.com',
              name: 'Neuer Benutzer',
              created_at: new Date().toISOString(),
              status: 'pending'
            },
            {
              id: 'unassigned-2',
              email: 'freelancer@example.com',
              name: 'Freelancer User',
              created_at: new Date(Date.now() - 86400000).toISOString(),
              status: 'active'
            }
          ])
        } else {
          // Transform unassigned users data
          const transformedUnassigned = (unassignedData || []).map((user: any) => ({
            id: user.id,
            email: user.email,
            name: user.name || user.email?.split('@')[0],
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
            status: (user.email_confirmed ? 'active' : 'pending') as 'active' | 'inactive' | 'pending'
          }))
          setUnassignedUsers(transformedUnassigned)
        }

      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  // Filter functions
  const filteredOrganizations = organizations.map(org => ({
    ...org,
    users: org.users.filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
      const matchesRole = filterRole === 'all' || user.role === filterRole
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus
      
      return matchesSearch && matchesRole && matchesStatus
    })
  })).filter(org => filterOrganization === 'all' || org.id === filterOrganization)

  const filteredUnassignedUsers = unassignedUsers.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    const matchesRole = filterRole === 'all' || (filterRole === 'unassigned' && !user.role)
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const toggleOrgExpansion = (orgId: string) => {
    const newExpanded = new Set(expandedOrgs)
    if (newExpanded.has(orgId)) {
      newExpanded.delete(orgId)
    } else {
      newExpanded.add(orgId)
    }
    setExpandedOrgs(newExpanded)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditingUser({
      name: user.name || '',
      role: user.role || 'user',
      organizationId: user.organization?.id || ''
    })
    setShowUserModal(true)
  }

  const handleSaveUser = async () => {
    if (!selectedUser) return

    setSavingUser(true)
    try {
      // Update user profile
      if (editingUser.name !== selectedUser.name) {
        const { error: profileError } = await updateUserProfile(selectedUser.id, {
          name: editingUser.name
        })
        if (profileError) {
          throw new Error((profileError as any)?.message || 'Fehler beim Aktualisieren des Profils')
        }
      }

      // Update organization assignment if changed
      if (editingUser.organizationId !== selectedUser.organization?.id) {
        // Remove from old organization if exists
        if (selectedUser.organization?.id) {
          await removeRole(selectedUser.id, selectedUser.organization.id)
        }
        
        // Add to new organization if selected
        if (editingUser.organizationId) {
          const { error: roleError } = await assignRole(
            selectedUser.id, 
            editingUser.role as 'user' | 'super_admin' | 'org_admin' | 'viewer',
            editingUser.organizationId
          )
          if (roleError) {
            throw new Error((roleError as any)?.message || 'Fehler beim Zuweisen der Rolle')
          }
        }
      } else if (editingUser.role !== selectedUser.role && selectedUser.organization?.id) {
        // Update role in same organization
        const { error: roleError } = await assignRole(
          selectedUser.id, 
          editingUser.role as 'user' | 'super_admin' | 'org_admin' | 'viewer',
          selectedUser.organization.id
        )
        if (roleError) {
          throw new Error((roleError as any)?.message || 'Fehler beim Aktualisieren der Rolle')
        }
      }
      
      alert(`✅ Benutzer ${selectedUser.email} erfolgreich aktualisiert!`)
      setShowUserModal(false)
      
      // Refresh data would trigger here in a real implementation
      // For now, we just close the modal
    } catch (error: any) {
      console.error('Error saving user:', error)
      alert(`Fehler beim Speichern: ${error.message || 'Unbekannter Fehler'}`)
    } finally {
      setSavingUser(false)
    }
  }

  const handleRemoveUser = async (userId: string, orgId: string) => {
    if (!confirm('Möchten Sie diesen Benutzer wirklich aus der Organisation entfernen?')) {
      return
    }

    try {
      const { error } = await removeRole(userId, orgId)
      if (error) {
        alert(`Fehler beim Entfernen des Benutzers: ${(error as any)?.message || 'Unbekannter Fehler'}`)
      } else {
        alert('✅ Benutzer erfolgreich entfernt!')
        // Refresh data would go here
      }
    } catch (error) {
      console.error('Error removing user:', error)
      alert('Fehler beim Entfernen des Benutzers.')
    }
  }

  const getTotalUsers = () => {
    return organizations.reduce((total, org) => total + org.users.length, 0) + unassignedUsers.length
  }

  const getFilteredTotalUsers = () => {
    return filteredOrganizations.reduce((total, org) => total + org.users.length, 0) + filteredUnassignedUsers.length
  }

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800'
      case 'org_admin': return 'bg-blue-100 text-blue-800'
      case 'user': return 'bg-green-100 text-green-800'
      case 'viewer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Lade Benutzerdaten...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!isSuper) {
    return (
      <DashboardLayout>
        <Card className="text-center py-12">
          <CardContent>
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Zugriff verweigert
            </h3>
            <p className="text-gray-600">
              Sie benötigen Super Admin-Rechte, um auf diese Seite zuzugreifen.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Benutzerverwaltung</h1>
            <p className="text-gray-600 mt-1">
              Verwalten Sie alle Benutzer und deren Organisationszugehörigkeit
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Benutzer hinzufügen
            </Button>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Massenaktionen
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Gesamte Benutzer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalUsers()}</div>
              <p className="text-xs text-gray-600">In {organizations.length} Organisationen</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Nicht zugeordnet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{unassignedUsers.length}</div>
              <p className="text-xs text-gray-600">Benötigen Organisation</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Aktive Benutzer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {organizations.reduce((total, org) => 
                  total + org.users.filter(u => u.status === 'active').length, 0) + 
                 unassignedUsers.filter(u => u.status === 'active').length}
              </div>
              <p className="text-xs text-gray-600">Online verfügbar</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Administratoren</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {organizations.reduce((total, org) => 
                  total + org.users.filter(u => u.role?.includes('admin')).length, 0)}
              </div>
              <p className="text-xs text-gray-600">Mit Admin-Rechten</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filter & Suche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Suche</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="E-Mail oder Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="roleFilter">Rolle</Label>
                <select
                  id="roleFilter"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Alle Rollen</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="org_admin">Organisations-Admin</option>
                  <option value="user">Benutzer</option>
                  <option value="viewer">Betrachter</option>
                  <option value="unassigned">Nicht zugeordnet</option>
                </select>
              </div>

              <div>
                <Label htmlFor="statusFilter">Status</Label>
                <select
                  id="statusFilter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Alle Status</option>
                  <option value="active">Aktiv</option>
                  <option value="inactive">Inaktiv</option>
                  <option value="pending">Ausstehend</option>
                </select>
              </div>

              <div>
                <Label htmlFor="orgFilter">Organisation</Label>
                <select
                  id="orgFilter"
                  value={filterOrganization}
                  onChange={(e) => setFilterOrganization(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Alle Organisationen</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {getFilteredTotalUsers()} von {getTotalUsers()} Benutzern angezeigt
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setFilterRole('all')
                  setFilterStatus('all')
                  setFilterOrganization('all')
                }}
              >
                Filter zurücksetzen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Organizations List */}
        <div className="space-y-4">
          {filteredOrganizations.map((org) => (
            <Card key={org.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => toggleOrgExpansion(org.id)}
                  >
                    {expandedOrgs.has(org.id) ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{org.name}</CardTitle>
                      <CardDescription>
                        {org.users.length} Benutzer • Erstellt: {new Date(org.created_at).toLocaleDateString('de-DE')}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {org.users.length} Benutzer
                  </Badge>
                </div>
              </CardHeader>

              {expandedOrgs.has(org.id) && (
                <CardContent>
                  <div className="space-y-3">
                    {org.users.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        Keine Benutzer in dieser Organisation
                      </p>
                    ) : (
                      org.users.map((user) => (
                        <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-gray-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{user.name || user.email}</span>
                                  <Badge className={getRoleColor(user.role)}>
                                    {user.role === 'super_admin' && <Crown className="h-3 w-3 mr-1" />}
                                    {user.role === 'org_admin' && <Shield className="h-3 w-3 mr-1" />}
                                    {user.role || 'Keine Rolle'}
                                  </Badge>
                                  <Badge className={getStatusColor(user.status)}>
                                    {user.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {user.email}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Erstellt: {new Date(user.created_at).toLocaleDateString('de-DE')}
                                  </span>
                                  {user.last_sign_in_at && (
                                    <span className="flex items-center gap-1">
                                      <Eye className="h-3 w-3" />
                                      Letzter Login: {new Date(user.last_sign_in_at).toLocaleDateString('de-DE')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleRemoveUser(user.id, org.id)}
                              >
                                <UserMinus className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}

          {/* Unassigned Users */}
          {(filterOrganization === 'all' && filteredUnassignedUsers.length > 0) && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setShowUnassigned(!showUnassigned)}
                  >
                    {showUnassigned ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Nicht zugeordnete Benutzer</CardTitle>
                      <CardDescription>
                        {filteredUnassignedUsers.length} Benutzer ohne Organisation
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="destructive">
                    {filteredUnassignedUsers.length} Benutzer
                  </Badge>
                </div>
              </CardHeader>

              {showUnassigned && (
                <CardContent>
                  <div className="space-y-3">
                    {filteredUnassignedUsers.map((user) => (
                      <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50 border-yellow-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{user.name || user.email}</span>
                                <Badge variant="outline">Keine Organisation</Badge>
                                <Badge className={getStatusColor(user.status)}>
                                  {user.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {user.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Erstellt: {new Date(user.created_at).toLocaleDateString('de-DE')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Zuordnen
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}
        </div>

        {/* No Results */}
        {getFilteredTotalUsers() === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Keine Benutzer gefunden
              </h3>
              <p className="text-gray-600 mb-4">
                Keine Benutzer entsprechen den aktuellen Filterkriterien.
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setFilterRole('all')
                  setFilterStatus('all')
                  setFilterOrganization('all')
                }}
              >
                Filter zurücksetzen
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* User Edit Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Benutzer bearbeiten</h2>
              <Button 
                variant="ghost" 
                onClick={() => setShowUserModal(false)}
                className="p-1"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="userName">Name</Label>
                <Input
                  id="userName"
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Vollständiger Name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="userRole">Rolle</Label>
                <select
                  id="userRole"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                >
                  <option value="user">Benutzer</option>
                  <option value="org_admin">Organisations-Admin</option>
                  <option value="viewer">Betrachter</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="userOrg">Organisation</Label>
                <select
                  id="userOrg"
                  value={editingUser.organizationId}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, organizationId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                >
                  <option value="">Keine Organisation</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Benutzer: {selectedUser.email}
                </p>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowUserModal(false)}
                  className="flex-1"
                >
                  Abbrechen
                </Button>
                <Button 
                  onClick={handleSaveUser}
                  disabled={savingUser}
                  className="flex-1"
                >
                  {savingUser ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Speichern...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Speichern
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
