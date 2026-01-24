-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for role-based access control
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy for user_roles - admins can view all, users can view their own
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'fertilizers',
    crops TEXT[] DEFAULT '{}',
    dosage TEXT,
    mrp DECIMAL(10,2) NOT NULL DEFAULT 0,
    image_url TEXT,
    icon TEXT DEFAULT 'leaf',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products RLS policies - public read, admin write
CREATE POLICY "Anyone can view products"
ON public.products FOR SELECT
USING (true);

CREATE POLICY "Admins can insert products"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
ON public.products FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
ON public.products FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Promotions table
CREATE TABLE public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    discount TEXT,
    image_url TEXT,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    valid_until TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on promotions
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Promotions RLS policies - public read, admin write
CREATE POLICY "Anyone can view promotions"
ON public.promotions FOR SELECT
USING (true);

CREATE POLICY "Admins can insert promotions"
ON public.promotions FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update promotions"
ON public.promotions FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete promotions"
ON public.promotions FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Videos table
CREATE TABLE public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    youtube_url TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    category TEXT DEFAULT 'general',
    crop TEXT,
    duration TEXT,
    views INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on videos
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Videos RLS policies - public read, admin write
CREATE POLICY "Anyone can view videos"
ON public.videos FOR SELECT
USING (true);

CREATE POLICY "Admins can insert videos"
ON public.videos FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update videos"
ON public.videos FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete videos"
ON public.videos FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    target_type TEXT DEFAULT 'all',
    target_value TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications RLS policies - public read, admin write
CREATE POLICY "Anyone can view notifications"
ON public.notifications FOR SELECT
USING (true);

CREATE POLICY "Admins can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete notifications"
ON public.notifications FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- News table for agri news
CREATE TABLE public.news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    source TEXT,
    category TEXT DEFAULT 'general',
    image_url TEXT,
    external_url TEXT,
    status TEXT NOT NULL DEFAULT 'published',
    published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on news
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- News RLS policies - public read, admin write
CREATE POLICY "Anyone can view news"
ON public.news FOR SELECT
USING (true);

CREATE POLICY "Admins can insert news"
ON public.news FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update news"
ON public.news FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete news"
ON public.news FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Dealers table
CREATE TABLE public.dealers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    city TEXT DEFAULT 'Sangli',
    phone TEXT,
    email TEXT,
    lat DECIMAL(10,8),
    lng DECIMAL(11,8),
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on dealers
ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;

-- Dealers RLS policies - public read, admin write
CREATE POLICY "Anyone can view dealers"
ON public.dealers FOR SELECT
USING (true);

CREATE POLICY "Admins can insert dealers"
ON public.dealers FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update dealers"
ON public.dealers FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete dealers"
ON public.dealers FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at
    BEFORE UPDATE ON public.promotions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON public.videos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_updated_at
    BEFORE UPDATE ON public.news
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dealers_updated_at
    BEFORE UPDATE ON public.dealers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample products
INSERT INTO public.products (name, tagline, category, crops, dosage, mrp, icon, status) VALUES
('THUNDER', 'Grape bunch uniform growth ⚡', 'bio-stimulants', ARRAY['Grapes', 'Pomegranate'], '2-3ml per liter', 850, 'zap', 'active'),
('TANGENT', 'Bloom booster for higher yield 🍇', 'bio-stimulants', ARRAY['Grapes', 'Cotton'], '1.5-2ml per liter', 720, 'flower', 'active'),
('MARINUS', 'Root development enhancer 🌱', 'fertilizers', ARRAY['All Crops'], '2ml per liter', 650, 'droplet', 'active'),
('GREENMAX', 'Complete nutrition solution', 'fertilizers', ARRAY['Vegetables', 'Fruits'], '3ml per liter', 550, 'leaf', 'active'),
('SHIELD PRO', 'Advanced plant protection', 'plant-protection', ARRAY['Grapes', 'Chickpea'], '1ml per liter', 980, 'shield', 'active');

-- Insert sample promotions
INSERT INTO public.promotions (title, description, discount, valid_from, valid_until, status) VALUES
('THUNDER 20% OFF', 'Special discount on THUNDER - Grape growth enhancer', '20%', now(), now() + interval '30 days', 'active'),
('Monsoon Sale', 'Flat 15% off on all fertilizers', '15%', now(), now() + interval '45 days', 'active'),
('New User Offer', 'Get 10% off on your first purchase', '10%', now(), now() + interval '60 days', 'active');

-- Insert sample videos
INSERT INTO public.videos (title, youtube_url, category, crop, duration, views, status) VALUES
('Grape Farming Best Practices', 'https://youtube.com/watch?v=example1', 'tutorial', 'Grapes', '12:45', 1250, 'active'),
('THUNDER Application Guide', 'https://youtube.com/watch?v=example2', 'product-demo', 'Grapes', '08:30', 890, 'active'),
('Chickpea Crop Management', 'https://youtube.com/watch?v=example3', 'tutorial', 'Chickpea', '15:20', 650, 'active');

-- Insert sample dealers
INSERT INTO public.dealers (name, address, city, phone, lat, lng, status) VALUES
('Krushi Seva Kendra', 'Main Market, Sangli', 'Sangli', '+91 9876543210', 16.8524, 74.5815, 'active'),
('Agro Solutions Miraj', 'Station Road, Miraj', 'Miraj', '+91 9876543211', 16.8200, 74.6500, 'active'),
('Green Agri Store', 'Kupwad Road, Sangli', 'Sangli', '+91 9876543212', 16.8600, 74.5700, 'active');