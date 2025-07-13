-- Add missing enum values to user_role if they don't exist
DO $$ 
BEGIN
    -- Check if garage_partner exists, if not add it as an alias for driver role handling
    -- We'll handle garage partners through the driver role with separate profile table
    
    -- Update user_role enum to include garage_partner
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'garage_partner';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'airline_partner';
EXCEPTION 
    WHEN duplicate_object THEN 
        NULL; -- Ignore if values already exist
END $$;