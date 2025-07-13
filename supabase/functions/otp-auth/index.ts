import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface SendOTPRequest {
  email: string;
}

interface VerifyOTPRequest {
  email: string;
  code: string;
  rememberMe?: boolean;
}

// Rate limiting storage (in-memory for simplicity)
const rateLimitStore = new Map<string, { count: number; lastAttempt: number }>();

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(email);
  
  if (!userLimit) {
    rateLimitStore.set(email, { count: 1, lastAttempt: now });
    return false;
  }
  
  // Reset count if 30 seconds have passed
  if (now - userLimit.lastAttempt > 30000) {
    rateLimitStore.set(email, { count: 1, lastAttempt: now });
    return false;
  }
  
  // Allow max 3 attempts per 30 seconds
  if (userLimit.count >= 3) {
    return true;
  }
  
  userLimit.count++;
  userLimit.lastAttempt = now;
  return false;
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const url = new URL(req.url);
    const pathname = url.pathname;

    if (req.method === 'POST') {
      if (pathname.endsWith('/send-otp')) {
        const { email }: SendOTPRequest = await req.json();
        
        if (!email || !email.includes('@')) {
          return new Response(JSON.stringify({ error: 'Valid email is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Check rate limiting
        if (isRateLimited(email)) {
          return new Response(JSON.stringify({ 
            error: 'Too many attempts. Please wait 30 seconds before requesting another code.' 
          }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Clean up expired OTPs first
        await supabaseClient.rpc('cleanup_expired_otps');

        // Generate new OTP
        const code = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Store OTP in database
        const { error: insertError } = await supabaseClient
          .from('otps')
          .insert({
            email,
            code,
            expires_at: expiresAt.toISOString(),
          });

        if (insertError) {
          console.error('Error storing OTP:', insertError);
          return new Response(JSON.stringify({ error: 'Failed to generate OTP' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Send OTP via email
        try {
          await resend.emails.send({
            from: "AeroRide Nexus <onboarding@resend.dev>",
            to: [email],
            subject: "Your AeroRide Nexus Login Code",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Your Login Code</h2>
                <p>Enter this code to complete your login to AeroRide Nexus:</p>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h1 style="margin: 0; font-size: 32px; letter-spacing: 4px; text-align: center; color: #1f2937;">${code}</h1>
                </div>
                <p style="color: #6b7280; font-size: 14px;">This code will expire in 5 minutes.</p>
                <p style="color: #6b7280; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
              </div>
            `,
          });
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          return new Response(JSON.stringify({ error: 'Failed to send OTP email' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'OTP sent successfully',
          canResendAt: Date.now() + 30000 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } else if (pathname.endsWith('/verify-otp')) {
        const { email, code, rememberMe }: VerifyOTPRequest = await req.json();
        
        if (!email || !code) {
          return new Response(JSON.stringify({ error: 'Email and code are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Find valid OTP
        const { data: otpData, error: otpError } = await supabaseClient
          .from('otps')
          .select('*')
          .eq('email', email)
          .eq('code', code)
          .eq('is_used', false)
          .gte('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (otpError || !otpData) {
          return new Response(JSON.stringify({ error: 'Invalid or expired OTP' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Mark OTP as used
        await supabaseClient
          .from('otps')
          .update({ is_used: true })
          .eq('id', otpData.id);

        // Check if user exists
        const { data: existingProfile } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single();

        let userId: string;
        let isNewUser = false;

        if (existingProfile) {
          userId = existingProfile.user_id;
        } else {
          // Create new user in auth
          const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
            email,
            email_confirm: true,
          });

          if (authError || !authData.user) {
            return new Response(JSON.stringify({ error: 'Failed to create user account' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          userId = authData.user.id;
          isNewUser = true;

          // Create profile
          const { error: profileError } = await supabaseClient
            .from('profiles')
            .insert({
              user_id: userId,
              email,
              full_name: email.split('@')[0],
              role: 'passenger' // Default role
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            return new Response(JSON.stringify({ error: 'Failed to create user profile' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }

        // Generate session token
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.admin.generateLink({
          type: 'magiclink',
          email,
        });

        if (sessionError) {
          return new Response(JSON.stringify({ error: 'Failed to create session' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: true,
          isNewUser,
          user: {
            id: userId,
            email,
          },
          session: sessionData,
          message: isNewUser ? 'Account created successfully!' : 'Login successful!'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in otp-auth function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});