-- Add organizations table for multi-tenant support
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Add organization_id to profiles
ALTER TABLE public.profiles ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to all user-specific tables
ALTER TABLE public.vendors ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.compliance_documents ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.action_items ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.internal_posture_pillars ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.device_health ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Create helper function to get user's organization
CREATE OR REPLACE FUNCTION public.get_user_organization_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = _user_id
$$;

-- Update RLS policies for organizations
CREATE POLICY "Users can view own organization"
ON public.organizations FOR SELECT
USING (id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can update own organization"
ON public.organizations FOR UPDATE
USING (id = public.get_user_organization_id(auth.uid()));

-- Drop old RLS policies and create new organization-based ones
DROP POLICY IF EXISTS "Users can view own vendors" ON public.vendors;
DROP POLICY IF EXISTS "Users can create own vendors" ON public.vendors;
DROP POLICY IF EXISTS "Users can update own vendors" ON public.vendors;
DROP POLICY IF EXISTS "Users can delete own vendors" ON public.vendors;

CREATE POLICY "Users can view organization vendors"
ON public.vendors FOR SELECT
USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can create organization vendors"
ON public.vendors FOR INSERT
WITH CHECK (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can update organization vendors"
ON public.vendors FOR UPDATE
USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can delete organization vendors"
ON public.vendors FOR DELETE
USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Update compliance_documents policies
DROP POLICY IF EXISTS "Users can view own documents" ON public.compliance_documents;
DROP POLICY IF EXISTS "Users can create own documents" ON public.compliance_documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.compliance_documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.compliance_documents;

CREATE POLICY "Users can view organization documents"
ON public.compliance_documents FOR SELECT
USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can create organization documents"
ON public.compliance_documents FOR INSERT
WITH CHECK (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can update organization documents"
ON public.compliance_documents FOR UPDATE
USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can delete organization documents"
ON public.compliance_documents FOR DELETE
USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Update action_items policies
DROP POLICY IF EXISTS "Users can view own actions" ON public.action_items;
DROP POLICY IF EXISTS "Users can create own actions" ON public.action_items;
DROP POLICY IF EXISTS "Users can update own actions" ON public.action_items;
DROP POLICY IF EXISTS "Users can delete own actions" ON public.action_items;

CREATE POLICY "Users can view organization actions"
ON public.action_items FOR SELECT
USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can create organization actions"
ON public.action_items FOR INSERT
WITH CHECK (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can update organization actions"
ON public.action_items FOR UPDATE
USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can delete organization actions"
ON public.action_items FOR DELETE
USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Update internal_posture_pillars policies
DROP POLICY IF EXISTS "Users can view own pillars" ON public.internal_posture_pillars;
DROP POLICY IF EXISTS "Users can create own pillars" ON public.internal_posture_pillars;
DROP POLICY IF EXISTS "Users can update own pillars" ON public.internal_posture_pillars;
DROP POLICY IF EXISTS "Users can delete own pillars" ON public.internal_posture_pillars;

CREATE POLICY "Users can view organization pillars"
ON public.internal_posture_pillars FOR SELECT
USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can create organization pillars"
ON public.internal_posture_pillars FOR INSERT
WITH CHECK (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can update organization pillars"
ON public.internal_posture_pillars FOR UPDATE
USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can delete organization pillars"
ON public.internal_posture_pillars FOR DELETE
USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Update device_health policies
DROP POLICY IF EXISTS "Users can view own devices" ON public.device_health;
DROP POLICY IF EXISTS "Users can create own devices" ON public.device_health;
DROP POLICY IF EXISTS "Users can update own devices" ON public.device_health;
DROP POLICY IF EXISTS "Users can delete own devices" ON public.device_health;

CREATE POLICY "Users can view organization devices"
ON public.device_health FOR SELECT
USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can create organization devices"
ON public.device_health FOR INSERT
WITH CHECK (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can update organization devices"
ON public.device_health FOR UPDATE
USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can delete organization devices"
ON public.device_health FOR DELETE
USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Update handle_new_user to create organization for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Create new organization for the user
  INSERT INTO public.organizations (name)
  VALUES (COALESCE(NEW.raw_user_meta_data->>'company_name', NEW.email || '''s Organization'))
  RETURNING id INTO new_org_id;
  
  -- Create profile with organization
  INSERT INTO public.profiles (id, email, full_name, organization_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    new_org_id
  );
  
  RETURN NEW;
END;
$$;

-- Add trigger for updated_at on organizations
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();