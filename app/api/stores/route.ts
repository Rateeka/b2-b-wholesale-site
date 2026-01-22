import { NextRequest } from 'next/server'
import { createServerSupabaseClient, getAuthUser, requireAdmin } from '@/lib/api/auth'
import { apiSuccess, apiError, apiBadRequest, apiValidationError } from '@/lib/api/response'
import { parsePagination, calculatePagination } from '@/lib/api/pagination'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    const supabase = await createServerSupabaseClient()
    
    const { searchParams } = new URL(request.url)
    const { page, limit, offset } = parsePagination(searchParams)
    
    // Extract filters
    const status = searchParams.get('status')
    const tier = searchParams.get('tier')
    const storeType = searchParams.get('store_type')
    const search = searchParams.get('search')
    
    // Retailers can only see their own store
    // Admins can see all stores
    let query = supabase
      .from('stores')
      .select('*', { count: 'exact' })
    
    // Apply RLS based on role
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('role, store_id')
        .eq('id', user.id)
        .single()
      
      if (profile?.role === 'retailer' && profile.store_id) {
        query = query.eq('id', profile.store_id)
      }
    }
    
    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    
    if (tier) {
      query = query.eq('tier', tier)
    }
    
    if (storeType) {
      query = query.eq('store_type', storeType)
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }
    
    // Apply pagination and sorting
    const { data: stores, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      throw error
    }
    
    const pagination = calculatePagination(count || 0, page, limit)
    
    return apiSuccess({ stores, pagination })
    
  } catch (error: any) {
    console.error('[STORES API] Error:', error)
    return apiError(error.message || 'Failed to fetch stores', 'FETCH_ERROR', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const supabase = await createServerSupabaseClient()
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'province', 'postal_code']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return apiValidationError([{
        field: missingFields[0],
        message: `${missingFields[0]} is required`
      }])
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return apiValidationError([{
        field: 'email',
        message: 'Invalid email format'
      }])
    }
    
    // Check if email already exists
    const { data: existingStore } = await supabase
      .from('stores')
      .select('id')
      .eq('email', body.email)
      .single()
    
    if (existingStore) {
      return apiValidationError([{
        field: 'email',
        message: 'A store with this email already exists'
      }])
    }
    
    // Validate tier if provided
    const validTiers = ['gold', 'silver', 'standard']
    if (body.tier && !validTiers.includes(body.tier)) {
      return apiValidationError([{
        field: 'tier',
        message: 'Invalid tier. Must be one of: gold, silver, standard'
      }])
    }
    
    // Validate status if provided
    const validStatuses = ['active', 'inactive', 'pending', 'suspended']
    if (body.status && !validStatuses.includes(body.status)) {
      return apiValidationError([{
        field: 'status',
        message: 'Invalid status. Must be one of: active, inactive, pending, suspended'
      }])
    }
    
    // Validate store_type if provided
    const validStoreTypes = ['retail', 'restaurant', 'wholesale', 'online']
    if (body.store_type && !validStoreTypes.includes(body.store_type)) {
      return apiValidationError([{
        field: 'store_type',
        message: 'Invalid store type. Must be one of: retail, restaurant, wholesale, online'
      }])
    }
    
    // Create store
    const { data: store, error } = await supabase
      .from('stores')
      .insert({
        name: body.name,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        province: body.province,
        postal_code: body.postal_code,
        country: body.country || 'Canada',
        store_type: body.store_type || 'retail',
        tier: body.tier || 'standard',
        status: body.status || 'pending',
        tax_number: body.tax_number,
        website: body.website,
        credit_limit: body.credit_limit || 0,
        credit_used: 0,
        payment_terms_days: body.payment_terms_days || 30
      })
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    return apiSuccess({ store }, 201)
    
  } catch (error: any) {
    console.error('[STORES API] Error:', error)
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return apiError(error.message, error.message.includes('Forbidden') ? 'FORBIDDEN' : 'UNAUTHORIZED', 
                     error.message.includes('Forbidden') ? 403 : 401)
    }
    return apiError(error.message || 'Failed to create store', 'CREATE_ERROR', 500)
  }
}
