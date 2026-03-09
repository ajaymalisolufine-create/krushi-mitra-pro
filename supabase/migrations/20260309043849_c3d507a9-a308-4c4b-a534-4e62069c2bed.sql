
-- Add translations JSONB column to products, news, promotions
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS external_url text;

-- Add video_url to banners for video banners
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS video_url text;

-- Create app_settings table for logo and other settings
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view app settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admins can insert app settings" ON public.app_settings FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update app settings" ON public.app_settings FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete app settings" ON public.app_settings FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));
