import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface SubscriptionRequest {
  type: 'basic' | 'premium' | 'enterprise';
  duration_months: number;
}

const subscriptionPrices = {
  basic: { monthly: 2500, features: ['Basic ride booking', 'Standard support', 'Up to 10 rides/month'] },
  premium: { monthly: 5000, features: ['Unlimited rides', 'Priority support', 'Airport lounge access', 'Premium vehicles'] },
  enterprise: { monthly: 15000, features: ['All premium features', 'Dedicated account manager', 'Custom branding', 'Analytics dashboard'] }
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
    const subscriptionId = pathParts[pathParts.length - 1];
    const action = url.searchParams.get('action');

    switch (req.method) {
      case 'GET':
        if (action === 'plans') {
          // Get available subscription plans
          return new Response(JSON.stringify(subscriptionPrices), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else if (subscriptionId && subscriptionId !== 'subscriptions') {
          // Get specific subscription
          const { data: subscription, error } = await supabaseClient
            .from('subscriptions')
            .select('*')
            .eq('id', subscriptionId)
            .eq('user_id', user.id)
            .single();

          if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify(subscription), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          // Get user's subscriptions
          const { data: subscriptions, error } = await supabaseClient
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          return new Response(JSON.stringify(subscriptions || []), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

      case 'POST':
        const subscriptionData: SubscriptionRequest = await req.json();
        
        // Validate subscription type
        if (!subscriptionPrices[subscriptionData.type]) {
          return new Response(JSON.stringify({ error: 'Invalid subscription type' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Check for existing active subscription
        const { data: existingSubscription } = await supabaseClient
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (existingSubscription) {
          return new Response(JSON.stringify({ error: 'User already has an active subscription' }), {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const priceInfo = subscriptionPrices[subscriptionData.type];
        const totalPrice = priceInfo.monthly * subscriptionData.duration_months;
        
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + subscriptionData.duration_months);

        const newSubscription = {
          user_id: user.id,
          type: subscriptionData.type,
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          price: totalPrice,
          features: priceInfo.features,
        };

        const { data: subscription, error } = await supabaseClient
          .from('subscriptions')
          .insert([newSubscription])
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify(subscription), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'PUT':
        if (!subscriptionId || subscriptionId === 'subscriptions') {
          return new Response(JSON.stringify({ error: 'Subscription ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const updateData = await req.json();
        
        const { data: updatedSubscription, error: updateError } = await supabaseClient
          .from('subscriptions')
          .update(updateData)
          .eq('id', subscriptionId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) {
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify(updatedSubscription), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'DELETE':
        if (!subscriptionId || subscriptionId === 'subscriptions') {
          return new Response(JSON.stringify({ error: 'Subscription ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Cancel subscription (set status to cancelled instead of deleting)
        const { data: cancelledSubscription, error: cancelError } = await supabaseClient
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('id', subscriptionId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (cancelError) {
          return new Response(JSON.stringify({ error: cancelError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({
          message: 'Subscription cancelled successfully',
          subscription: cancelledSubscription
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error in subscriptions function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});