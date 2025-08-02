'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Minimize2, Maximize2, X, Terminal } from 'lucide-react'

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'error' | 'warn' | 'debug'
  tag: string
  message: string
  data?: unknown
}

export default function DebugConsole() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isVisible, setIsVisible] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const originalConsole = useRef<{
    log: typeof console.log
    error: typeof console.error
    warn: typeof console.warn
  }>()

  useEffect(() => {
    // Store original console methods
    originalConsole.current = {
      log: console.log,
      error: console.error,
      warn: console.warn
    }

    const addLog = (level: LogEntry['level'], args: unknown[]) => {
      const message = args.join(' ')
      
      // Only capture our tagged logs
      if (message.includes('[AUTH') || message.includes('[SUPABASE') || message.includes('[ORG')) {
        const matches = message.match(/\[(.*?)\]/)
        const tag = matches ? matches[1] : 'SYSTEM'
        
        const logEntry: LogEntry = {
          id: Date.now() + Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          level,
          tag,
          message: message.replace(/^\S+\s+\[.*?\]\s*/, ''),
          data: args.length > 1 ? args.slice(1) : undefined
        }
        
        setLogs(prev => [...prev.slice(-49), logEntry]) // Keep last 50 logs
      }
    }

    // Override console methods
    console.log = (...args) => {
      originalConsole.current!.log(...args)
      addLog('info', args)
    }

    console.error = (...args) => {
      originalConsole.current!.error(...args)
      addLog('error', args)
    }

    console.warn = (...args) => {
      originalConsole.current!.warn(...args)
      addLog('warn', args)
    }

    // Cleanup on unmount
    return () => {
      if (originalConsole.current) {
        console.log = originalConsole.current.log
        console.error = originalConsole.current.error
        console.warn = originalConsole.current.warn
      }
    }
  }, [])

  useEffect(() => {
    // Auto-scroll to bottom when new logs are added
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  if (!isVisible) {
    return (
      <Button
        className="fixed bottom-4 right-4 z-50"
        onClick={() => setIsVisible(true)}
        size="sm"
      >
        <Terminal className="h-4 w-4 mr-2" />
        Debug Console
      </Button>
    )
  }

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'destructive'
      case 'warn': return 'default'
      case 'info': return 'secondary'
      case 'debug': return 'outline'
      default: return 'secondary'
    }
  }

  const getTagColor = (tag: string) => {
    if (tag.includes('AUTH')) return 'bg-blue-100 text-blue-800'
    if (tag.includes('SUPABASE')) return 'bg-green-100 text-green-800'
    if (tag.includes('ORG')) return 'bg-purple-100 text-purple-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <Card className={`fixed bottom-4 right-4 z-50 ${isMinimized ? 'w-80 h-12' : 'w-96 h-96'} shadow-lg border-2`}>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <Terminal className="h-4 w-4 mr-2" />
            Debug Console ({logs.length})
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0"
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLogs([])}
              className="h-6 w-6 p-0"
            >
              Clear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {!isMinimized && (
        <CardContent className="p-3 pt-0">
          <div className="h-80 overflow-y-auto" ref={scrollRef}>
            <div className="space-y-1">
              {logs.map((log) => (
                <div key={log.id} className="text-xs border-l-2 border-gray-200 pl-2 py-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-500 font-mono">{log.timestamp}</span>
                    <Badge variant={getLevelColor(log.level)} className="text-xs py-0">
                      {log.level.toUpperCase()}
                    </Badge>
                    <Badge className={`text-xs py-0 ${getTagColor(log.tag)}`}>
                      {log.tag}
                    </Badge>
                  </div>
                  <div className="text-gray-800 leading-tight">
                    {log.message}
                  </div>
                  {log.data !== undefined && log.data !== null && (
                    <div className="text-gray-600 font-mono text-xs mt-1 bg-gray-50 p-1 rounded">
                      {String(typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2))}
                    </div>
                  )}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  Keine Debug-Logs vorhanden
                </div>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
