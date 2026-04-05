
DROP VIEW IF EXISTS public.public_community_reports;
CREATE VIEW public.public_community_reports
WITH (security_invoker = true) AS
SELECT
  id, type, description, latitude, longitude, photo_url,
  reporter_name, status, created_at, moderated_at
FROM public.community_reports
WHERE status = 'approved';
