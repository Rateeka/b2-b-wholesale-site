# Authentication Setup Guide

## Required Supabase Dashboard Configuration

### 1. Disable Email Confirmation (Development Only)

**For development/testing**, disable email confirmation to allow instant login:

1. Go to **Authentication > Providers > Email** in your Supabase dashboard
2. **Uncheck** "Confirm email"
3. Click **Save**

### 2. Alternative: Keep Email Confirmation Enabled (Production)

**For production**, keep email confirmation enabled but configure an SMTP provider:

1. Go to **Settings > Project Settings > Auth**
2. Configure SMTP settings with your email provider (SendGrid, AWS SES, etc.)
3. Users will receive confirmation emails before they can log in

## How It Works Now

### Registration Flow

1. User fills out registration form with:
   - Store name
   - Full name
   - Email
   - Password
   - Business type
   - City
   - Optional: Address, Province, Postal Code, Phone

2. `signUp()` function creates auth user with metadata
3. Database trigger automatically creates user profile in `users` table
4. User receives confirmation email (if enabled)
5. User is redirected to login page

### Login Flow

1. User enters email and password
2. `signIn()` function authenticates with Supabase
3. User is redirected to retailer dashboard
4. Middleware refreshes auth tokens automatically

## Database Trigger

The `handle_new_user()` trigger automatically creates a user profile when someone signs up:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'retailer'),
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: **Settings > API** in your Supabase dashboard

## Testing

### Test Registration

1. Go to `/register`
2. Fill out the form
3. Submit
4. If email confirmation is **disabled**: You can login immediately
5. If email confirmation is **enabled**: Check your email and click the confirmation link

### Test Login

1. Go to `/login`
2. Enter email and password
3. Click "Log in"
4. Should redirect to `/retailer/dashboard`

## Troubleshooting

### "Email address is invalid"
- Disable email confirmation in Supabase dashboard
- OR configure SMTP settings

### "new row violates row-level security policy"
- The trigger should handle this automatically
- Check that the trigger exists: Run in SQL Editor:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
  ```

### "User profile was not created"
- Check trigger logs in Supabase dashboard
- Verify RLS policies allow inserts

### Can't login after registration
- If email confirmation is enabled, check your email
- Verify user exists in `auth.users` table
- Check if user profile was created in `public.users` table

## Next Steps

1. Create store profile creation flow
2. Add role-based middleware for admin/retailer routing
3. Implement password reset functionality
4. Add social auth providers (Google, GitHub, etc.)
