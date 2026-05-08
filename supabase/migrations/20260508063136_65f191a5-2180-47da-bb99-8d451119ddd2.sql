-- Delete older duplicates, keep most recent profile per phone
DELETE FROM public.user_profiles a
USING public.user_profiles b
WHERE a.phone IS NOT NULL
  AND a.phone = b.phone
  AND a.created_at < b.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_phone_unique_idx 
  ON public.user_profiles (phone) 
  WHERE phone IS NOT NULL;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'app_settings_key_unique') THEN
    ALTER TABLE public.app_settings ADD CONSTRAINT app_settings_key_unique UNIQUE (key);
  END IF;
END $$;