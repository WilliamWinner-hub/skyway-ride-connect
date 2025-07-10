import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface DriverRequest {
  license_number: string;
  license_expiry: string;
  vehicle_type: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_plate: string;
  vehicle_color?: string;
  airport_id: string;
  documents?: any;
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
    const driverId = pathParts[pathParts.length - 1];

    switch (req.method) {
      case 'GET':
        if (driverId && driverId !== 'drivers') {
          // Get specific driver
          const { data: driver, error } = await supabaseClient
            .from('drivers')
            .select(`
              *,
              profile:profiles!drivers_user_id_fkey(full_name, phone, avatar_url),
              airport:airports(name, code, city, country)
            `)
            .eq('id', driverId)
            .single();

          if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify(driver), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // Get available drivers or all drivers for admin
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();

          let query = supabaseClient
            .from('drivers')
            .select(`
              *,
              profile:profiles!drivers_user_id_fkey(full_name, phone, avatar_url),
              airport:airports(name, code, city, country)
            `);

          // If not admin, only show available drivers
          if (!profile || !['super_admin', 'airline_admin'].includes(profile.role)) {
            query = query.eq('status', 'active').eq('is_available', true);
          }

          // Filter by airport if specified
          const airportId = url.searchParams.get('airport_id');
          if (airportId) {
            query = query.eq('airport_id', airportId);
          }

          const { data: drivers, error } = await query.order('rating', { ascending: false });

          return new Response(JSON.stringify(drivers || []), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      case 'POST':
        const driverData: DriverRequest = await req.json();
        
        // Validate required fields
        const requiredFields = ['license_number', 'license_expiry', 'vehicle_type', 'vehicle_make', 
                               'vehicle_model', 'vehicle_year', 'vehicle_plate', 'airport_id'];
        const missingFields = requiredFields.filter(field => !driverData[field as keyof DriverRequest]);
        
        if (missingFields.length > 0) {
          return new Response(JSON.stringify({ 
            error: 'Missing required fields', 
            fields: missingFields 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Check if user already has a driver profile
        const { data: existingDriver } = await supabaseClient
          .from('drivers')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (existingDriver) {
          return new Response(JSON.stringify({ error: 'Driver profile already exists' }), {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const newDriver = {
          user_id: user.id,
          license_number: driverData.license_number,
          license_expiry: driverData.license_expiry,
          vehicle_type: driverData.vehicle_type,
          vehicle_make: driverData.vehicle_make,
          vehicle_model: driverData.vehicle_model,
          vehicle_year: driverData.vehicle_year,
          vehicle_plate: driverData.vehicle_plate.toUpperCase(),
          vehicle_color: driverData.vehicle_color,
          airport_id: driverData.airport_id,
          documents: driverData.documents,
          status: 'pending', // Requires admin approval
        };

        const { data: driver, error } = await supabaseClient
          .from('drivers')
          .insert([newDriver])
          .select(`
            *,
            profile:profiles!drivers_user_id_fkey(full_name, phone, avatar_url),
            airport:airports(name, code, city, country)
          `)
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify(driver), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'PUT':
        if (!driverId || driverId === 'drivers') {
          return new Response(JSON.stringify({ error: 'Driver ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const updateData = await req.json();
        
        // Remove fields that shouldn't be updated by regular users
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (!profile || !['super_admin', 'airline_admin'].includes(profile.role)) {
          // Non-admin users can't update certain fields
          delete updateData.status;
          delete updateData.rating;
          delete updateData.total_rides;
        }

        const { data: updatedDriver, error: updateError } = await supabaseClient
          .from('drivers')
          .update(updateData)
          .eq('id', driverId)
          .select(`
            *,
            profile:profiles!drivers_user_id_fkey(full_name, phone, avatar_url),
            airport:airports(name, code, city, country)
          `)
          .single();

        if (updateError) {
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify(updatedDriver), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'DELETE':
        if (!driverId || driverId === 'drivers') {
          return new Response(JSON.stringify({ error: 'Driver ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { error: deleteError } = await supabaseClient
          .from('drivers')
          .delete()
          .eq('id', driverId);

        if (deleteError) {
          return new Response(JSON.stringify({ error: deleteError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ message: 'Driver profile deleted successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error in drivers function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});