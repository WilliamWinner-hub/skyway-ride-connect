import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft, User, Car, Building, Plane } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

type UserRole = 'passenger' | 'driver' | 'garage_partner' | 'airline_partner';

export default function Auth() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [step, setStep] = useState<'email' | 'role' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('passenger');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      // If we have profile data, use it for navigation
      if (profile?.role) {
        switch (profile.role) {
          case 'driver':
            navigate('/drivers');
            break;
          case 'garage_partner':
            navigate('/garages');
            break;
          case 'airline_partner':
            navigate('/airlines');
            break;
          default:
            navigate('/book');
        }
      }
      // If no profile yet but user exists, wait for profile to load
      // (this will trigger again when profile loads)
    }
  }, [user, profile, authLoading, navigate]);

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
        setStep('role');
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

  const proceedToOTP = () => {
    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    setStep('otp');
    setResendCooldown(30);
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
        // Set session in Supabase client if provided
        if (response.session) {
          await supabase.auth.setSession(response.session);
          // Refresh profile data in AuthContext
          await refreshProfile();
        }

        // Map frontend roles to database enum values (now that we have all enum values)
        const dbRole = selectedRole; // Direct mapping now works

        // Create or update profile with role and full name
        if (response.isNewUser) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              full_name: fullName,
              role: dbRole,
            })
            .eq('user_id', response.user.id);

          if (profileError) {
            console.error('Profile update error:', profileError);
            toast.error('Account created but profile setup failed. Please contact support.');
            return;
          }

          // Create role-specific profile
          try {
            if (selectedRole === 'driver') {
              const { error: driverError } = await supabase
                .from('driver_profiles')
                .insert({
                  user_id: response.user.id,
                  experience_years: 0,
                  background_check_status: 'pending'
                });
              if (driverError) console.error('Driver profile creation error:', driverError);
            } else if (selectedRole === 'garage_partner') {
              const { error: garageError } = await supabase
                .from('garage_profiles')
                .insert({
                  user_id: response.user.id,
                  business_name: fullName + "'s Garage",
                  contact_email: email,
                  capacity: 10
                });
              if (garageError) console.error('Garage profile creation error:', garageError);
            } else if (selectedRole === 'airline_partner') {
              const { error: airlineError } = await supabase
                .from('airline_profiles')
                .insert({
                  user_id: response.user.id,
                  airline_name: fullName + " Airlines",
                  contact_person: fullName,
                  email_address: email,
                  partnership_type: 'standard',
                  commission_rate: 0.05
                });
              if (airlineError) console.error('Airline profile creation error:', airlineError);
            }
          } catch (roleProfileError) {
            console.error('Role-specific profile creation error:', roleProfileError);
            // Don't block login for role profile creation errors
          }

          toast.success(`Welcome! Your ${selectedRole.replace('_', ' ')} account has been created.`);
        } else {
          // Update existing user's role if needed
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: dbRole })
            .eq('user_id', response.user.id);
          
          if (updateError) {
            console.error('Profile role update error:', updateError);
          }
          
          toast.success('Welcome back!');
        }
        
        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem('aeroride_remember_me', 'true');
        }
        
        // Navigate based on role
        setTimeout(() => {
          switch (selectedRole) {
            case 'driver':
              navigate('/drivers');
              break;
            case 'garage_partner':
              navigate('/garages');
              break;
            case 'airline_partner':
              navigate('/airlines');
              break;
            default:
              navigate('/book');
          }
        }, 1000);
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
    if (step === 'otp') {
      setStep('role');
    } else {
      setStep('email');
    }
    setOtp('');
  };

  const roleOptions = [
    { 
      value: 'passenger' as UserRole, 
      label: 'Passenger', 
      description: 'Book airport rides and manage your travel',
      icon: User 
    },
    { 
      value: 'driver' as UserRole, 
      label: 'Driver', 
      description: 'Drive for premium airport transportation',
      icon: Car 
    },
    { 
      value: 'garage_partner' as UserRole, 
      label: 'Garage Partner', 
      description: 'Manage fleet and driver operations',
      icon: Building 
    },
    { 
      value: 'airline_partner' as UserRole, 
      label: 'Airline Partner', 
      description: 'Integrate ground transportation services',
      icon: Plane 
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {step === 'email' ? 'Welcome to AeroRide Nexus' : 
             step === 'role' ? 'Choose Your Role' : 'Enter Verification Code'}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 'email' 
              ? 'Enter your email to get started'
              : step === 'role'
              ? 'Select how you plan to use our platform'
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
          ) : step === 'role' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>I want to:</Label>
                {roleOptions.map((role) => {
                  const Icon = role.icon;
                  return (
                    <div
                      key={role.value}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-primary ${
                        selectedRole === role.value ? "border-primary bg-primary/5" : "border-border"
                      }`}
                      onClick={() => setSelectedRole(role.value)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {role.label}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {role.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button 
                onClick={proceedToOTP} 
                disabled={!fullName.trim()}
                className="w-full"
              >
                Continue to Verification
              </Button>

              <Button
                variant="ghost"
                onClick={goBack}
                className="w-full text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to email
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