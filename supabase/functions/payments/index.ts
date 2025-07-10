import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface PaymentRequest {
  ride_id: string;
  payment_method: string;
  amount?: number;
}

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
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
    const paymentId = pathParts[pathParts.length - 1];
    const action = url.searchParams.get('action');

    switch (req.method) {
      case 'GET':
        if (paymentId && paymentId !== 'payments') {
          // Get specific payment
          const { data: payment, error } = await supabaseClient
            .from('payments')
            .select(`
              *,
              ride:rides(
                passenger_id,
                driver_id,
                pickup_location,
                destination_location,
                status
              )
            `)
            .eq('id', paymentId)
            .single();

          if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify(payment), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // Get user's payments
          const { data: payments, error } = await supabaseClient
            .from('payments')
            .select(`
              *,
              ride:rides(
                passenger_id,
                driver_id,
                pickup_location,
                destination_location,
                status
              )
            `)
            .eq('rides.passenger_id', user.id)
            .order('created_at', { ascending: false });

          return new Response(JSON.stringify(payments || []), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      case 'POST':
        if (action === 'initialize') {
          const paymentData: PaymentRequest = await req.json();
          
          // Get ride details
          const { data: ride, error: rideError } = await supabaseClient
            .from('rides')
            .select('*')
            .eq('id', paymentData.ride_id)
            .eq('passenger_id', user.id)
            .single();

          if (rideError || !ride) {
            return new Response(JSON.stringify({ error: 'Ride not found or unauthorized' }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          // Get user profile
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('email, full_name')
            .eq('user_id', user.id)
            .single();

          const amount = paymentData.amount || ride.fare_amount;
          
          // Create payment record
          const { data: payment, error: paymentError } = await supabaseClient
            .from('payments')
            .insert([{
              ride_id: paymentData.ride_id,
              amount: amount,
              payment_method: paymentData.payment_method,
              status: 'pending'
            }])
            .select()
            .single();

          if (paymentError) {
            return new Response(JSON.stringify({ error: paymentError.message }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          // Initialize Paystack payment for Nigerian market
          if (paymentData.payment_method === 'paystack') {
            const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
            if (!paystackSecretKey) {
              return new Response(JSON.stringify({ error: 'Payment gateway not configured' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }

            const paystackData = {
              email: profile?.email || user.email,
              amount: Math.round(amount * 100), // Paystack expects amount in kobo
              currency: 'NGN',
              reference: payment.id,
              callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payments/verify`,
              metadata: {
                ride_id: paymentData.ride_id,
                passenger_name: profile?.full_name || 'AeroRide User'
              }
            };

            try {
              const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${paystackSecretKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(paystackData),
              });

              const paystackResult: PaystackInitializeResponse = await paystackResponse.json();

              if (paystackResult.status) {
                // Update payment with transaction reference
                await supabaseClient
                  .from('payments')
                  .update({
                    transaction_id: paystackResult.data.reference,
                    provider_reference: paystackResult.data.access_code
                  })
                  .eq('id', payment.id);

                return new Response(JSON.stringify({
                  payment_id: payment.id,
                  authorization_url: paystackResult.data.authorization_url,
                  reference: paystackResult.data.reference
                }), {
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
              } else {
                throw new Error(paystackResult.message);
              }
            } catch (error) {
              console.error('Paystack initialization error:', error);
              return new Response(JSON.stringify({ error: 'Payment initialization failed' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }
          }

          return new Response(JSON.stringify(payment), {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } else if (action === 'verify') {
          const { reference } = await req.json();
          
          // Verify payment with Paystack
          const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
          if (!paystackSecretKey) {
            return new Response(JSON.stringify({ error: 'Payment gateway not configured' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          try {
            const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
              headers: {
                'Authorization': `Bearer ${paystackSecretKey}`,
              },
            });

            const verifyResult = await verifyResponse.json();

            if (verifyResult.status && verifyResult.data.status === 'success') {
              // Update payment status
              const { data: updatedPayment, error } = await supabaseClient
                .from('payments')
                .update({
                  status: 'completed',
                  provider_reference: verifyResult.data.reference
                })
                .eq('id', reference)
                .select()
                .single();

              if (error) {
                throw new Error(error.message);
              }

              // Update ride status
              await supabaseClient
                .from('rides')
                .update({ status: 'accepted' })
                .eq('id', updatedPayment.ride_id);

              return new Response(JSON.stringify({
                message: 'Payment verified successfully',
                payment: updatedPayment
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            return new Response(JSON.stringify({ error: 'Payment verification failed' }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
        break;

      case 'PUT':
        if (!paymentId || paymentId === 'payments') {
          return new Response(JSON.stringify({ error: 'Payment ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const updateData = await req.json();
        
        const { data: updatedPayment, error: updateError } = await supabaseClient
          .from('payments')
          .update(updateData)
          .eq('id', paymentId)
          .select()
          .single();

        if (updateError) {
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify(updatedPayment), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error in payments function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});