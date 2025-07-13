-- Fix infinite recursion in profiles RLS policies
-- Drop the problematic admin policy that causes recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a simple function to check user roles without recursion
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'airline_admin')
  );
$$;

-- Create new admin policy using the function
CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_admin_user());

-- Ensure all users can insert their own profile (critical for signup)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Ensure all users can view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Ensure all users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create tables for role-specific profile data
CREATE TABLE IF NOT EXISTS public.driver_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  license_number TEXT,
  license_expiry DATE,
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  vehicle_color TEXT,
  vehicle_plate TEXT,
  vehicle_type vehicle_type DEFAULT 'sedan',
  experience_years INTEGER DEFAULT 0,
  preferred_airports TEXT[],
  availability_schedule JSONB,
  background_check_status TEXT DEFAULT 'pending',
  insurance_policy_number TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.garage_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_license TEXT,
  services_offered TEXT[],
  operating_hours JSONB,
  location_address TEXT,
  location_latitude DECIMAL,
  location_longitude DECIMAL,
  contact_phone TEXT,
  contact_email TEXT,
  capacity INTEGER DEFAULT 10,
  specialties TEXT[],
  certification_documents JSONB,
  insurance_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.airline_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  airline_name TEXT NOT NULL,
  iata_code TEXT,
  contact_person TEXT,
  contact_position TEXT,
  office_address TEXT,
  phone_number TEXT,
  email_address TEXT,
  partnership_type TEXT DEFAULT 'standard',
  commission_rate DECIMAL DEFAULT 0.05,
  preferred_airports TEXT[],
  fleet_size INTEGER,
  destinations_served TEXT[],
  contract_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garage_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airline_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for driver_profiles
CREATE POLICY "Users can manage their own driver profile"
ON public.driver_profiles
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all driver profiles"
ON public.driver_profiles
FOR SELECT
TO authenticated
USING (public.is_admin_user());

-- RLS policies for garage_profiles
CREATE POLICY "Users can manage their own garage profile"
ON public.garage_profiles
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all garage profiles"
ON public.garage_profiles
FOR SELECT
TO authenticated
USING (public.is_admin_user());

-- RLS policies for airline_profiles
CREATE POLICY "Users can manage their own airline profile"
ON public.airline_profiles
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all airline profiles"
ON public.airline_profiles
FOR SELECT
TO authenticated
USING (public.is_admin_user());

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_driver_profiles_updated_at
    BEFORE UPDATE ON public.driver_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_garage_profiles_updated_at
    BEFORE UPDATE ON public.garage_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_airline_profiles_updated_at
    BEFORE UPDATE ON public.airline_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();