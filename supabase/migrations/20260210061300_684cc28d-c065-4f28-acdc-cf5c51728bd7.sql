
-- Add new columns to user_profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS district text;

-- Create product_enquiries table for lead capture
CREATE TABLE public.product_enquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  pincode TEXT,
  city TEXT,
  district TEXT,
  state TEXT,
  language TEXT,
  selected_crops TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_enquiries ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can insert enquiries" ON public.product_enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all enquiries" ON public.product_enquiries FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view their own enquiries" ON public.product_enquiries FOR SELECT USING (auth.uid() = user_id);
