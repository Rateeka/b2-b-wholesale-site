# API Quick Reference Guide

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication via Supabase session cookies. Include credentials in requests:
```javascript
fetch('/api/endpoint', {
  credentials: 'include'
})
```

---

## Products

### List Products
```http
GET /api/products?page=1&limit=20&category_id={uuid}&search={query}&status={status}
```
**Auth**: Optional (affects pricing)  
**Query Params**:
- `page` (number): Page number, default 1
- `limit` (number): Items per page, default 20
- `category_id` (uuid): Filter by category
- `stock_status` (enum): in_stock | low_stock | out_of_stock
- `is_active` (boolean): true | false
- `featured` (boolean): true | false
- `search` (string): Full-text search
- `sort` (enum): newest | price_asc | price_desc | name

### Get Product
```http
GET /api/products/{id}
```
**Auth**: Optional (affects pricing)

### Get Featured Products
```http
GET /api/products/featured
```
**Auth**: Optional (affects pricing)

### Create Product (Admin)
```http
POST /api/products
Content-Type: application/json

{
  "sku": "PROD-001",
  "name": "Product Name",
  "description": "Product description",
  "category_id": "uuid",
  "base_price": 100.00,
  "gold_price": 85.00,
  "silver_price": 92.50,
  "stock_quantity": 100,
  "low_stock_threshold": 10,
  "image_url": "https://...",
  "is_featured": false,
  "is_active": true
}
```
**Auth**: Required (Admin only)

### Update Product (Admin)
```http
PUT /api/products/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "base_price": 110.00,
  "stock_quantity": 150,
  "stock_change_notes": "Restocked"
}
```
**Auth**: Required (Admin only)

---

## Categories

### List Categories
```http
GET /api/categories?flat=false&active_only=true
```
**Auth**: None  
**Query Params**:
- `flat` (boolean): Return flat list instead of tree
- `active_only` (boolean): Only active categories

### Get Category Products
```http
GET /api/categories/{id}/products?page=1&limit=20
```
**Auth**: Optional (affects pricing)

---

## Orders

### List Orders
```http
GET /api/orders?page=1&limit=20&status={status}&store_id={uuid}
```
**Auth**: Required  
**RLS**: Retailers see only their orders  
**Query Params**:
- `page`, `limit`: Pagination
- `status` (enum): pending | processing | confirmed | shipped | delivered | cancelled
- `store_id` (uuid): Filter by store (admin only)
- `start_date`, `end_date` (ISO date): Date range

### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "items": [
    {
      "product_id": "uuid",
      "quantity": 10
    }
  ],
  "shipping_cost": 25.00,
  "notes": "Optional notes"
}
```
**Auth**: Required (Retailer or Admin)  
**Validation**: Stock, credit limit, product availability

### Get Order
```http
GET /api/orders/{id}
```
**Auth**: Required  
**RLS**: Retailers can only access their orders

### Update Order Status
```http
PATCH /api/orders/{id}
Content-Type: application/json

{
  "status": "confirmed",
  "tracking_number": "TRACK-123",
  "notes": "Order confirmed"
}
```
**Auth**: Required  
**Permissions**: Retailers can only cancel pending orders, Admins have full control

---

## Stores

### List Stores
```http
GET /api/stores?page=1&limit=20&status={status}&tier={tier}
```
**Auth**: Optional  
**RLS**: Retailers see only their store  
**Query Params**:
- `page`, `limit`: Pagination
- `status` (enum): active | inactive | pending | suspended
- `tier` (enum): gold | silver | standard
- `store_type` (enum): retail | restaurant | wholesale | online
- `search` (string): Search by name, email, phone

### Create Store (Admin)
```http
POST /api/stores
Content-Type: application/json

{
  "name": "Store Name",
  "email": "store@example.com",
  "phone": "416-555-0123",
  "address": "123 Main St",
  "city": "Toronto",
  "province": "ON",
  "postal_code": "M5V 1A1",
  "country": "Canada",
  "store_type": "retail",
  "tier": "standard",
  "credit_limit": 10000.00,
  "payment_terms_days": 30
}
```
**Auth**: Required (Admin only)

### Get Store
```http
GET /api/stores/{id}
```
**Auth**: Optional  
**RLS**: Retailers can only access their own store

### Update Store
```http
PUT /api/stores/{id}
Content-Type: application/json

{
  "name": "Updated Store Name",
  "phone": "416-555-9999",
  "tier": "gold",
  "credit_limit": 25000.00
}
```
**Auth**: Required  
**Permissions**: Retailers can update basic info, Admins can update all fields

---

## Invoices

### List Invoices
```http
GET /api/invoices?page=1&limit=20&status={status}&store_id={uuid}
```
**Auth**: Required  
**RLS**: Retailers see only their invoices  
**Query Params**:
- `page`, `limit`: Pagination
- `status` (enum): pending | partial | paid | overdue | cancelled
- `store_id` (uuid): Filter by store (admin only)

### Create Invoice (Admin)
```http
POST /api/invoices
Content-Type: application/json

{
  "order_id": "uuid",
  "notes": "Optional notes"
}
```
**Auth**: Required (Admin only)  
**Auto-generates**: Invoice number, due date

### Get Invoice
```http
GET /api/invoices/{id}
```
**Auth**: Required  
**RLS**: Retailers can only access their invoices

### Update Invoice (Admin)
```http
PATCH /api/invoices/{id}
Content-Type: application/json

{
  "amount_paid": 500.00,
  "payment_method": "credit_card",
  "payment_reference": "TXN-123456"
}
```
**Auth**: Required (Admin only)  
**Auto-calculates**: amount_due, status updates

---

## Inventory

### List Transactions (Admin)
```http
GET /api/inventory/transactions?page=1&limit=20&product_id={uuid}
```
**Auth**: Required (Admin only)  
**Query Params**:
- `page`, `limit`: Pagination
- `product_id` (uuid): Filter by product
- `transaction_type` (enum): restock | sale | adjustment | return | damage
- `reference_type` (enum): order | manual | return | adjustment
- `reference_id` (uuid): Related resource ID
- `start_date`, `end_date` (ISO date): Date range

### Create Transaction (Admin)
```http
POST /api/inventory/transactions
Content-Type: application/json

{
  "product_id": "uuid",
  "transaction_type": "restock",
  "quantity_change": 100,
  "reference_type": "manual",
  "notes": "Received new shipment"
}
```
**Auth**: Required (Admin only)  
**Auto-updates**: Product stock quantity and status

---

## Dashboard

### Retailer Dashboard
```http
GET /api/dashboard/retailer
```
**Auth**: Required (Retailer only)  
**Returns**:
- Store info (tier, credit)
- Order stats
- Recent orders
- Unpaid invoices
- Low stock products

### Admin Dashboard
```http
GET /api/dashboard/admin
```
**Auth**: Required (Admin only)  
**Returns**:
- Store stats (total, active, tier breakdown)
- Order stats
- Revenue stats
- Product stats
- Invoice stats
- Recent orders
- Low stock products
- Pending stores
- Overdue invoices

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

---

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `500` - Internal Server Error

---

## Common Error Codes

- `VALIDATION_ERROR` - Invalid input data
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `DUPLICATE` - Resource already exists
- `STOCK_ERROR` - Insufficient stock
- `CREDIT_LIMIT_EXCEEDED` - Order exceeds credit limit
- `INTERNAL_ERROR` - Server error

---

## Examples with Fetch

### Create Order (JavaScript)
```javascript
const response = await fetch('/api/orders', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    items: [
      { product_id: 'uuid-1', quantity: 10 },
      { product_id: 'uuid-2', quantity: 5 }
    ],
    shipping_cost: 25.00,
    notes: 'Rush order'
  })
})

const result = await response.json()

if (result.success) {
  console.log('Order created:', result.data.order)
} else {
  console.error('Error:', result.error.message)
}
```

### Update Product Stock (JavaScript)
```javascript
const response = await fetch(`/api/products/${productId}`, {
  method: 'PUT',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    stock_quantity: 150,
    stock_change_notes: 'Restocked from supplier'
  })
})

const result = await response.json()
```

### List Products with Filters (JavaScript)
```javascript
const params = new URLSearchParams({
  page: '1',
  limit: '20',
  category_id: 'uuid',
  stock_status: 'in_stock',
  search: 'laptop'
})

const response = await fetch(`/api/products?${params}`, {
  credentials: 'include'
})

const result = await response.json()
const products = result.data
const pagination = result.meta.pagination
```

---

## Testing with cURL

### Create Product
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "sku": "LAPTOP-001",
    "name": "Business Laptop",
    "category_id": "uuid",
    "base_price": 999.99,
    "gold_price": 849.99,
    "silver_price": 899.99,
    "stock_quantity": 50
  }'
```

### Get Orders
```bash
curl http://localhost:3000/api/orders?page=1&limit=10 \
  -b cookies.txt
```

### Update Order Status
```bash
curl -X PATCH http://localhost:3000/api/orders/{id} \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "status": "confirmed"
  }'
```

---

## Notes

- All dates are in ISO 8601 format
- All monetary values are in CAD (Canadian Dollars)
- Tax rate is 13% (HST for Ontario)
- Default pagination: page=1, limit=20
- UUIDs are standard PostgreSQL UUIDs
- Timestamps include timezone information
