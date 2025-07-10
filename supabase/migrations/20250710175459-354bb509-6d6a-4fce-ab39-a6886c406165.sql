-- Create enums for various status types
CREATE TYPE ride_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');
CREATE TYPE driver_status AS ENUM ('pending', 'approved', 'suspended', 'active', 'offline');
CREATE TYPE vehicle_type AS ENUM ('sedan', 'suv', 'luxury', 'van', 'bus');
CREATE TYPE subscription_type AS ENUM ('basic', 'premium', 'enterprise');
CREATE TYPE user_role AS ENUM ('passenger', 'driver', 'airline_admin', 'super_admin');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role DEFAULT 'passenger',
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- Create airports table (Nigerian airports included)
CREATE TABLE public.airports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timezone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create drivers table
CREATE TABLE public.drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    license_number TEXT NOT NULL,
    license_expiry DATE NOT NULL,
    vehicle_type vehicle_type NOT NULL,
    vehicle_make TEXT NOT NULL,
    vehicle_model TEXT NOT NULL,
    vehicle_year INTEGER NOT NULL,
    vehicle_plate TEXT UNIQUE NOT NULL,
    vehicle_color TEXT,
    status driver_status DEFAULT 'pending',
    rating DECIMAL(3,2) DEFAULT 0,
    total_rides INTEGER DEFAULT 0,
    airport_id UUID REFERENCES public.airports(id),
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    is_available BOOLEAN DEFAULT false,
    documents JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- Create rides table
CREATE TABLE public.rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passenger_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    airport_id UUID REFERENCES public.airports(id) NOT NULL,
    pickup_location TEXT NOT NULL,
    pickup_latitude DECIMAL(10, 8) NOT NULL,
    pickup_longitude DECIMAL(11, 8) NOT NULL,
    destination_location TEXT NOT NULL,
    destination_latitude DECIMAL(10, 8) NOT NULL,
    destination_longitude DECIMAL(11, 8) NOT NULL,
    distance_km DECIMAL(8,2),
    estimated_duration INTEGER, -- in minutes
    fare_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'NGN',
    status ride_status DEFAULT 'pending',
    vehicle_type vehicle_type NOT NULL,
    passenger_count INTEGER DEFAULT 1,
    special_requests TEXT,
    qr_code TEXT UNIQUE,
    scheduled_time TIMESTAMP WITH TIME ZONE,
    pickup_time TIMESTAMP WITH TIME ZONE,
    completion_time TIMESTAMP WITH TIME ZONE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'NGN',
    payment_method TEXT NOT NULL,
    status payment_status DEFAULT 'pending',
    transaction_id TEXT,
    provider_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type subscription_type NOT NULL,
    status TEXT DEFAULT 'active',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    end_date TIMESTAMP WITH TIME ZONE,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'NGN',
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create airline_partnerships table
CREATE TABLE public.airline_partnerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    airline_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    iata_code TEXT,
    headquarters TEXT,
    partnership_type TEXT,
    status TEXT DEFAULT 'pending',
    commission_rate DECIMAL(5,2),
    airports TEXT[], -- Array of airport codes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ride_tracking table for real-time updates
CREATE TABLE public.ride_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE NOT NULL,
    driver_latitude DECIMAL(10, 8),
    driver_longitude DECIMAL(11, 8),
    passenger_latitude DECIMAL(10, 8),
    passenger_longitude DECIMAL(11, 8),
    status TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert Nigerian airports
INSERT INTO public.airports (code, name, city, country, latitude, longitude, timezone) VALUES
('LOS', 'Murtala Muhammed International Airport', 'Lagos', 'Nigeria', 6.5773, 3.3213, 'Africa/Lagos'),
('ABV', 'Nnamdi Azikiwe International Airport', 'Abuja', 'Nigeria', 9.0068, 7.2631, 'Africa/Lagos'),
('KAN', 'Mallam Aminu Kano International Airport', 'Kano', 'Nigeria', 12.0476, 8.5246, 'Africa/Lagos'),
('PHC', 'Port Harcourt International Airport', 'Port Harcourt', 'Nigeria', 5.0155, 6.9496, 'Africa/Lagos'),
('ILR', 'Ilorin International Airport', 'Ilorin', 'Nigeria', 8.4402, 4.4939, 'Africa/Lagos'),
('ENU', 'Akanu Ibiam International Airport', 'Enugu', 'Nigeria', 6.4742, 7.5619, 'Africa/Lagos');

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airline_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('super_admin', 'airline_admin'))
);

-- Drivers policies
CREATE POLICY "Drivers can view their own data" ON public.drivers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Drivers can update their own data" ON public.drivers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Drivers can insert their own data" ON public.drivers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Passengers can view available drivers" ON public.drivers FOR SELECT USING (status = 'active' AND is_available = true);
CREATE POLICY "Admins can manage all drivers" ON public.drivers FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('super_admin', 'airline_admin'))
);

-- Rides policies
CREATE POLICY "Users can view their own rides" ON public.rides FOR SELECT USING (
    auth.uid() = passenger_id OR auth.uid() = driver_id
);
CREATE POLICY "Passengers can create rides" ON public.rides FOR INSERT WITH CHECK (auth.uid() = passenger_id);
CREATE POLICY "Drivers can update assigned rides" ON public.rides FOR UPDATE USING (auth.uid() = driver_id);
CREATE POLICY "Admins can view all rides" ON public.rides FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('super_admin', 'airline_admin'))
);

-- Payments policies
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.rides WHERE id = ride_id AND (passenger_id = auth.uid() OR driver_id = auth.uid()))
);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Airline partnerships (admin only)
CREATE POLICY "Admins can manage airline partnerships" ON public.airline_partnerships FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('super_admin', 'airline_admin'))
);

-- Public access for airports
CREATE POLICY "Anyone can view airports" ON public.airports FOR SELECT USING (true);

-- Ride tracking policies
CREATE POLICY "Ride participants can view tracking" ON public.ride_tracking FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.rides WHERE id = ride_id AND (passenger_id = auth.uid() OR driver_id = auth.uid()))
);

-- Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON public.rides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_airline_partnerships_updated_at BEFORE UPDATE ON public.airline_partnerships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_rides_passenger_id ON public.rides(passenger_id);
CREATE INDEX idx_rides_driver_id ON public.rides(driver_id);
CREATE INDEX idx_rides_status ON public.rides(status);
CREATE INDEX idx_rides_airport_id ON public.rides(airport_id);
CREATE INDEX idx_drivers_airport_id ON public.drivers(airport_id);
CREATE INDEX idx_drivers_status ON public.drivers(status);
CREATE INDEX idx_drivers_available ON public.drivers(is_available);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_ride_tracking_ride_id ON public.ride_tracking(ride_id);

-- Enable realtime for ride tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_tracking;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;
ALTER TABLE public.ride_tracking REPLICA IDENTITY FULL;
ALTER TABLE public.rides REPLICA IDENTITY FULL;