'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Mail,
  MessageSquare,
  Calendar
} from 'lucide-react'
import { 
  getOrganizationJoinRequests,
  approveJoinRequest,
  rejectJoinRequest
} from '@/lib/supabase'

interface JoinRequest {
  id: string
  user_id: string
  requested_by_email: string
  message?: string
  status: 'pending' | 'approved' | 'rejected'
  requested_at: string
  reviewed_at?: string
  user?: {
    email: string
  }
}

interface JoinRequestsManagerProps {
  organizationId: string
  organizationName: string
}

export default function JoinRequestsManager({ 
  organizationId, 
  organizationName 
}: JoinRequestsManagerProps) {
  const [requests, setRequests] = useState<JoinRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const loadJoinRequests = useCallback(async () => {
    try {
      const result = await getOrganizationJoinRequests(organizationId)
      if (result.data) {
        setRequests(result.data)
      }
    } catch (error) {
      console.error('Error loading join requests:', error)
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    loadJoinRequests()
  }, [loadJoinRequests])

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId)
    try {
      const result = await approveJoinRequest(requestId)
      if (result.data) {
        alert('Beitrittsanfrage genehmigt!')
        await loadJoinRequests()
      } else {
        alert('Fehler beim Genehmigen der Anfrage: ' + (result.error?.message || 'Unbekannter Fehler'))
      }
    } catch (error) {
      console.error('Error approving request:', error)
      alert('Fehler beim Genehmigen der Anfrage')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId)
    try {
      const result = await rejectJoinRequest(requestId)
      if (result.data) {
        alert('Beitrittsanfrage abgelehnt.')
        await loadJoinRequests()
      } else {
        alert('Fehler beim Ablehnen der Anfrage: ' + (result.error?.message || 'Unbekannter Fehler'))
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
      alert('Fehler beim Ablehnen der Anfrage')
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Lade Beitrittsanfragen...</p>
        </CardContent>
      </Card>
    )
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const processedRequests = requests.filter(r => r.status !== 'pending')

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <span>Ausstehende Beitrittsanfragen</span>
            {pendingRequests.length > 0 && (
              <Badge variant="secondary">{pendingRequests.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Neue Anfragen für {organizationName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Keine ausstehenden Beitrittsanfragen</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar>
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{request.requested_by_email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(request.requested_at).toLocaleDateString('de-DE', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {request.message && (
                        <div className="mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <MessageSquare className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Nachricht:</span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                            &quot;{request.message}&quot;
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 pt-3 border-t">
                    <Button
                      onClick={() => handleApprove(request.id)}
                      disabled={processingId === request.id}
                      size="sm"
                      className="flex-1"
                    >
                      {processingId === request.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Genehmigen
                    </Button>
                    <Button
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Ablehnen
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bearbeitete Anfragen</CardTitle>
            <CardDescription>
              Kürzlich genehmigte oder abgelehnte Anfragen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {processedRequests.slice(0, 10).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{request.requested_by_email}</div>
                      <div className="text-sm text-gray-500">
                        {request.reviewed_at && new Date(request.reviewed_at).toLocaleDateString('de-DE')}
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={request.status === 'approved' ? 'default' : 'destructive'}
                  >
                    {request.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {request.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                    {request.status === 'approved' ? 'Genehmigt' : 'Abgelehnt'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
