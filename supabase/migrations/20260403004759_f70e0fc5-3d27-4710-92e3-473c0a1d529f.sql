
-- ============================================
-- 1. ENUM TYPES
-- ============================================
CREATE TYPE public.app_role AS ENUM ('admin', 'professor', 'student', 'community');
CREATE TYPE public.report_type AS ENUM ('floating_trash', 'dead_fish', 'pollution', 'other');
CREATE TYPE public.report_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.weather_condition AS ENUM ('sunny', 'cloudy', 'rainy', 'stormy', 'foggy');

-- ============================================
-- 2. BASE TABLES
-- ============================================

-- User roles table (separate from profiles per security best practices)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'community',
  UNIQUE (user_id, role)
);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  institution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Collection points (scientific monitoring locations)
CREATE TABLE public.collection_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scientific records (field data)
CREATE TABLE public.scientific_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_point_id UUID REFERENCES public.collection_points(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  turbidity DECIMAL(6,2),
  ph DECIMAL(4,2),
  water_temp DECIMAL(5,2),
  trash_count INTEGER DEFAULT 0,
  weather weather_condition,
  wind_speed DECIMAL(5,2),
  wind_direction TEXT,
  water_appearance TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  notes TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Community reports
CREATE TABLE public.community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  type report_type NOT NULL,
  description TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  photo_url TEXT,
  status report_status NOT NULL DEFAULT 'pending',
  reporter_name TEXT NOT NULL DEFAULT 'Anônimo',
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- 3. ENABLE RLS
-- ============================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scientific_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. HELPER FUNCTIONS (SECURITY DEFINER)
-- ============================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Auto-create profile + community role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'community');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 5. RLS POLICIES
-- ============================================

-- user_roles: only admins can manage, users can read own
CREATE POLICY "Users can read own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- profiles: users read own, admins read all
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- collection_points: all authenticated read, admin CRUD
CREATE POLICY "Anyone can read collection points"
  ON public.collection_points FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage collection points"
  ON public.collection_points FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- scientific_records: professor/student/admin can read and create, admin can update/delete
CREATE POLICY "Authorized users can read scientific records"
  ON public.scientific_records FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'professor') OR 
    public.has_role(auth.uid(), 'student')
  );

CREATE POLICY "Authorized users can create scientific records"
  ON public.scientific_records FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND (
      public.has_role(auth.uid(), 'admin') OR 
      public.has_role(auth.uid(), 'professor') OR 
      public.has_role(auth.uid(), 'student')
    )
  );

CREATE POLICY "Admins can update scientific records"
  ON public.scientific_records FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete scientific records"
  ON public.scientific_records FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- community_reports: anyone sees approved, reporters see own, admin sees all
CREATE POLICY "Anyone can read approved reports"
  ON public.community_reports FOR SELECT
  TO authenticated
  USING (
    status = 'approved' OR 
    reporter_id = auth.uid() OR 
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Authenticated users can create reports"
  ON public.community_reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Admins can update reports"
  ON public.community_reports FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete reports"
  ON public.community_reports FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 6. STORAGE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-photos', 'community-photos', false);

CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'community-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'community-photos' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Admins can delete photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'community-photos' AND public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 7. INDEXES
-- ============================================
CREATE INDEX idx_scientific_records_point ON public.scientific_records(collection_point_id);
CREATE INDEX idx_scientific_records_user ON public.scientific_records(user_id);
CREATE INDEX idx_scientific_records_date ON public.scientific_records(recorded_at);
CREATE INDEX idx_community_reports_status ON public.community_reports(status);
CREATE INDEX idx_community_reports_reporter ON public.community_reports(reporter_id);
CREATE INDEX idx_community_reports_type ON public.community_reports(type);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
