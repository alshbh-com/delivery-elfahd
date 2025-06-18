
-- Create a table for offers/promotions
CREATE TABLE public.offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  discount_percentage INTEGER,
  original_price DECIMAL(10,2),
  offer_price DECIMAL(10,2),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to the offers table
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Create policy that allows everyone to SELECT active offers (for public viewing)
CREATE POLICY "Anyone can view active offers" 
  ON public.offers 
  FOR SELECT 
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Create policy that allows full access for admin operations (we'll handle admin auth in the app)
CREATE POLICY "Admin can manage all offers" 
  ON public.offers 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Create an index for better performance on active offers
CREATE INDEX idx_offers_active_expires ON public.offers (is_active, expires_at) WHERE is_active = true;
