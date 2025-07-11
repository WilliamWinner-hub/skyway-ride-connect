import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';

interface OTPResponse {
  success: boolean;
  message: string;
  canResendAt?: number;
  error?: string;
}

interface VerifyResponse {
  success: boolean;
  isNewUser: boolean;
  user: {
    id: string;
    email: string;
  };
  session: any;
  message: string;
  error?: string;
}

export default function Auth() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const sendOTP = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('otp-auth/send-otp', {
        body: { email }
      });

      if (error) throw error;

      const response: OTPResponse = data;
      
      if (response.success) {
        toast.success(response.message);
        setStep('otp');
        setResendCooldown(30);
      } else {
        toast.error(response.error || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('otp-auth/verify-otp', {
        body: { email, code: otp, rememberMe }
      });

      if (error) throw error;

      const response: VerifyResponse = data;
      
      if (response.success) {
        toast.success(response.message);
        
        // Set session in Supabase client if provided
        if (response.session) {
          await supabase.auth.setSession(response.session);
        }
        
        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem('aeroride_remember_me', 'true');
        }
        
        navigate('/');
      } else {
        toast.error(response.error || 'Invalid OTP');
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    await sendOTP();
  };

  const goBack = () => {
    setStep('email');
    setOtp('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {step === 'email' ? 'Welcome to AeroRide Nexus' : 'Enter Verification Code'}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 'email' 
              ? 'Enter your email to receive a verification code'
              : `We sent a 6-digit code to ${email}`
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {step === 'email' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendOTP()}
                />
              </div>
              
              <Button 
                onClick={sendOTP} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <div className="flex justify-center">
                  <InputOTP 
                    value={otp} 
                    onChange={setOtp}
                    maxLength={6}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rememberMe" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="rememberMe" className="text-sm">
                  Remember me for 30 days
                </Label>
              </div>

              <Button 
                onClick={verifyOTP} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Continue'
                )}
              </Button>

              <div className="space-y-2">
                <Button
                  variant="ghost"
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0}
                  className="w-full text-sm"
                >
                  {resendCooldown > 0 
                    ? `Resend code in ${resendCooldown}s`
                    : 'Resend verification code'
                  }
                </Button>

                <Button
                  variant="ghost"
                  onClick={goBack}
                  className="w-full text-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to email
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}