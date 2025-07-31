'use client'

import { useState, useEffect, useCallback } from 'react'
import { getCurrentUserOrganization, type Organization } from '@/lib/supabase'
import { orgApi } from '@/lib/org-api'

export interface UseOrganizationReturn {
  organization: Organization | null
  loading: boolean
  error: string | null
  refreshOrganization: () => Promise<void>
}

/**
 * Hook for managing organization context in components
 */
export function useOrganization(): UseOrganizationReturn {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshOrganization = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: orgData, error: orgError } = await getCurrentUserOrganization()
      
      if (orgError) {
        setError(typeof orgError === 'string' ? orgError : 'Failed to load organization')
        return
      }
      
      setOrganization(orgData)
      
      // Initialize API client with organization context
      if (orgData) {
        await orgApi.init()
      }
    } catch (err) {
      console.error('Error loading organization:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshOrganization()
  }, [])

  return {
    organization,
    loading,
    error,
    refreshOrganization
  }
}

/**
 * Hook for organization-aware data fetching
 */
export function useOrganizationData<T>(
  endpoint: string,
  options?: {
    enabled?: boolean
    refetchInterval?: number
    onSuccess?: (data: T) => void
    onError?: (error: string) => void
  }
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { organization } = useOrganization()

  const fetchData = useCallback(async () => {
    if (!organization || options?.enabled === false) return

    try {
      setLoading(true)
      setError(null)

      const response = await orgApi.get<T>(endpoint)
      
      if (response.success && response.data) {
        setData(response.data)
        options?.onSuccess?.(response.data)
      } else {
        const errorMsg = response.error || 'Failed to fetch data'
        setError(errorMsg)
        options?.onError?.(errorMsg)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMsg)
      options?.onError?.(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [organization, endpoint, options])

  useEffect(() => {
    fetchData()
    
    // Set up refetch interval if specified
    if (options?.refetchInterval && options.refetchInterval > 0) {
      const interval = setInterval(fetchData, options.refetchInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, options?.refetchInterval])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}

/**
 * Hook for organization-aware file uploads
 */
export function useOrganizationUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { organization } = useOrganization()

  const uploadFile = async <T = unknown>(
    endpoint: string, 
    file: File, 
    additionalData?: Record<string, unknown>
  ): Promise<{ data?: T; error?: string; success: boolean }> => {
    if (!organization) {
      return { success: false, error: 'No organization context available' }
    }

    try {
      setUploading(true)
      setError(null)

      const response = await orgApi.uploadFile<T>(endpoint, file, additionalData)
      
      if (!response.success) {
        setError(response.error || 'Upload failed')
      }

      return response
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setUploading(false)
    }
  }

  return {
    uploadFile,
    uploading,
    error
  }
}

/**
 * Hook for organization-aware mutations (create, update, delete)
 */
export function useOrganizationMutation<TData = unknown, TResponse = unknown>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { organization } = useOrganization()

  const mutate = async (
    endpoint: string,
    data: TData,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST'
  ): Promise<{ data?: TResponse; error?: string; success: boolean }> => {
    if (!organization) {
      return { success: false, error: 'No organization context available' }
    }

    try {
      setLoading(true)
      setError(null)

      let response
      switch (method) {
        case 'POST':
          response = await orgApi.post<TResponse>(endpoint, data)
          break
        case 'PUT':
          response = await orgApi.put<TResponse>(endpoint, data)
          break
        case 'PATCH':
          response = await orgApi.patch<TResponse>(endpoint, data)
          break
        case 'DELETE':
          response = await orgApi.delete<TResponse>(endpoint)
          break
      }

      if (!response.success) {
        setError(response.error || 'Mutation failed')
      }

      return response
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Mutation failed'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  return {
    mutate,
    loading,
    error
  }
}
