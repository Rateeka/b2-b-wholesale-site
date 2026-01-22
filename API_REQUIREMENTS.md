# Teetoz B2B Wholesale Platform - API Requirements Analysis

## Database Schema Overview

### Core Tables
1. **users** - User accounts (extends auth.users)
2. **stores** - Retailer/store information
3. **categories** - Product categories (hierarchical)
4. **products** - Product catalog with tier pricing
5. **orders** - Customer orders
6. **order_items** - Order line items
7. **invoices** - Financial invoices
8. **inventory_transactions** - Stock movement audit trail
9. **activity_logs** - System-wide audit trail
10. **store_credit_history** - Credit balance changes

---

## Required API Endpoints by Entity

### 1. **Users API** (`/api/users`)
**Auth Status**: Using Supabase auth.users (already implemented via `lib/auth.ts`)

#### Additional Endpoints Needed:
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile (full_name, phone, avatar_url)
- `GET /api/users/activity` - Get user's activity logs
- **Admin Only:**
  - `GET /api/users` - List all users (pagination, filters)
  - `GET /api/users/:id` - Get specific user
  - `PUT /api/users/:id` - Update user (role, is_active)
  - `DELETE /api/users/:id` - Deactivate user

---

### 2. **Stores API** (`/api/stores`)

#### CRUD Operations:
- `GET /api/stores` - List all stores (admin) or user's store (retailer)
  - Filters: status, tier, city, store_type
  - Pagination
  - Search by name, email
- `GET /api/stores/:id` - Get store details
- `POST /api/stores` - Create new store (registration)
- `PUT /api/stores/:id` - Update store details
- `PATCH /api/stores/:id/status` - Change store status (admin only)
- `DELETE /api/stores/:id` - Delete/deactivate store (admin only)

#### Credit Management:
- `GET /api/stores/:id/credit` - Get credit info
- `POST /api/stores/:id/credit/adjust` - Adjust credit limit (admin)
- `GET /api/stores/:id/credit/history` - Get credit history

#### Analytics:
- `GET /api/stores/:id/stats` - Get store statistics
- `GET /api/stores/:id/orders` - Get store's orders

---

### 3. **Categories API** (`/api/categories`)

#### CRUD Operations:
- `GET /api/categories` - List all categories (hierarchical tree)
  - Optional: flat list with `?flat=true`
- `GET /api/categories/:id` - Get category details
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

#### Special Endpoints:
- `GET /api/categories/:id/products` - Get products in category
- `GET /api/categories/tree` - Get full category tree

---

### 4. **Products API** (`/api/products`)

#### CRUD Operations:
- `GET /api/products` - List products
  - Filters: category_id, stock_status, is_active, featured
  - Search: name, sku, description
  - Pagination
  - Sort: name, price, stock_quantity
- `GET /api/products/:id` - Get product details
- `GET /api/products/sku/:sku` - Get product by SKU
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `PATCH /api/products/:id/stock` - Update stock quantity
- `PATCH /api/products/:id/price` - Update pricing
- `DELETE /api/products/:id` - Delete/deactivate product (admin only)

#### Special Endpoints:
- `GET /api/products/featured` - Get featured products
- `GET /api/products/low-stock` - Get low stock products (admin)
- `GET /api/products/:id/inventory-history` - Get inventory transaction history
- `POST /api/products/:id/inventory/adjust` - Manual inventory adjustment (admin)
- `GET /api/products/:id/pricing` - Get tier-based pricing for current user

---

### 5. **Orders API** (`/api/orders`)

#### CRUD Operations:
- `GET /api/orders` - List orders
  - Retailer: Their orders only
  - Admin: All orders
  - Filters: status, store_id, date range
  - Pagination
- `GET /api/orders/:id` - Get order details with items
- `GET /api/orders/number/:orderNumber` - Get order by order number
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order (before confirmation)
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Cancel order

#### Order Workflow:
- `POST /api/orders/:id/confirm` - Confirm order (admin)
- `POST /api/orders/:id/ship` - Mark as shipped (admin)
- `POST /api/orders/:id/deliver` - Mark as delivered (admin)
- `POST /api/orders/:id/cancel` - Cancel order

#### Analytics:
- `GET /api/orders/stats` - Get order statistics
- `GET /api/orders/:id/invoice` - Get associated invoice

---

### 6. **Order Items API** (`/api/orders/:orderId/items`)

#### CRUD Operations:
- `GET /api/orders/:orderId/items` - List items in order
- `POST /api/orders/:orderId/items` - Add item to order
- `PUT /api/orders/:orderId/items/:itemId` - Update item quantity
- `DELETE /api/orders/:orderId/items/:itemId` - Remove item from order

---

### 7. **Invoices API** (`/api/invoices`)

#### CRUD Operations:
- `GET /api/invoices` - List invoices
  - Retailer: Their invoices only
  - Admin: All invoices
  - Filters: status, store_id, date range, overdue
  - Pagination
- `GET /api/invoices/:id` - Get invoice details
- `GET /api/invoices/number/:invoiceNumber` - Get by invoice number
- `POST /api/invoices` - Create invoice (admin)
- `PUT /api/invoices/:id` - Update invoice (draft only)
- `DELETE /api/invoices/:id` - Delete invoice (draft only)

#### Invoice Workflow:
- `POST /api/invoices/:id/send` - Send invoice to customer
- `POST /api/invoices/:id/pay` - Record payment
- `POST /api/invoices/:id/void` - Void/cancel invoice
- `GET /api/invoices/:id/pdf` - Download invoice PDF

#### Analytics:
- `GET /api/invoices/stats` - Get invoice statistics
- `GET /api/invoices/overdue` - Get overdue invoices

---

### 8. **Inventory Transactions API** (`/api/inventory`)

#### Read-Only (mostly):
- `GET /api/inventory/transactions` - List all transactions (admin)
- `GET /api/inventory/transactions/:id` - Get transaction details
- `GET /api/inventory/products/:productId` - Get transactions for product
- `POST /api/inventory/adjust` - Manual inventory adjustment (admin)

#### Analytics:
- `GET /api/inventory/summary` - Get inventory summary
- `GET /api/inventory/movements` - Get stock movements report

---

### 9. **Activity Logs API** (`/api/activity`)

#### Read-Only:
- `GET /api/activity` - List activity logs (admin only)
  - Filters: user_id, entity_type, action, date range
  - Pagination
- `GET /api/activity/:id` - Get activity log details
- `GET /api/activity/user/:userId` - Get user's activities

---

### 10. **Store Credit History API** (`/api/stores/:storeId/credit/history`)

#### Read Operations:
- `GET /api/stores/:storeId/credit/history` - Get credit history
- `GET /api/stores/:storeId/credit/balance` - Get current balance

---

## Additional API Endpoints

### **Dashboard & Analytics** (`/api/dashboard`)
- `GET /api/dashboard/admin` - Admin dashboard stats
  - Total orders, revenue, active stores
  - Low stock alerts
  - Recent orders
  - Top products
- `GET /api/dashboard/retailer` - Retailer dashboard stats
  - Total spent, active orders
  - Recent orders
  - Credit balance

### **Reports** (`/api/reports`)
- `GET /api/reports/sales` - Sales report
- `GET /api/reports/inventory` - Inventory report
- `GET /api/reports/customers` - Customer/store report
- `GET /api/reports/financial` - Financial report

### **Search** (`/api/search`)
- `GET /api/search?q=query` - Global search across products, orders, stores

---

## API Structure & Standards

### Route Organization
```
/app/api/
  ├── users/
  │   ├── route.ts (GET, POST)
  │   ├── [id]/route.ts (GET, PUT, DELETE)
  │   └── profile/route.ts
  ├── stores/
  │   ├── route.ts
  │   ├── [id]/route.ts
  │   └── [id]/credit/route.ts
  ├── categories/
  │   ├── route.ts
  │   └── [id]/route.ts
  ├── products/
  │   ├── route.ts
  │   ├── [id]/route.ts
  │   ├── featured/route.ts
  │   └── sku/[sku]/route.ts
  ├── orders/
  │   ├── route.ts
  │   ├── [id]/route.ts
  │   ├── [id]/confirm/route.ts
  │   └── [id]/items/route.ts
  ├── invoices/
  │   ├── route.ts
  │   ├── [id]/route.ts
  │   └── [id]/pdf/route.ts
  ├── inventory/
  │   ├── route.ts
  │   └── adjust/route.ts
  ├── activity/
  │   └── route.ts
  └── dashboard/
      ├── admin/route.ts
      └── retailer/route.ts
```

### Response Format
```typescript
// Success
{
  success: true,
  data: { ... },
  meta?: { pagination, filters }
}

// Error
{
  success: false,
  error: {
    message: "Error message",
    code: "ERROR_CODE",
    details?: { ... }
  }
}
```

### Authentication & Authorization
- All endpoints require authentication (via Supabase middleware)
- Role-based access control:
  - **Admin**: Full access to all endpoints
  - **Retailer**: Limited to their own data (stores, orders, invoices)
  - **Manager**: Similar to retailer with some admin capabilities

### Pagination
```typescript
{
  data: [...],
  meta: {
    total: 100,
    page: 1,
    perPage: 20,
    totalPages: 5
  }
}
```

---

## Implementation Priority

### Phase 1 - Core Functionality (MVP)
1. ✅ Authentication (Already done via Supabase)
2. Products API (GET list, GET by ID)
3. Categories API (GET list, GET tree)
4. Orders API (GET list, POST create, GET by ID)
5. Dashboard API (retailer stats)

### Phase 2 - Admin Features
6. Products API (POST, PUT, DELETE)
7. Orders API (status updates, admin management)
8. Stores API (full CRUD)
9. Invoices API (full CRUD)
10. Dashboard API (admin stats)

### Phase 3 - Advanced Features
11. Inventory API (transactions, adjustments)
12. Reports API
13. Activity Logs API
14. Credit Management API
15. Search API

---

## Database Considerations

### RLS (Row Level Security)
- Already implemented in schema.sql
- Enforces data access at database level
- Retailers can only see their own data

### Triggers
- `update_updated_at_column` - Auto-update timestamps
- `create_user_profile` - Auto-create user profile on signup
- `update_order_total` - Calculate order totals
- `update_stock_on_order` - Adjust inventory on orders
- `update_store_credit` - Track credit usage

### Performance Optimization
- Indexes on frequently queried columns (already defined)
- Consider materialized views for complex analytics
- Caching strategy for product catalog

---

## Next Steps

1. Create API utilities (`/lib/api/`)
   - Database query helpers
   - Response formatters
   - Error handlers
   - Pagination helpers

2. Create Supabase server utilities
   - Server-side client with RLS enforcement
   - Type-safe query builders

3. Implement APIs incrementally per priority phases

4. Add API documentation (Swagger/OpenAPI)

5. Implement rate limiting and caching

6. Add comprehensive error handling and logging
