-- Make phone nullable
ALTER TABLE public.user_profiles ALTER COLUMN phone DROP NOT NULL;

-- Add email column
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email text;
