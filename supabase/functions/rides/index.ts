import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface RideRequest {
  airport_id: string;
  pickup_location: string;
  pickup_latitude: number;
  pickup_longitude: number;
  destination_location: string;
  destination_latitude: number;
  destination_longitude: number;
  vehicle_type: string;
  passenger_count?: number;
  special_requests?: string;
  scheduled_time?: string;
}

interface GoogleMapsResponse {
  routes: Array<{
    legs: Array<{
      distance: { value: number };
      duration: { value: number };
    }>;
  }>;
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
    const rideId = pathParts[pathParts.length - 1];

    switch (req.method) {
      case 'GET':
        if (rideId && rideId !== 'rides') {
          // Get specific ride
          const { data: ride, error } = await supabaseClient
            .from('rides')
            .select(`
              *,
              passenger:profiles!rides_passenger_id_fkey(full_name, phone),
              driver:profiles!rides_driver_id_fkey(full_name, phone, avatar_url),
              airport:airports(name, code, city)
            `)
            .eq('id', rideId)
            .single();

          if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify(ride), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // Get all rides for user
          const { data: rides, error } = await supabaseClient
            .from('rides')
            .select(`
              *,
              passenger:profiles!rides_passenger_id_fkey(full_name, phone),
              driver:profiles!rides_driver_id_fkey(full_name, phone, avatar_url),
              airport:airports(name, code, city)
            `)
            .or(`passenger_id.eq.${user.id},driver_id.eq.${user.id}`)
            .order('created_at', { ascending: false });

          return new Response(JSON.stringify(rides || []), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      case 'POST':
        const rideData: RideRequest = await req.json();
        
        // Validate required fields
        const requiredFields = ['airport_id', 'pickup_location', 'pickup_latitude', 'pickup_longitude', 
                               'destination_location', 'destination_latitude', 'destination_longitude', 'vehicle_type'];
        const missingFields = requiredFields.filter(field => !rideData[field as keyof RideRequest]);
        
        if (missingFields.length > 0) {
          return new Response(JSON.stringify({ 
            error: 'Missing required fields', 
            fields: missingFields 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Calculate distance and fare using Google Maps API
        const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
        if (!googleMapsApiKey) {
          return new Response(JSON.stringify({ error: 'Google Maps API key not configured' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${rideData.pickup_latitude},${rideData.pickup_longitude}&destination=${rideData.destination_latitude},${rideData.destination_longitude}&key=${googleMapsApiKey}`;
        
        let distance_km = 0;
        let estimated_duration = 0;
        
        try {
          const directionsResponse = await fetch(directionsUrl);
          const directionsData: GoogleMapsResponse = await directionsResponse.json();
          
          if (directionsData.routes && directionsData.routes.length > 0) {
            const route = directionsData.routes[0];
            distance_km = route.legs[0].distance.value / 1000; // Convert meters to kilometers
            estimated_duration = Math.ceil(route.legs[0].duration.value / 60); // Convert seconds to minutes
          }
        } catch (error) {
          console.error('Error calculating route:', error);
          // Fallback to simple distance calculation
          distance_km = calculateHaversineDistance(
            rideData.pickup_latitude, rideData.pickup_longitude,
            rideData.destination_latitude, rideData.destination_longitude
          );
          estimated_duration = Math.ceil(distance_km * 2); // Rough estimate
        }

        // Calculate fare based on vehicle type and distance (Nigerian rates)
        const baseFares = {
          sedan: 500,     // ₦500 base fare
          suv: 800,       // ₦800 base fare
          luxury: 1500,   // ₦1500 base fare
          van: 1000,      // ₦1000 base fare
          bus: 2000       // ₦2000 base fare
        };

        const perKmRates = {
          sedan: 150,     // ₦150 per km
          suv: 200,       // ₦200 per km
          luxury: 400,    // ₦400 per km
          van: 250,       // ₦250 per km
          bus: 300        // ₦300 per km
        };

        const baseFare = baseFares[rideData.vehicle_type as keyof typeof baseFares] || baseFares.sedan;
        const perKmRate = perKmRates[rideData.vehicle_type as keyof typeof perKmRates] || perKmRates.sedan;
        const fare_amount = baseFare + (distance_km * perKmRate);

        // Generate QR code (simplified - just a UUID for this implementation)
        const qr_code = crypto.randomUUID();

        const newRide = {
          passenger_id: user.id,
          airport_id: rideData.airport_id,
          pickup_location: rideData.pickup_location,
          pickup_latitude: rideData.pickup_latitude,
          pickup_longitude: rideData.pickup_longitude,
          destination_location: rideData.destination_location,
          destination_latitude: rideData.destination_latitude,
          destination_longitude: rideData.destination_longitude,
          distance_km,
          estimated_duration,
          fare_amount,
          vehicle_type: rideData.vehicle_type,
          passenger_count: rideData.passenger_count || 1,
          special_requests: rideData.special_requests,
          qr_code,
          scheduled_time: rideData.scheduled_time ? new Date(rideData.scheduled_time).toISOString() : null,
        };

        const { data: ride, error } = await supabaseClient
          .from('rides')
          .insert([newRide])
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify(ride), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'PUT':
        if (!rideId || rideId === 'rides') {
          return new Response(JSON.stringify({ error: 'Ride ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const updateData = await req.json();
        
        const { data: updatedRide, error: updateError } = await supabaseClient
          .from('rides')
          .update(updateData)
          .eq('id', rideId)
          .select()
          .single();

        if (updateError) {
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify(updatedRide), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'DELETE':
        if (!rideId || rideId === 'rides') {
          return new Response(JSON.stringify({ error: 'Ride ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { error: deleteError } = await supabaseClient
          .from('rides')
          .delete()
          .eq('id', rideId);

        if (deleteError) {
          return new Response(JSON.stringify({ error: deleteError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ message: 'Ride deleted successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error in rides function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to calculate distance using Haversine formula
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}