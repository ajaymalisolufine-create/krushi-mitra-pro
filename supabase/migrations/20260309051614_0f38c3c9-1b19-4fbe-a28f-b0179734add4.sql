
-- Product import temp table
CREATE TABLE public.product_import_temp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL,
  product_name text NOT NULL,
  mrp numeric DEFAULT 0,
  tagline text,
  description_en text,
  description_mr text,
  description_hi text,
  benefits text,
  category text DEFAULT 'fertilizers',
  dosage text,
  recommended_crops text,
  product_image text,
  available_states text,
  status text DEFAULT 'active',
  trending_product boolean DEFAULT false,
  best_seller boolean DEFAULT false,
  import_status text DEFAULT 'pending',
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Import logs table
CREATE TABLE public.import_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  total_records integer DEFAULT 0,
  successful_records integer DEFAULT 0,
  failed_records integer DEFAULT 0,
  uploaded_by uuid REFERENCES auth.users(id),
  status text DEFAULT 'processing',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_import_temp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;

-- RLS: Only admins can access
CREATE POLICY "Admins can manage import temp" ON public.product_import_temp FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage import logs" ON public.import_logs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_products_name ON public.products (name);
CREATE INDEX idx_products_category ON public.products (category);
CREATE INDEX idx_import_temp_batch ON public.product_import_temp (batch_id);
CREATE INDEX idx_import_temp_status ON public.product_import_temp (import_status);
