-- Elite Lux Master Schema (Customer, Driver, Admin)
-- Please execute this entire script in your Supabase SQL Editor.

-- 1. Bookings Table (if not exists, or alter if exists)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    driver_id UUID, -- Nullable, filled when admin assigns
    pickup_address TEXT NOT NULL,
    dropoff_address TEXT NOT NULL,
    service_type TEXT NOT NULL,
    seats INTEGER NOT NULL,
    pickup_date DATE NOT NULL,
    pickup_time TIME NOT NULL,
    distance_miles NUMERIC,
    base_price NUMERIC,
    total_price NUMERIC,
    status TEXT DEFAULT 'awaiting_driver' 
    -- Status Enum: awaiting_driver | assigned | en_route | arrived | in_progress | completed | cancelled
);

-- 2. Driver Applications
CREATE TABLE IF NOT EXISTS public.driver_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    vehicle_make TEXT NOT NULL,
    vehicle_model TEXT NOT NULL,
    vehicle_year TEXT NOT NULL,
    license_plate TEXT NOT NULL,
    status TEXT DEFAULT 'pending' -- pending | approved | rejected
);

-- 3. Driver Profiles
CREATE TABLE IF NOT EXISTS public.driver_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    vehicle_make TEXT NOT NULL,
    vehicle_model TEXT NOT NULL,
    license_plate TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false, -- Set to true when fee paid/bypassed
    rating NUMERIC DEFAULT 5.0,
    total_trips INTEGER DEFAULT 0
);

-- 4. Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL
);

-- 5. Notifications (Existing table expansion if needed)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT false
);

-- Enable Realtime
alter publication supabase_realtime add table public.bookings;
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.driver_applications;

-- Note: We are allowing anon access for simplicity to rapidly prototype. 
-- In production, you would configure RLS policies strictly.
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
