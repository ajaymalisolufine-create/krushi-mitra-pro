-- Add pincode column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS pincode text;

-- Add pincode column to dealers table for area coverage
ALTER TABLE public.dealers 
ADD COLUMN IF NOT EXISTS pincode text;

-- Add serving_pincodes array column for dealers to cover multiple areas
ALTER TABLE public.dealers 
ADD COLUMN IF NOT EXISTS serving_pincodes text[] DEFAULT '{}'::text[];

-- Add index for faster pincode lookups on dealers
CREATE INDEX IF NOT EXISTS idx_dealers_pincode ON public.dealers (pincode);
CREATE INDEX IF NOT EXISTS idx_dealers_serving_pincodes ON public.dealers USING GIN (serving_pincodes);

-- Add index for faster pincode lookups on user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_pincode ON public.user_profiles (pincode);