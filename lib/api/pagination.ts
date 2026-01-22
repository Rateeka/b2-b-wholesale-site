export interface PaginationParams {
  page?: number
  perPage?: number
}

export interface PaginationMeta {
  total: number
  page: number
  perPage: number
  totalPages: number
}

export function parsePagination(searchParams: URLSearchParams): Required<PaginationParams> {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('perPage') || '20', 10)))
  
  return { page, perPage }
}

export function calculatePagination(total: number, page: number, perPage: number): PaginationMeta {
  const totalPages = Math.ceil(total / perPage)
  
  return {
    total,
    page,
    perPage,
    totalPages
  }
}

export function getPaginationRange(page: number, perPage: number) {
  const from = (page - 1) * perPage
  const to = from + perPage - 1
  
  return { from, to }
}
