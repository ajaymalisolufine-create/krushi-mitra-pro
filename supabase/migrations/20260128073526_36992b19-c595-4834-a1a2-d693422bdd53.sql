-- Add benefits column for product descriptions
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS benefits text[] DEFAULT '{}';

-- Add available_states column for state-based filtering
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS available_states text[] DEFAULT '{}';

-- Add state column to user_profiles for customer location
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS state text DEFAULT 'Maharashtra';