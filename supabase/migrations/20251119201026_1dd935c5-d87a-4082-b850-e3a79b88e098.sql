-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create vendors table
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('critical', 'warning', 'healthy', 'pending')),
  issues_count INTEGER NOT NULL DEFAULT 0,
  last_scan TIMESTAMPTZ,
  contact_email TEXT,
  contact_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create compliance_documents table
CREATE TABLE public.compliance_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'missing' CHECK (status IN ('complete', 'partial', 'missing')),
  required BOOLEAN NOT NULL DEFAULT false,
  last_updated TIMESTAMPTZ,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.compliance_documents ENABLE ROW LEVEL SECURITY;

-- Create action_items table
CREATE TABLE public.action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  impact INTEGER NOT NULL CHECK (impact >= 1 AND impact <= 10),
  effort INTEGER NOT NULL CHECK (effort >= 1 AND effort <= 10),
  priority_score DECIMAL GENERATED ALWAYS AS ((impact::DECIMAL * 3) / effort) STORED,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  category TEXT NOT NULL CHECK (category IN ('internal', 'vendor', 'compliance')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;

-- Create internal_posture_pillars table
CREATE TABLE public.internal_posture_pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pillar_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  status TEXT NOT NULL DEFAULT 'critical' CHECK (status IN ('critical', 'warning', 'healthy')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, pillar_name)
);

ALTER TABLE public.internal_posture_pillars ENABLE ROW LEVEL SECURITY;

-- Create device_health table
CREATE TABLE public.device_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('laptop', 'desktop', 'mobile', 'server')),
  os TEXT,
  last_check TIMESTAMPTZ,
  compliance_status TEXT NOT NULL DEFAULT 'unknown' CHECK (compliance_status IN ('compliant', 'non_compliant', 'unknown')),
  mfa_enabled BOOLEAN DEFAULT false,
  antivirus_active BOOLEAN DEFAULT false,
  os_updated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.device_health ENABLE ROW LEVEL SECURITY;

-- Create vendor_questionnaires table
CREATE TABLE public.vendor_questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  questionnaire_data JSONB NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.vendor_questionnaires ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles (admins can manage, users can view own)
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for vendors
CREATE POLICY "Users can view own vendors"
  ON public.vendors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own vendors"
  ON public.vendors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vendors"
  ON public.vendors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vendors"
  ON public.vendors FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for compliance_documents
CREATE POLICY "Users can view own documents"
  ON public.compliance_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own documents"
  ON public.compliance_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON public.compliance_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON public.compliance_documents FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for action_items
CREATE POLICY "Users can view own actions"
  ON public.action_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own actions"
  ON public.action_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own actions"
  ON public.action_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own actions"
  ON public.action_items FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for internal_posture_pillars
CREATE POLICY "Users can view own pillars"
  ON public.internal_posture_pillars FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own pillars"
  ON public.internal_posture_pillars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pillars"
  ON public.internal_posture_pillars FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pillars"
  ON public.internal_posture_pillars FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for device_health
CREATE POLICY "Users can view own devices"
  ON public.device_health FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own devices"
  ON public.device_health FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own devices"
  ON public.device_health FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own devices"
  ON public.device_health FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for vendor_questionnaires (through vendor ownership)
CREATE POLICY "Users can view questionnaires for own vendors"
  ON public.vendor_questionnaires FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = vendor_questionnaires.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create questionnaires for own vendors"
  ON public.vendor_questionnaires FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = vendor_questionnaires.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update questionnaires for own vendors"
  ON public.vendor_questionnaires FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.vendors
      WHERE vendors.id = vendor_questionnaires.vendor_id
      AND vendors.user_id = auth.uid()
    )
  );

-- Trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_documents_updated_at
  BEFORE UPDATE ON public.compliance_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_action_items_updated_at
  BEFORE UPDATE ON public.action_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_internal_posture_pillars_updated_at
  BEFORE UPDATE ON public.internal_posture_pillars
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_device_health_updated_at
  BEFORE UPDATE ON public.device_health
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_questionnaires_updated_at
  BEFORE UPDATE ON public.vendor_questionnaires
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();