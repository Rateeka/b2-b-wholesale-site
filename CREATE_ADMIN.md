# Creating an Admin Account

## Method 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard → **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Fill in:
   - **Email**: `admin@teetoz.com`
   - **Password**: `Admin123!@#`
   - **Auto Confirm User**: ✅ Check this
4. Click **Create user**
5. After the user is created, go to **Table Editor** → **users** table
6. Find the user with email `admin@teetoz.com`
7. Update the `role` column to `admin`

## Method 2: Using SQL Editor

Run this in your Supabase SQL Editor:

```sql
-- First, you need to create the auth user through the dashboard
-- Then run this to update their role to admin:

UPDATE public.users 
SET role = 'admin'
WHERE email = 'admin@teetoz.com';
```

## Method 3: Register Normally Then Promote

1. Go to `/register` on your app
2. Register with:
   - Email: `admin@teetoz.com`
   - Password: `Admin123!@#`
   - Fill in other required fields
3. After registration, run this SQL in Supabase:

```sql
UPDATE public.users 
SET role = 'admin'
WHERE email = 'admin@teetoz.com';
```

## Admin Credentials

**Email**: `admin@teetoz.com`  
**Password**: `Admin123!@#`

**Note**: You should change this password after first login in a production environment.
