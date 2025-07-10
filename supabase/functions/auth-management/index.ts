import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface ProfileUpdateRequest {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  role?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Set the auth for the client
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const action = pathParts[pathParts.length - 1];

    switch (req.method) {
      case 'GET':
        if (action === 'profile') {
          // Get user profile
          const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify(profile), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else if (action === 'users') {
          // Admin only - get all users
          const { data: adminProfile } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();

          if (!adminProfile || !['super_admin', 'airline_admin'].includes(adminProfile.role)) {
            return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          const { data: profiles, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

          return new Response(JSON.stringify(profiles || []), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        break;

      case 'PUT':
        if (action === 'profile') {
          const updateData: ProfileUpdateRequest = await req.json();
          
          // Check if user is trying to update role
          if (updateData.role) {
            const { data: currentProfile } = await supabaseClient
              .from('profiles')
              .select('role')
              .eq('user_id', user.id)
              .single();

            // Only super_admin can change roles
            if (!currentProfile || currentProfile.role !== 'super_admin') {
              delete updateData.role;
            }
          }

          const { data: updatedProfile, error } = await supabaseClient
            .from('profiles')
            .update(updateData)
            .eq('user_id', user.id)
            .select()
            .single();

          if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify(updatedProfile), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // Admin updating other user's profile
          const userId = pathParts[pathParts.length - 1];
          const updateData: ProfileUpdateRequest = await req.json();

          // Check admin permissions
          const { data: adminProfile } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();

          if (!adminProfile || !['super_admin', 'airline_admin'].includes(adminProfile.role)) {
            return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          const { data: updatedProfile, error } = await supabaseClient
            .from('profiles')
            .update(updateData)
            .eq('user_id', userId)
            .select()
            .single();

          if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify(updatedProfile), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        break;

      case 'POST':
        if (action === 'verify-user') {
          const { user_id } = await req.json();

          // Check admin permissions
          const { data: adminProfile } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();

          if (!adminProfile || !['super_admin', 'airline_admin'].includes(adminProfile.role)) {
            return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          const { data: verifiedProfile, error } = await supabaseClient
            .from('profiles')
            .update({ is_verified: true })
            .eq('user_id', user_id)
            .select()
            .single();

          if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify(verifiedProfile), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        break;

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in auth-management function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});