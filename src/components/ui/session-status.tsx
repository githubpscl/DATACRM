'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react'

const SESSION_TIMEOUT = 10 * 60 * 1000 // 10 minutes
const WARNING_TIME = 2 * 60 * 1000 // Show warning 2 minutes before timeout

export default function SessionStatus() {
  const { user } = useAuth()
  const [timeLeft, setTimeLeft] = useState<number>(SESSION_TIMEOUT)
  const [showWarning, setShowWarning] = useState(false)
  const [lastActivity, setLastActivity] = useState<number>(Date.now())

  useEffect(() => {
    if (!user) return

    const updateLastActivity = () => {
      setLastActivity(Date.now())
      setShowWarning(false)
    }

    // Activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.addEventListener(event, updateLastActivity, { passive: true })
    })

    // Update timer every second
    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = now - lastActivity
      const remaining = SESSION_TIMEOUT - elapsed

      setTimeLeft(remaining)
      setShowWarning(remaining <= WARNING_TIME && remaining > 0)
    }, 1000)

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateLastActivity)
      })
      clearInterval(interval)
    }
  }, [user, lastActivity])

  if (!user) return null

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getStatusInfo = () => {
    if (timeLeft <= 0) {
      return {
        color: 'destructive' as const,
        icon: AlertTriangle,
        text: 'Session abgelaufen',
        time: '0:00'
      }
    }
    
    if (showWarning) {
      return {
        color: 'secondary' as const,
        icon: Clock,
        text: 'Session läuft ab',
        time: formatTime(timeLeft)
      }
    }
    
    return {
      color: 'default' as const,
      icon: CheckCircle,
      text: 'Session aktiv',
      time: formatTime(timeLeft)
    }
  }

  const status = getStatusInfo()
  const StatusIcon = status.icon

  // Only show when warning or for debugging
  if (!showWarning && timeLeft > WARNING_TIME) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-64 border-l-4 border-l-blue-500 shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <StatusIcon className={`h-4 w-4 ${
                status.color === 'destructive' ? 'text-red-600' :
                status.color === 'secondary' ? 'text-yellow-600' :
                'text-green-600'
              }`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{status.text}</span>
                <Badge variant={status.color} className="text-xs">
                  {status.time}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {showWarning 
                  ? 'Interagieren Sie mit der Seite, um die Session zu verlängern'
                  : 'Automatische Abmeldung bei Inaktivität'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
