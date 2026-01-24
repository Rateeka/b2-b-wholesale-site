# Registration Flow Documentation

## Overview
The registration system creates new retailer accounts with their associated stores in a two-step process.

## Database Setup

### Current State (Clean)
- **auth.users**: 1 user (admin@gmail.com)
- **public.users**: 1 user (admin@gmail.com) 
- **stores**: 0 stores
- **orders**: 0 orders

### Trigger System
✅ **Trigger**: `on_auth_user_created` - ENABLED
- Automatically syncs new users from `auth.users` → `public.users`
- Sets default role to 'retailer' if not specified
- Triggers on INSERT or UPDATE to auth.users

### RLS Policies

#### For `public.users` table:
- ✅ "Enable insert for authenticated users" - Allows new users to be created
- ✅ "Service role can view all users" - Admin access
- ✅ "Service role full access to users" - Admin management

#### For `stores` table:
- ✅ "Users can create their own store" - `WITH CHECK (user_id = auth.uid())`
- ✅ "Admins can insert stores" - Admin override capability
- ✅ "Service role can manage all stores" - Full admin access

## Registration Flow

### Step 1: User Signs Up (Frontend → Supabase Auth)
```typescript
// app/register/page.tsx → lib/auth.ts
const { user, session } = await signUp(email, password, {
  full_name: formData.fullName,
  phone: formData.phone,
})
```

**What happens:**
1. Creates user in `auth.users` with metadata:
   - `email`
   - `full_name`
   - `phone`
   - `role: 'retailer'` (default)
2. Trigger `on_auth_user_created` fires automatically
3. User is synced to `public.users` table with same data
4. Returns user object and session (if email confirmation disabled)

### Step 2: Store Creation (Frontend → Supabase Database)
```typescript
// app/register/page.tsx → lib/auth.ts
await createStore(user.id, {
  name: formData.storeName,
  email: formData.email,
  phone: formData.phone,
  address_line1: formData.address,
  city: formData.city,
  province: formData.province || 'ON',
  postal_code: formData.postalCode,
  store_type: formData.businessType, // grocery_store | restaurant | distributor | other
})
```

**What happens:**
1. Validates required fields (name, email, store_type, city)
2. Inserts into `stores` table with:
   - `user_id`: Links to the user
   - Store details from form
   - `tier: 'standard'` (default)
   - `status: 'pending'` (requires admin approval)
3. RLS policy checks: `user_id = auth.uid()` ✅
4. Returns created store object

### Step 3: Redirect
- **If session exists**: Redirect to `/retailer/dashboard`
- **If no session**: Show email confirmation message, redirect to `/login`

## Required Form Fields

### User Information (Required)
- ✅ Full Name
- ✅ Email
- ✅ Password (min 6 characters)
- ✅ Confirm Password
- Phone (optional)

### Store Information (Required)
- ✅ Store Name
- ✅ Business Type (grocery_store | restaurant | distributor | other)
- ✅ City
- Province (defaults to 'ON')
- Address (optional but recommended)
- Postal Code (optional but recommended)

## Error Handling

### Common Errors
1. **"Please fill in all required fields"** - Missing required form data
2. **"Password must be at least 6 characters"** - Password too short
3. **"Passwords do not match"** - Confirmation mismatch
4. **"User account creation failed"** - Supabase auth error (duplicate email, etc.)
5. **"Failed to create store"** - Database error or RLS policy violation

### Debugging
Check browser console for detailed error logs:
```javascript
console.error('Registration error:', err)
console.error('Store creation failed:', error)
```

## Testing the Flow

### Test Registration (Manual)
1. Navigate to `/register`
2. Fill in all required fields
3. Submit form
4. Check database:
   ```sql
   -- Should see new user in both tables
   SELECT * FROM auth.users WHERE email = 'test@example.com';
   SELECT * FROM public.users WHERE email = 'test@example.com';
   SELECT * FROM stores WHERE user_id = '<user_id>';
   ```

### Expected Results
- ✅ User created in `auth.users` with role='retailer'
- ✅ User automatically synced to `public.users` (via trigger)
- ✅ Store created with status='pending'
- ✅ User redirected to dashboard or login page

## Admin Actions Required

After a new retailer registers:
1. Admin logs in to `/admin/stores`
2. Reviews pending store application
3. Approves or rejects the store
4. On approval: Store status changes to 'active'
5. Retailer can now place orders

## Security Notes

- Passwords are handled by Supabase Auth (bcrypt hashed)
- RLS policies ensure users can only create stores for themselves
- Email confirmation can be enabled in Supabase dashboard
- Admin role is protected and cannot be self-assigned
- Store status starts as 'pending' to require admin approval
