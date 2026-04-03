
ALTER TABLE public.otp_codes ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.otp_codes ADD COLUMN IF NOT EXISTS email text;
