import { createClient } from '@supabase/supabase-js'

// This script creates an admin user
// Run this with: node --loader tsx scripts/create-admin.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // You'll need to add this to .env.local

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  const email = 'admin@teetoz.com'
  const password = 'Admin123!@#'
  
  try {
    // Create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        full_name: 'Admin User',
        role: 'admin'
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return
    }

    console.log('✅ Admin user created successfully!')
    console.log('\nAdmin Credentials:')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('\nUser ID:', authData.user.id)
    
    // The trigger should create the profile automatically
    // Let's verify it was created
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      console.log('\n⚠️  Profile not found, creating manually...')
      
      // Create profile manually
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          full_name: 'Admin User',
          role: 'admin'
        })

      if (insertError) {
        console.error('Error creating profile:', insertError)
      } else {
        console.log('✅ Profile created successfully!')
      }
    } else {
      console.log('✅ Profile created by trigger:', profile)
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createAdminUser()
