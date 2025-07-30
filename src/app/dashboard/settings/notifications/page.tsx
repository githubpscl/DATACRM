'use client'

import React, { useState } from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Bell,
  Mail,
  Smartphone,
  Monitor,
  Volume2,
  Save,
  CheckCircle
} from 'lucide-react'

interface NotificationSetting {
  id: string
  title: string
  description: string
  email: boolean
  push: boolean
  desktop: boolean
  sound: boolean
}

export default function NotificationsPage() {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle')
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: 'campaigns',
      title: 'Kampagnen-Updates',
      description: 'Benachrichtigungen über den Status Ihrer E-Mail-Kampagnen',
      email: true,
      push: true,
      desktop: false,
      sound: false
    },
    {
      id: 'customers',
      title: 'Neue Kunden',
      description: 'Informiert werden, wenn neue Kunden hinzugefügt werden',
      email: true,
      push: false,
      desktop: true,
      sound: true
    },
    {
      id: 'journeys',
      title: 'Customer Journey Events',
      description: 'Updates zu automatisierten Customer Journey Workflows',
      email: false,
      push: true,
      desktop: true,
      sound: false
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      description: 'Wöchentliche und monatliche Berichte über Ihre Performance',
      email: true,
      push: false,
      desktop: false,
      sound: false
    },
    {
      id: 'system',
      title: 'System-Updates',
      description: 'Wichtige Updates über neue Features und Wartungsarbeiten',
      email: true,
      push: true,
      desktop: true,
      sound: false
    },
    {
      id: 'security',
      title: 'Sicherheitswarnungen',
      description: 'Wichtige Sicherheitsereignisse und verdächtige Aktivitäten',
      email: true,
      push: true,
      desktop: true,
      sound: true
    }
  ])

  const updateNotification = (id: string, field: keyof NotificationSetting, value: boolean) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, [field]: value } : notif
      )
    )
  }

  const handleSave = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaveStatus('success')
    setTimeout(() => setSaveStatus('idle'), 3000)
  }

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'push': return <Smartphone className="h-4 w-4" />
      case 'desktop': return <Monitor className="h-4 w-4" />
      case 'sound': return <Volume2 className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Benachrichtigungen</h1>
            <p className="text-gray-600 mt-1">Verwalten Sie, wie und wann Sie Benachrichtigungen erhalten möchten</p>
          </div>
          {saveStatus === 'success' && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Einstellungen gespeichert</span>
            </div>
          )}
        </div>

        {/* Quick Settings */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardContent className="p-6">
              <Mail className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">E-Mail</h3>
              <p className="text-sm text-gray-600 mb-4">Benachrichtigungen per E-Mail</p>
              <div className="flex items-center justify-center">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={notifications.some(n => n.email)}
                    onChange={(e) => {
                      const newValue = e.target.checked
                      setNotifications(prev => 
                        prev.map(notif => ({ ...notif, email: newValue }))
                      )
                    }}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Alle aktivieren</span>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Smartphone className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Push</h3>
              <p className="text-sm text-gray-600 mb-4">Mobile Push-Nachrichten</p>
              <div className="flex items-center justify-center">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={notifications.some(n => n.push)}
                    onChange={(e) => {
                      const newValue = e.target.checked
                      setNotifications(prev => 
                        prev.map(notif => ({ ...notif, push: newValue }))
                      )
                    }}
                    className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Alle aktivieren</span>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Monitor className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Desktop</h3>
              <p className="text-sm text-gray-600 mb-4">Browser-Benachrichtigungen</p>
              <div className="flex items-center justify-center">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={notifications.some(n => n.desktop)}
                    onChange={(e) => {
                      const newValue = e.target.checked
                      setNotifications(prev => 
                        prev.map(notif => ({ ...notif, desktop: newValue }))
                      )
                    }}
                    className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Alle aktivieren</span>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Volume2 className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Sound</h3>
              <p className="text-sm text-gray-600 mb-4">Audio-Benachrichtigungen</p>
              <div className="flex items-center justify-center">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={notifications.some(n => n.sound)}
                    onChange={(e) => {
                      const newValue = e.target.checked
                      setNotifications(prev => 
                        prev.map(notif => ({ ...notif, sound: newValue }))
                      )
                    }}
                    className="h-4 w-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Alle aktivieren</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-blue-600" />
              Detaillierte Einstellungen
            </CardTitle>
            <CardDescription>
              Konfigurieren Sie spezifische Benachrichtigungstypen nach Ihren Wünschen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {notifications.map((notification) => (
                <div key={notification.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { key: 'email', label: 'E-Mail', color: 'blue' },
                      { key: 'push', label: 'Push', color: 'green' },
                      { key: 'desktop', label: 'Desktop', color: 'purple' },
                      { key: 'sound', label: 'Sound', color: 'orange' }
                    ].map(({ key, label, color }) => (
                      <div key={key} className="flex items-center space-x-3">
                        <div className={`p-2 bg-${color}-100 rounded-lg`}>
                          {getNotificationTypeIcon(key)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">{label}</span>
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={notification[key as keyof NotificationSetting] as boolean}
                                onChange={(e) => updateNotification(notification.id, key as keyof NotificationSetting, e.target.checked)}
                                className={`h-4 w-4 text-${color}-600 rounded focus:ring-${color}-500`}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Email Frequency */}
        <Card>
          <CardHeader>
            <CardTitle>E-Mail-Häufigkeit</CardTitle>
            <CardDescription>
              Wie oft möchten Sie E-Mail-Zusammenfassungen erhalten?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="immediate"
                  name="frequency"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="immediate" className="text-sm font-medium text-gray-700">
                  Sofort - Erhalten Sie Benachrichtigungen, sobald sie auftreten
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="hourly"
                  name="frequency"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="hourly" className="text-sm font-medium text-gray-700">
                  Stündlich - Zusammenfassung aller Ereignisse der letzten Stunde
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="daily"
                  name="frequency"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="daily" className="text-sm font-medium text-gray-700">
                  Täglich - Tägliche Zusammenfassung um 9:00 Uhr
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="weekly"
                  name="frequency"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="weekly" className="text-sm font-medium text-gray-700">
                  Wöchentlich - Wöchentliche Zusammenfassung jeden Montag
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="px-6">
            <Save className="mr-2 h-4 w-4" />
            Einstellungen speichern
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
