-- Add is_trending and is_best_seller columns to products table
ALTER TABLE public.products 
ADD COLUMN is_trending boolean NOT NULL DEFAULT false,
ADD COLUMN is_best_seller boolean NOT NULL DEFAULT false;

-- Create indexes for efficient querying
CREATE INDEX idx_products_trending ON public.products(is_trending) WHERE is_trending = true;
CREATE INDEX idx_products_best_seller ON public.products(is_best_seller) WHERE is_best_seller = true;