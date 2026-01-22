import { NextResponse } from 'next/server'

export type ApiMeta = {
  total?: number
  page?: number
  perPage?: number
  totalPages?: number
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  [key: string]: any
}

export type ApiResponse<T = any> = {
  success: true
  data: T
  meta?: ApiMeta
} | {
  success: false
  error: {
    message: string
    code: string
    details?: any
  }
}

export type ValidationError = {
  field: string
  message: string
}

export function apiSuccess<T>(data: T, meta?: ApiMeta) {
  return NextResponse.json({
    success: true,
    data,
    ...(meta && { meta })
  })
}

export function apiError(message: string, code: string = 'INTERNAL_ERROR', status: number = 500, details?: any) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        ...(details && { details })
      }
    },
    { status }
  )
}

export function apiUnauthorized(message: string = 'Unauthorized') {
  return apiError(message, 'UNAUTHORIZED', 401)
}

export function apiForbidden(message: string = 'Forbidden') {
  return apiError(message, 'FORBIDDEN', 403)
}

export function apiNotFound(message: string = 'Resource not found') {
  return apiError(message, 'NOT_FOUND', 404)
}

export function apiBadRequest(message: string = 'Bad request', details?: any) {
  return apiError(message, 'BAD_REQUEST', 400, details)
}

export function apiValidationError(errors: ValidationError[]) {
  return apiError('Validation failed', 'VALIDATION_ERROR', 422, errors)
}
