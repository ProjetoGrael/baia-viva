
-- 1. Remove duplicate INSERT storage policy
DROP POLICY IF EXISTS "Users can upload own photos" ON storage.objects;

-- 2. Remove public (unauthenticated) read access
DROP POLICY IF EXISTS "Public read access to community photos" ON storage.objects;

-- 3. Add authenticated-only read access for community photos
CREATE POLICY "Authenticated users can view community photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'community-photos');

-- 4. Create a secure view that hides reporter_id for non-admin users
CREATE OR REPLACE VIEW public.public_community_reports AS
SELECT
  id, type, description, latitude, longitude, photo_url,
  reporter_name, status, created_at, moderated_at
FROM public.community_reports
WHERE status = 'approved';
