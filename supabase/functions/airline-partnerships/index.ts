import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface AirlinePartnershipRequest {
  airline_name: string;
  contact_person: string;
  email: string;
  phone?: string;
  iata_code?: string;
  headquarters: string;
  partnership_type: string;
  commission_rate?: number;
  airports?: string[];
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
    const partnershipId = pathParts[pathParts.length - 1];

    // Check admin permissions for most operations
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isAdmin = profile && ['super_admin', 'airline_admin'].includes(profile.role);

    switch (req.method) {
      case 'GET':
        if (partnershipId && partnershipId !== 'airline-partnerships') {
          // Get specific partnership
          const { data: partnership, error } = await supabaseClient
            .from('airline_partnerships')
            .select('*')
            .eq('id', partnershipId)
            .single();

          if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify(partnership), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // Get all partnerships (admin only for full details, public for basic info)
          let query = supabaseClient.from('airline_partnerships');
          
          if (isAdmin) {
            query = query.select('*');
          } else {
            query = query
              .select('id, airline_name, iata_code, headquarters, partnership_type, status')
              .eq('status', 'approved');
          }

          const { data: partnerships, error } = await query.order('created_at', { ascending: false });

          return new Response(JSON.stringify(partnerships || []), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      case 'POST':
        const partnershipData: AirlinePartnershipRequest = await req.json();
        
        // Validate required fields
        const requiredFields = ['airline_name', 'contact_person', 'email', 'headquarters', 'partnership_type'];
        const missingFields = requiredFields.filter(field => !partnershipData[field as keyof AirlinePartnershipRequest]);
        
        if (missingFields.length > 0) {
          return new Response(JSON.stringify({ 
            error: 'Missing required fields', 
            fields: missingFields 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Check if airline already exists
        const { data: existingPartnership } = await supabaseClient
          .from('airline_partnerships')
          .select('id')
          .eq('airline_name', partnershipData.airline_name)
          .single();

        if (existingPartnership) {
          return new Response(JSON.stringify({ error: 'Partnership with this airline already exists' }), {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const newPartnership = {
          airline_name: partnershipData.airline_name,
          contact_person: partnershipData.contact_person,
          email: partnershipData.email,
          phone: partnershipData.phone,
          iata_code: partnershipData.iata_code,
          headquarters: partnershipData.headquarters,
          partnership_type: partnershipData.partnership_type,
          commission_rate: partnershipData.commission_rate || 15.0, // Default 15%
          airports: partnershipData.airports || [],
          status: isAdmin ? 'approved' : 'pending', // Admin can approve immediately
        };

        const { data: partnership, error } = await supabaseClient
          .from('airline_partnerships')
          .insert([newPartnership])
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify(partnership), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'PUT':
        if (!partnershipId || partnershipId === 'airline-partnerships') {
          return new Response(JSON.stringify({ error: 'Partnership ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (!isAdmin) {
          return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const updateData = await req.json();
        
        const { data: updatedPartnership, error: updateError } = await supabaseClient
          .from('airline_partnerships')
          .update(updateData)
          .eq('id', partnershipId)
          .select()
          .single();

        if (updateError) {
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify(updatedPartnership), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'DELETE':
        if (!partnershipId || partnershipId === 'airline-partnerships') {
          return new Response(JSON.stringify({ error: 'Partnership ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (!isAdmin) {
          return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { error: deleteError } = await supabaseClient
          .from('airline_partnerships')
          .delete()
          .eq('id', partnershipId);

        if (deleteError) {
          return new Response(JSON.stringify({ error: deleteError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ message: 'Partnership deleted successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error in airline-partnerships function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});