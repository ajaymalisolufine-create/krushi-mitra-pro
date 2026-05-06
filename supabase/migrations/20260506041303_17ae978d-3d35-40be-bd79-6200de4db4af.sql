
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS available_states text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS available_states text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS available_states text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS available_states text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS available_states text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_news_available_states ON public.news USING GIN (available_states);
CREATE INDEX IF NOT EXISTS idx_banners_available_states ON public.banners USING GIN (available_states);
CREATE INDEX IF NOT EXISTS idx_promotions_available_states ON public.promotions USING GIN (available_states);
CREATE INDEX IF NOT EXISTS idx_videos_available_states ON public.videos USING GIN (available_states);
CREATE INDEX IF NOT EXISTS idx_notifications_available_states ON public.notifications USING GIN (available_states);
