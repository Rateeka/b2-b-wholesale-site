// API Client utilities for making authenticated requests

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    console.log('[API Client] Fetching:', endpoint)
    const response = await fetch(endpoint, {
      ...options,
      credentials: 'include', // Include auth cookies
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    console.log('[API Client] Response status:', response.status)
    const data = await response.json()

    if (!response.ok) {
      console.error('[API Client] Error response:', data)
      throw new ApiError(
        data.error?.message || 'An error occurred',
        data.error?.code || 'UNKNOWN_ERROR',
        response.status,
        data.error?.details
      )
    }

    console.log('[API Client] Success:', endpoint)
    return data.data as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    // Network or other errors
    console.error('[API Client] Network error:', error)
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      'NETWORK_ERROR',
      0
    )
  }
}

// Dashboard API
export async function fetchDashboardData() {
  return apiClient<{
    store: {
      id: string
      name: string
      tier: 'gold' | 'silver' | 'standard'
      status: string
      credit_limit: number
      credit_used: number
      credit_available: number
    }
    stats: {
      total_orders: number
      active_orders: number
      total_spent: number
      low_stock_alerts: number
      unpaid_invoices: number
      unpaid_amount: number
    }
    recent_orders: any[]
    unpaid_invoices: any[]
    low_stock_products: any[]
  }>('/api/dashboard/retailer')
}

// Products API
export async function fetchProducts(params?: {
  page?: number
  limit?: number
  category_id?: string
  stock_status?: string
  search?: string
  sort?: string
}) {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.category_id) searchParams.set('category_id', params.category_id)
  if (params?.stock_status) searchParams.set('stock_status', params.stock_status)
  if (params?.search) searchParams.set('search', params.search)
  if (params?.sort) searchParams.set('sort', params.sort)

  const url = `/api/products${searchParams.toString() ? `?${searchParams}` : ''}`
  
  const response = await fetch(url, { credentials: 'include' })
  const data = await response.json()
  
  if (!response.ok) {
    throw new ApiError(
      data.error?.message || 'Failed to fetch products',
      data.error?.code || 'FETCH_ERROR',
      response.status
    )
  }
  
  return {
    products: data.data,
    pagination: data.meta?.pagination
  }
}

export async function fetchProduct(id: string) {
  return apiClient(`/api/products/${id}`)
}

// Categories API
export async function fetchCategories(flat = false) {
  const url = `/api/categories${flat ? '?flat=true' : ''}`
  return apiClient<any[]>(url)
}

// Orders API
export async function fetchOrders(params?: {
  page?: number
  limit?: number
  status?: string
  start_date?: string
  end_date?: string
}) {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.status) searchParams.set('status', params.status)
  if (params?.start_date) searchParams.set('start_date', params.start_date)
  if (params?.end_date) searchParams.set('end_date', params.end_date)

  const url = `/api/orders${searchParams.toString() ? `?${searchParams}` : ''}`
  
  const response = await fetch(url, { credentials: 'include' })
  const data = await response.json()
  
  if (!response.ok) {
    throw new ApiError(
      data.error?.message || 'Failed to fetch orders',
      data.error?.code || 'FETCH_ERROR',
      response.status
    )
  }
  
  return {
    orders: data.data.orders,
    pagination: data.data.pagination
  }
}

export async function fetchOrder(id: string) {
  return apiClient(`/api/orders/${id}`)
}

export async function createOrder(data: {
  items: Array<{ product_id: string; quantity: number }>
  shipping_cost?: number
  notes?: string
}) {
  return apiClient('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function cancelOrder(id: string) {
  return apiClient(`/api/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'cancelled' }),
  })
}

// Store API
export async function fetchStore(id: string) {
  return apiClient(`/api/stores/${id}`)
}

export async function updateStore(id: string, data: {
  name?: string
  phone?: string
  address?: string
  city?: string
  province?: string
  postal_code?: string
  website?: string
}) {
  return apiClient(`/api/stores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// Invoices API
export async function fetchInvoices(params?: {
  page?: number
  limit?: number
  status?: string
}) {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.status) searchParams.set('status', params.status)

  const url = `/api/invoices${searchParams.toString() ? `?${searchParams}` : ''}`
  
  const response = await fetch(url, { credentials: 'include' })
  const data = await response.json()
  
  if (!response.ok) {
    throw new ApiError(
      data.error?.message || 'Failed to fetch invoices',
      data.error?.code || 'FETCH_ERROR',
      response.status
    )
  }
  
  return {
    invoices: data.data.invoices,
    pagination: data.data.pagination
  }
}

export async function fetchInvoice(id: string) {
  return apiClient(`/api/invoices/${id}`)
}
