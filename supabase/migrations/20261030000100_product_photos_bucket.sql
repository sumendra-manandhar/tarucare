-- Public bucket for product photos. Anyone can view a photo by its URL; only the server
-- (service role) can upload or delete, because there are no storage policies for other roles.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-photos', 'product-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
