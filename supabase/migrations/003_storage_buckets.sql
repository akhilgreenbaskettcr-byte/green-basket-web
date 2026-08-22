-- ============================================================
-- GREEN BASKET — Storage Buckets & Policies
-- ============================================================

-- Create storage buckets if they don't exist
insert into storage.buckets (id, name, public)
values 
  ('site-assets', 'site-assets', true),
  ('product-images', 'product-images', true),
  ('category-images', 'category-images', true)
on conflict (id) do update set public = true;

-- Public can view images in site-assets, product-images, category-images
create policy "Public Access site-assets"
  on storage.objects for select
  using ( bucket_id in ('site-assets', 'product-images', 'category-images') );

-- Authenticated admins can upload images
create policy "Admin Upload Images"
  on storage.objects for insert
  with check (
    bucket_id in ('site-assets', 'product-images', 'category-images')
    and (auth.role() = 'authenticated')
  );

-- Authenticated admins can update images
create policy "Admin Update Images"
  on storage.objects for update
  using (
    bucket_id in ('site-assets', 'product-images', 'category-images')
    and (auth.role() = 'authenticated')
  );

-- Authenticated admins can delete images
create policy "Admin Delete Images"
  on storage.objects for delete
  using (
    bucket_id in ('site-assets', 'product-images', 'category-images')
    and (auth.role() = 'authenticated')
  );
