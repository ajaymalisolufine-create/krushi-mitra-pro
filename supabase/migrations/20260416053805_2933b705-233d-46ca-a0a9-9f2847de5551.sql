
CREATE TABLE public.farmer_activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  phone text,
  email text,
  activity_type text NOT NULL,
  screen_name text,
  activity_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.farmer_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert activity logs"
ON public.farmer_activity_logs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own activity"
ON public.farmer_activity_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity"
ON public.farmer_activity_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_farmer_activity_created_at ON public.farmer_activity_logs(created_at DESC);
CREATE INDEX idx_farmer_activity_user_id ON public.farmer_activity_logs(user_id);
CREATE INDEX idx_farmer_activity_type ON public.farmer_activity_logs(activity_type);
