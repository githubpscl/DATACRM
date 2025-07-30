'use client'

import React, { useState } from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Users,
  UserPlus,
  Mail,
  MoreHorizontal,
  Crown,
  Shield,
  User,
  Eye,
  Edit,
  Trash2,
  Send
} from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  status: 'active' | 'pending' | 'inactive'
  lastActive: string
  joinedAt: string
}

const roles = [
  { 
    value: 'owner', 
    label: 'Besitzer', 
    description: 'Vollzugriff auf alle Funktionen und Einstellungen',
    icon: Crown,
    color: 'yellow'
  },
  { 
    value: 'admin', 
    label: 'Administrator', 
    description: 'Kann alle Funktionen verwalten, außer Billing und Besitzerwechsel',
    icon: Shield,
    color: 'red'
  },
  { 
    value: 'editor', 
    label: 'Bearbeiter', 
    description: 'Kann Kampagnen, Kunden und Content bearbeiten',
    icon: Edit,
    color: 'blue'
  },
  { 
    value: 'viewer', 
    label: 'Betrachter', 
    description: 'Kann nur Daten einsehen, aber nicht bearbeiten',
    icon: Eye,
    color: 'gray'
  }
]

export default function TeamPage() {
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('editor')
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Max Mustermann',
      email: 'max@example.com',
      role: 'owner',
      status: 'active',
      lastActive: 'Gerade aktiv',
      joinedAt: '15. Jan 2024'
    },
    {
      id: '2',
      name: 'Sarah Schmidt',
      email: 'sarah@example.com',
      role: 'admin',
      status: 'active',
      lastActive: 'Vor 2 Stunden',
      joinedAt: '22. Jan 2024'
    },
    {
      id: '3',
      name: 'Michael Weber',
      email: 'michael@example.com',
      role: 'editor',
      status: 'active',
      lastActive: 'Gestern',
      joinedAt: '3. Feb 2024'
    },
    {
      id: '4',
      name: 'Anna Müller',
      email: 'anna@example.com',
      role: 'viewer',
      status: 'pending',
      lastActive: 'Noch nie',
      joinedAt: '28. Jul 2025'
    }
  ])

  const getRoleInfo = (roleValue: string) => {
    return roles.find(role => role.value === roleValue)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleInvite = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setInviteEmail('')
    setShowInviteForm(false)
    // Here you would typically send the invitation
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team-Verwaltung</h1>
            <p className="text-gray-600 mt-1">Verwalten Sie Teammitglieder und deren Berechtigungen</p>
          </div>
          <Button onClick={() => setShowInviteForm(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Teammitglied einladen
          </Button>
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-600" />
                Teammitglied einladen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inviteEmail">E-Mail-Adresse</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="inviteRole">Rolle</Label>
                  <select
                    id="inviteRole"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  >
                    {roles.filter(role => role.value !== 'owner').map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  {getRoleInfo(inviteRole)?.label} Berechtigungen:
                </h4>
                <p className="text-sm text-gray-600">
                  {getRoleInfo(inviteRole)?.description}
                </p>
              </div>

              <div className="flex space-x-3">
                <Button onClick={handleInvite}>
                  <Send className="mr-2 h-4 w-4" />
                  Einladung senden
                </Button>
                <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                  Abbrechen
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {roles.map((role) => {
            const count = teamMembers.filter(member => member.role === role.value).length
            const Icon = role.icon
            return (
              <Card key={role.value}>
                <CardContent className="p-6 text-center">
                  <div className={`p-3 bg-${role.color}-100 rounded-full w-fit mx-auto mb-3`}>
                    <Icon className={`h-6 w-6 text-${role.color}-600`} />
                  </div>
                  <h3 className="font-semibold text-gray-900">{role.label}</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Team Members List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Teammitglieder ({teamMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member) => {
                const roleInfo = getRoleInfo(member.role)
                const RoleIcon = roleInfo?.icon || User
                
                return (
                  <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full text-sm font-medium">
                        {getInitials(member.name)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getStatusColor(member.status)}>
                            {member.status === 'active' ? 'Aktiv' : 
                             member.status === 'pending' ? 'Ausstehend' : 'Inaktiv'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Beigetreten: {member.joinedAt}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <RoleIcon className={`h-4 w-4 text-${roleInfo?.color}-600`} />
                          <span className="text-sm font-medium text-gray-900">
                            {roleInfo?.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Zuletzt aktiv: {member.lastActive}
                        </p>
                      </div>

                      {member.role !== 'owner' && (
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Role Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Rollen und Berechtigungen</CardTitle>
            <CardDescription>
              Übersicht über die verschiedenen Rollen und ihre Berechtigungen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roles.map((role) => {
                const Icon = role.icon
                return (
                  <div key={role.value} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`p-2 bg-${role.color}-100 rounded-lg`}>
                      <Icon className={`h-5 w-5 text-${role.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{role.label}</h4>
                      <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Team Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Team-Einstellungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Automatische Einladungen</h4>
                <p className="text-sm text-gray-600">Neue Teammitglieder werden automatisch eingeladen</p>
              </div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">E-Mail-Benachrichtigungen</h4>
                <p className="text-sm text-gray-600">Team über neue Mitglieder benachrichtigen</p>
              </div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Zwei-Faktor-Authentifizierung</h4>
                <p className="text-sm text-gray-600">2FA für alle Teammitglieder erforderlich</p>
              </div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
