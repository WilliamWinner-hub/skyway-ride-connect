-- Create OTP table for temporary storage
CREATE TABLE public.otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert OTPs (for sending)
CREATE POLICY "Anyone can create OTPs" 
ON public.otps 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow verification (reading by email)
CREATE POLICY "Anyone can verify OTPs by email" 
ON public.otps 
FOR SELECT 
USING (true);

-- Create policy to allow updating attempts and used status
CREATE POLICY "Anyone can update OTP status" 
ON public.otps 
FOR UPDATE 
USING (true);

-- Add index for better performance
CREATE INDEX idx_otps_email_expires ON public.otps(email, expires_at);
CREATE INDEX idx_otps_code_email ON public.otps(code, email);

-- Create function to clean up expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.otps 
  WHERE expires_at < now() OR is_used = true;
END;
$$;