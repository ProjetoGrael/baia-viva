---
name: Database Schema
description: Supabase tables, enums, RLS policies, and triggers for BaíaViva
type: feature
---
## Tables
- user_roles (user_id, role enum)
- profiles (user_id, full_name, email, institution) — auto-created via trigger
- collection_points (name, lat, lng, description)
- scientific_records (collection_point_id, user_id, turbidity, ph, water_temp, trash_count, weather, wind, lat, lng, notes)
- community_reports (reporter_id, type, description, lat, lng, photo_url, status, reporter_name, moderated_by)

## Enums
- app_role: admin, professor, student, community
- report_type: floating_trash, dead_fish, pollution, other
- report_status: pending, approved, rejected
- weather_condition: sunny, cloudy, rainy, stormy, foggy

## Key RLS Rules
- Roles in separate table, checked via has_role() SECURITY DEFINER function
- New users auto-assigned 'community' role via handle_new_user trigger
- scientific_records: only admin/professor/student can read/create
- community_reports: approved visible to all, own visible to reporter, admin sees all

## Storage
- Bucket: community-photos (private), folder per user_id
