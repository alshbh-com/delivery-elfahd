
-- Create storage bucket for offer images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('offer-images', 'offer-images', true);

-- Create policy to allow anyone to view images
CREATE POLICY "Anyone can view offer images" ON storage.objects
  FOR SELECT USING (bucket_id = 'offer-images');

-- Create policy to allow uploads (for admin functionality)
CREATE POLICY "Anyone can upload offer images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'offer-images');

-- Create policy to allow updates
CREATE POLICY "Anyone can update offer images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'offer-images');

-- Create policy to allow deletes
CREATE POLICY "Anyone can delete offer images" ON storage.objects
  FOR DELETE USING (bucket_id = 'offer-images');
