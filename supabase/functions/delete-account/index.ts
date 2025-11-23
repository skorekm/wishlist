import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    // Create a Supabase client with the Auth context of the user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get the user from the token
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a Supabase client with Service Role Key for admin actions
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Anonymize reservations (SET NULL on user_id)
    // We keep reserver_name and reserver_email for wishlist owner's benefit  
    // but break the link to the authenticated user account
    const { error: reservationsError } = await supabaseAdmin
      .from('reservations')
      .update({ user_id: null })
      .eq('user_id', user.id)

    if (reservationsError) {
      console.error('Error anonymizing reservations:', reservationsError)
      throw new Error('Failed to anonymize reservations')
    }

    // 2. Delete wishlist permissions
    const { error: permissionsError } = await supabaseAdmin
      .from('wishlist_permissions')
      .delete()
      .eq('user_id', user.id)

    if (permissionsError) {
      console.error('Error deleting permissions:', permissionsError)
      throw new Error('Failed to delete permissions')
    }

    // 3. Delete share links
    const { error: shareLinksError } = await supabaseAdmin
      .from('share_links')
      .delete()
      .eq('created_by', user.id)

    if (shareLinksError) {
      console.error('Error deleting share links:', shareLinksError)
      throw new Error('Failed to delete share links')
    }

    // 4. Delete wishlist items
    const { error: itemsError } = await supabaseAdmin
      .from('wishlist_items')
      .delete()
      .eq('author_id', user.id)

    if (itemsError) {
      console.error('Error deleting wishlist items:', itemsError)
      throw new Error('Failed to delete wishlist items')
    }

    // 5. Delete wishlists
    const { error: wishlistsError } = await supabaseAdmin
      .from('wishlists')
      .delete()
      .eq('author_id', user.id)

    if (wishlistsError) {
      console.error('Error deleting wishlists:', wishlistsError)
      throw new Error('Failed to delete wishlists')
    }

    // 6. Delete the user account from Supabase Auth
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteUserError) {
      console.error('Error deleting user account:', deleteUserError)
      throw new Error('Failed to delete account')
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
