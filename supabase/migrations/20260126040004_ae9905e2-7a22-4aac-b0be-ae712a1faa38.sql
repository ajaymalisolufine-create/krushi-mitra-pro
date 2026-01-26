-- Create user_profiles table for storing farmer data
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'mr',
  selected_crop TEXT,
  city TEXT DEFAULT 'Sangli',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_profiles
CREATE POLICY "Users can view their own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.user_profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create lead_interactions table for tracking user interactions
CREATE TABLE public.lead_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  phone TEXT,
  language TEXT,
  selected_crop TEXT,
  screen_name TEXT NOT NULL,
  interaction_type TEXT NOT NULL,
  interaction_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;

-- Allow insert from anyone (for anonymous tracking before login)
CREATE POLICY "Anyone can insert interactions"
ON public.lead_interactions FOR INSERT
WITH CHECK (true);

-- Users can view their own interactions
CREATE POLICY "Users can view their own interactions"
ON public.lead_interactions FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all interactions
CREATE POLICY "Admins can view all interactions"
ON public.lead_interactions FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();