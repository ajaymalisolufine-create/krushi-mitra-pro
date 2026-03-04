
-- Add new columns to notifications table for enhanced notification system
ALTER TABLE public.notifications 
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'update',
  ADD COLUMN IF NOT EXISTS redirect_target text DEFAULT null,
  ADD COLUMN IF NOT EXISTS image_url text DEFAULT null,
  ADD COLUMN IF NOT EXISTS popup_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS push_enabled boolean DEFAULT false;
