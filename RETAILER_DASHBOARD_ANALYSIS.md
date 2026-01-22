# Retailer Dashboard Integration Analysis

## Executive Summary
The retailer dashboard currently uses **mock data** from `/lib/mock-data.ts`. We have implemented comprehensive APIs that can provide **real-time data** from the database. This report analyzes the current state, identifies integration opportunities, and outlines missing features.

---

## Current State Analysis

### 1. Retailer Dashboard (`/app/retailer/dashboard/page.tsx`)

#### Current Mock Data Usage:
- ❌ **Orders**: Using mock `orders` array
- ❌ **Invoices**: Using mock `invoices` array  
- ❌ **Products**: Using mock `products` array for stock alerts
- ❌ **Stats**: Calculated from mock data (totalSpent, activeOrders, lowStockAlerts)

#### Available API Replacement:
✅ **GET /api/dashboard/retailer** - Returns:
```typescript
{
  store: {
    id, name, tier, status,
    credit_limit, credit_used, credit_available
  },
  stats: {
    total_orders, active_orders, total_spent,
    low_stock_alerts, unpaid_invoices, unpaid_amount
  },
  recent_orders: [...],      // Last 5 orders
  unpaid_invoices: [...],    // Up to 5 unpaid
  low_stock_products: [...]  // Up to 10 products
}
```

**Integration Priority**: 🔴 **HIGH** - Core dashboard functionality

---

### 2. Product Catalog (`/app/retailer/catalog/page.tsx`)

#### Current Mock Data Usage:
- ❌ **Products**: Using mock `products` array
- ❌ **Categories**: Extracted from mock products
- ❌ **Pricing**: Mock tier-based pricing
- ❌ **Stock Status**: Mock status values
- ⚠️ **Cart**: Client-side only (not persisted)

#### Available API Replacement:
✅ **GET /api/products** - Returns:
```typescript
{
  data: [
    {
      id, sku, name, description,
      base_price, gold_price, silver_price,
      effective_price,  // Based on user's tier
      stock_quantity, stock_status,
      is_featured, is_active,
      category_id, image_url
    }
  ],
  meta: { pagination }
}
```

Query params: `?category_id={id}&stock_status={status}&search={query}&page=1&limit=20`

✅ **GET /api/categories** - Returns hierarchical category tree

**Integration Priority**: 🔴 **HIGH** - Main product browsing

---

### 3. Orders Page (`/app/retailer/orders/page.tsx`)

#### Current Mock Data Usage:
- ❌ **Orders**: Using mock `orders` array with items
- ❌ **Order Details**: Mock item data
- ❌ **Status**: Mock status values

#### Available API Replacement:
✅ **GET /api/orders** - Returns:
```typescript
{
  data: {
    orders: [
      {
        id, order_number, status,
        order_date, total_amount, subtotal,
        stores: { id, name, tier }
      }
    ],
    pagination: {...}
  }
}
```

Query params: `?status={status}&start_date={date}&end_date={date}&page=1&limit=20`

✅ **GET /api/orders/:id** - Returns:
```typescript
{
  id, order_number, status, order_date,
  subtotal, tax_amount, total_amount,
  notes, tracking_number,
  stores: {...},
  items: [
    {
      id, product_id, product_name, product_sku,
      quantity, unit_price, subtotal,
      products: { id, name, sku, image_url }
    }
  ]
}
```

**Integration Priority**: 🔴 **HIGH** - Order tracking and history

---

### 4. Settings Page (`/app/retailer/settings/page.tsx`)

#### Current Mock Data Usage:
- ❌ **Store Info**: Hardcoded form values
- ❌ **Save Action**: No actual API call

#### Available API Replacement:
✅ **GET /api/stores/:id** - Get current store info
✅ **PUT /api/stores/:id** - Update store info

Retailers can update: `name, phone, address, city, province, postal_code, website`

**Integration Priority**: 🟡 **MEDIUM** - User profile management

---

### 5. Checkout Page (`/app/retailer/checkout/page.tsx`)

#### Current Status:
- ⚠️ **Not yet created** - Referenced but doesn't exist

#### Available API:
✅ **POST /api/orders** - Create order
```typescript
{
  items: [
    { product_id: "uuid", quantity: 10 }
  ],
  shipping_cost: 25.00,
  notes: "Optional"
}
```

Validates:
- ✅ Stock availability
- ✅ Credit limit
- ✅ Product active status
- ✅ Tier-based pricing
- ✅ Tax calculation (13% HST)

**Integration Priority**: 🔴 **HIGH** - Critical for placing orders

---

## Missing Features & Enhancements

### 1. Authentication & User Context
**Status**: ⚠️ **MISSING**
- Need to get authenticated user's store info
- Need to fetch user's tier for pricing
- Need to pass auth credentials with API calls

**Required**:
```typescript
// Get current user and store
const { data: { user } } = await supabase.auth.getUser()
const { data: store } = await supabase
  .from('stores')
  .select('id, tier, name')
  .eq('user_id', user.id)
  .single()
```

---

### 2. Credit Management Display
**Status**: ⚠️ **PARTIAL**
- Dashboard API returns credit info
- UI doesn't display credit limit/usage
- No visual indicator of credit health

**Recommended UI Elements**:
- Credit limit card on dashboard
- Progress bar showing credit usage
- Warning when approaching limit
- Link to view invoices

---

### 3. Invoice Management
**Status**: ⚠️ **MISSING PAGE**
- API exists: `GET /api/invoices`
- No UI page for viewing invoices
- Dashboard shows count but no details

**Required Page**: `/app/retailer/invoices/page.tsx`

---

### 4. Shopping Cart Persistence
**Status**: ⚠️ **CLIENT-SIDE ONLY**
- Cart stored in React state (lost on refresh)
- No localStorage persistence
- No cart API endpoint

**Recommended Enhancement**:
- Add localStorage for cart persistence
- Or create cart table + API (future enhancement)

---

### 5. Order Creation Flow
**Status**: ⚠️ **INCOMPLETE**
- Catalog allows adding to cart
- No checkout page exists
- No order placement flow

**Required**:
- Create checkout page
- Integrate with POST /api/orders
- Handle validation errors
- Show order confirmation

---

### 6. Real-time Stock Updates
**Status**: ⚠️ **MISSING**
- Stock status shown but not updated
- No refresh mechanism
- Could show stale data

**Recommended**:
- Periodic polling (every 30s)
- Or WebSocket for real-time updates
- Optimistic UI updates

---

### 7. Search & Filtering
**Status**: ⚠️ **BASIC**
- Category filter works (client-side)
- No search functionality
- No price range filters
- No stock status filters

**API Supports**:
- `?search={query}` - Full-text search
- `?stock_status={status}` - Filter by stock
- `?category_id={id}` - Filter by category
- `?sort={option}` - Sort options

---

### 8. Error Handling
**Status**: ⚠️ **MISSING**
- No API error handling
- No loading states
- No retry mechanisms
- No offline detection

**Required**:
- Try-catch blocks for API calls
- Loading spinners
- Error toast notifications
- Graceful degradation

---

### 9. Pagination
**Status**: ⚠️ **MISSING**
- Orders page shows all orders
- Catalog shows all products
- No "Load More" or page navigation

**API Supports**:
- `?page={number}&limit={count}`
- Returns pagination metadata
- Frontend needs pagination UI

---

### 10. Order Status Actions
**Status**: ⚠️ **MISSING**
- Can view orders but not cancel
- API supports canceling pending orders
- No UI buttons for actions

**Available**:
- `PATCH /api/orders/:id` - Cancel order (pending only)

---

## API Compatibility Matrix

| Page | Current Data | Available API | Status | Priority |
|------|-------------|---------------|--------|----------|
| Dashboard | Mock orders, invoices, products | GET /api/dashboard/retailer | ✅ Ready | 🔴 HIGH |
| Catalog | Mock products, categories | GET /api/products, /api/categories | ✅ Ready | 🔴 HIGH |
| Orders | Mock orders with items | GET /api/orders, /api/orders/:id | ✅ Ready | 🔴 HIGH |
| Settings | Hardcoded store info | GET/PUT /api/stores/:id | ✅ Ready | 🟡 MEDIUM |
| Checkout | N/A - Page missing | POST /api/orders | ✅ Ready | 🔴 HIGH |
| Invoices | N/A - Page missing | GET /api/invoices | ✅ Ready | 🟡 MEDIUM |

---

## Data Flow Architecture

### Current (Mock Data):
```
Component → Mock Data Import → Render
```

### Proposed (Real API):
```
Component → Supabase Client → API Route → Database → Response → Render
```

### Recommended Pattern:
```typescript
// 1. Create API client helper
// /lib/api-client.ts
export async function fetchDashboardData() {
  const res = await fetch('/api/dashboard/retailer', {
    credentials: 'include'
  })
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

// 2. Use in component with error handling
const { data, error, isLoading } = useSWR(
  '/api/dashboard/retailer',
  fetchDashboardData
)
```

---

## Breaking Changes & Migration Notes

### 1. Data Structure Changes

#### Orders:
- Mock: `order.id` (string like "ORD-001")
- Real: `order.id` (UUID), `order.order_number` (string)

#### Order Status:
- Mock: `"out_for_delivery"`
- Real: `"shipped"` (use this instead)

#### Product Pricing:
- Mock: `product.pricing.gold`
- Real: `product.gold_price` or `product.effective_price`

#### Date Formats:
- Mock: `"2024-01-15"` (string)
- Real: `"2024-01-15T10:30:00Z"` (ISO 8601)

### 2. Authentication Required
All API calls need authenticated session:
```typescript
fetch('/api/endpoint', {
  credentials: 'include'  // REQUIRED
})
```

### 3. Error Response Format
```typescript
{
  success: false,
  error: {
    message: "Error description",
    code: "ERROR_CODE",
    details: [...]
  }
}
```

---

## Performance Considerations

### 1. Data Fetching Strategy
- **Dashboard**: Fetch on mount, cache for 60s
- **Products**: Paginate (20 per page), cache aggressively
- **Orders**: Paginate (10 per page), shorter cache (30s)

### 2. Caching with SWR
```typescript
import useSWR from 'swr'

const { data, error } = useSWR(
  '/api/dashboard/retailer',
  fetcher,
  { refreshInterval: 60000 } // 60 seconds
)
```

### 3. Optimistic Updates
For cart actions, update UI immediately:
```typescript
// Update UI first
setCart(newCart)

// Then sync with backend
await saveCart(newCart)
```

---

## Security Considerations

### 1. RLS Enforcement
✅ APIs already enforce row-level security
- Retailers can only see their own data
- No need for client-side filtering

### 2. CSRF Protection
✅ Using Supabase session cookies
- Credentials included in requests
- Auth handled by middleware

### 3. Input Validation
✅ Server-side validation in place
- Product quantities validated
- Stock availability checked
- Credit limits enforced

---

## Summary

### What's Ready:
✅ 7 API endpoints ready for retailer features
✅ Authentication & authorization in place
✅ RLS protecting data access
✅ Tier-based pricing implemented
✅ Order creation with full validation

### What's Needed:
❌ Replace mock data with API calls
❌ Add error handling & loading states
❌ Create checkout page
❌ Create invoices page
❌ Implement pagination UI
❌ Add cart persistence
❌ Add user context management

### Estimated Effort:
- **Dashboard Integration**: 2-3 hours
- **Catalog Integration**: 3-4 hours
- **Orders Integration**: 2-3 hours
- **Checkout Page**: 4-5 hours
- **Settings Integration**: 1-2 hours
- **Invoices Page**: 2-3 hours
- **Error Handling & Polish**: 2-3 hours

**Total**: ~16-23 hours for complete integration

---

## Next Steps

See RETAILER_INTEGRATION_TODOS.md for detailed implementation tasks.
