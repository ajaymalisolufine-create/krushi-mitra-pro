-- 1) user_profiles: track activity and install
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS first_install_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_user_profiles_last_active_at ON public.user_profiles(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_first_install_at ON public.user_profiles(first_install_at DESC);

-- 2) product_enquiries: extend for unified lead capture
ALTER TABLE public.product_enquiries
  ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'product',
  ADD COLUMN IF NOT EXISTS source_id UUID,
  ADD COLUMN IF NOT EXISTS source_title TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS village TEXT;

CREATE INDEX IF NOT EXISTS idx_enq_created_at ON public.product_enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enq_status ON public.product_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enq_source_type ON public.product_enquiries(source_type);

-- 3) Allow admins to update enquiries (status, notes)
DROP POLICY IF EXISTS "Admins can update enquiries" ON public.product_enquiries;
CREATE POLICY "Admins can update enquiries"
  ON public.product_enquiries
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 4) Index for activity logs dashboards
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON public.farmer_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON public.farmer_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_type ON public.farmer_activity_logs(activity_type);