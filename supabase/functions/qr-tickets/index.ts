import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

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
        if (action === 'generate') {
          const rideId = url.searchParams.get('ride_id');
          
          if (!rideId) {
            return new Response(JSON.stringify({ error: 'Ride ID is required' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          // Get ride details
          const { data: ride, error: rideError } = await supabaseClient
            .from('rides')
            .select(`
              *,
              passenger:profiles!rides_passenger_id_fkey(full_name, phone),
              driver:profiles!rides_driver_id_fkey(full_name, phone),
              airport:airports(name, code, city)
            `)
            .eq('id', rideId)
            .or(`passenger_id.eq.${user.id},driver_id.eq.${user.id}`)
            .single();

          if (rideError || !ride) {
            return new Response(JSON.stringify({ error: 'Ride not found or unauthorized' }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          // Generate QR code if not exists
          let qrCode = ride.qr_code;
          if (!qrCode) {
            qrCode = crypto.randomUUID();
            await supabaseClient
              .from('rides')
              .update({ qr_code: qrCode })
              .eq('id', rideId);
          }

          // Create QR code data
          const qrData = {
            ride_id: ride.id,
            passenger_name: ride.passenger?.full_name,
            driver_name: ride.driver?.full_name || 'Not assigned',
            pickup_location: ride.pickup_location,
            destination_location: ride.destination_location,
            fare_amount: ride.fare_amount,
            currency: ride.currency,
            status: ride.status,
            qr_code: qrCode,
            timestamp: new Date().toISOString()
          };

          // Generate QR code URL (using a QR code service)
          const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(JSON.stringify(qrData))}`;

          return new Response(JSON.stringify({
            qr_code: qrCode,
            qr_code_url: qrCodeUrl,
            qr_data: qrData,
            ride: ride
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } else if (action === 'verify') {
          const qrCode = url.searchParams.get('qr_code');
          
          if (!qrCode) {
            return new Response(JSON.stringify({ error: 'QR code is required' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          // Verify QR code and get ride details
          const { data: ride, error } = await supabaseClient
            .from('rides')
            .select(`
              *,
              passenger:profiles!rides_passenger_id_fkey(full_name, phone),
              driver:profiles!rides_driver_id_fkey(full_name, phone),
              airport:airports(name, code, city)
            `)
            .eq('qr_code', qrCode)
            .single();

          if (error || !ride) {
            return new Response(JSON.stringify({ 
              error: 'Invalid QR code',
              valid: false 
            }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          // Check if QR code is still valid (not expired)
          const rideDate = new Date(ride.scheduled_time || ride.created_at);
          const now = new Date();
          const hoursFromRide = Math.abs(now.getTime() - rideDate.getTime()) / (1000 * 60 * 60);

          const isValid = hoursFromRide <= 24 && ['pending', 'accepted', 'in_progress'].includes(ride.status);

          return new Response(JSON.stringify({
            valid: isValid,
            ride: ride,
            qr_code: qrCode,
            verification_time: now.toISOString()
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        break;

      case 'POST':
        if (action === 'scan') {
          const { qr_code, scanner_role } = await req.json();
          
          if (!qr_code) {
            return new Response(JSON.stringify({ error: 'QR code is required' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          // Get ride from QR code
          const { data: ride, error } = await supabaseClient
            .from('rides')
            .select(`
              *,
              passenger:profiles!rides_passenger_id_fkey(full_name, phone),
              driver:profiles!rides_driver_id_fkey(full_name, phone),
              airport:airports(name, code, city)
            `)
            .eq('qr_code', qr_code)
            .single();

          if (error || !ride) {
            return new Response(JSON.stringify({ error: 'Invalid QR code' }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          // Log the scan activity
          const scanLog = {
            ride_id: ride.id,
            scanned_by: user.id,
            scanner_role: scanner_role || 'unknown',
            scanned_at: new Date().toISOString(),
            location: 'Airport Check-in' // This could be dynamic
          };

          // Update ride status based on scanner role
          let newStatus = ride.status;
          if (scanner_role === 'driver' && ride.status === 'accepted') {
            newStatus = 'in_progress';
            await supabaseClient
              .from('rides')
              .update({ 
                status: newStatus,
                pickup_time: new Date().toISOString()
              })
              .eq('id', ride.id);
          } else if (scanner_role === 'passenger' && ride.status === 'in_progress') {
            newStatus = 'completed';
            await supabaseClient
              .from('rides')
              .update({ 
                status: newStatus,
                completion_time: new Date().toISOString()
              })
              .eq('id', ride.id);
          }

          return new Response(JSON.stringify({
            message: 'QR code scanned successfully',
            ride: { ...ride, status: newStatus },
            scan_log: scanLog
          }), {
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
    console.error('Error in qr-tickets function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});