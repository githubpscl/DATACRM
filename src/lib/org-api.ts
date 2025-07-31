import { getCurrentUserOrganization } from '@/lib/supabase'

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: unknown
  headers?: Record<string, string>
  skipOrgValidation?: boolean
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  success: boolean
}

/**
 * Organization-aware API client
 * Automatically includes organization context for all requests
 */
class OrgApiClient {
  private baseUrl: string
  private organizationId: string | null = null

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
  }

  /**
   * Initialize the client with current user's organization
   */
  async init(): Promise<void> {
    if (!this.organizationId) {
      const { data: org } = await getCurrentUserOrganization()
      this.organizationId = org?.id || null
    }
  }

  /**
   * Make an organization-aware API request
   */
  async request<T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    try {
      // Ensure organization context is loaded
      if (!options.skipOrgValidation) {
        await this.init()
        
        if (!this.organizationId) {
          return {
            success: false,
            error: 'No organization context available'
          }
        }
      }

      const url = `${this.baseUrl}${endpoint}`
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers
      }

      // Add organization context to headers
      if (this.organizationId && !options.skipOrgValidation) {
        headers['X-Organization-ID'] = this.organizationId
      }

      const fetchOptions: RequestInit = {
        method: options.method || 'GET',
        headers,
      }

      // Add body for non-GET requests
      if (options.body && options.method !== 'GET') {
        if (options.body instanceof FormData) {
          // Remove content-type for FormData, browser will set it with boundary
          delete headers['Content-Type']
          fetchOptions.body = options.body
        } else {
          fetchOptions.body = JSON.stringify(options.body)
        }
      }

      const response = await fetch(url, fetchOptions)
      
      if (!response.ok) {
        const errorText = await response.text()
        return {
          success: false,
          error: `API Error ${response.status}: ${errorText}`
        }
      }

      const data = await response.json()
      
      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Convenience methods for common HTTP verbs
   */
  async get<T = unknown>(endpoint: string, options?: Omit<ApiOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T = unknown>(endpoint: string, body?: unknown, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body })
  }

  async put<T = unknown>(endpoint: string, body?: unknown, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body })
  }

  async patch<T = unknown>(endpoint: string, body?: unknown, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body })
  }

  async delete<T = unknown>(endpoint: string, options?: Omit<ApiOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  /**
   * File upload with organization context
   */
  async uploadFile<T = unknown>(endpoint: string, file: File, additionalData?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)
    
    // Add additional data to form
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'string' ? value : JSON.stringify(value))
      })
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData
    })
  }

  /**
   * Reset organization context (useful for testing or admin functions)
   */
  resetOrganization(): void {
    this.organizationId = null
  }

  /**
   * Get current organization ID
   */
  getCurrentOrganizationId(): string | null {
    return this.organizationId
  }
}

// Export singleton instance
export const orgApi = new OrgApiClient()

// Export class for testing or multiple instances
export { OrgApiClient }

// Convenience functions for direct usage
export const apiGet = <T = unknown>(endpoint: string, options?: Omit<ApiOptions, 'method'>) => 
  orgApi.get<T>(endpoint, options)

export const apiPost = <T = unknown>(endpoint: string, body?: unknown, options?: Omit<ApiOptions, 'method' | 'body'>) => 
  orgApi.post<T>(endpoint, body, options)

export const apiPut = <T = unknown>(endpoint: string, body?: unknown, options?: Omit<ApiOptions, 'method' | 'body'>) => 
  orgApi.put<T>(endpoint, body, options)

export const apiPatch = <T = unknown>(endpoint: string, body?: unknown, options?: Omit<ApiOptions, 'method' | 'body'>) => 
  orgApi.patch<T>(endpoint, body, options)

export const apiDelete = <T = unknown>(endpoint: string, options?: Omit<ApiOptions, 'method'>) => 
  orgApi.delete<T>(endpoint, options)

export const apiUploadFile = <T = unknown>(endpoint: string, file: File, additionalData?: Record<string, unknown>) => 
  orgApi.uploadFile<T>(endpoint, file, additionalData)
