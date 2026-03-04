
-- Add translations JSONB column to store multi-language content
ALTER TABLE public.notifications
ADD COLUMN translations jsonb DEFAULT '{}'::jsonb;

-- Structure: { "mr": { "title": "...", "message": "..." }, "hi": { "title": "...", "message": "..." }, "en": { "title": "...", "message": "..." } }
