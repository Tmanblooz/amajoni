-- Create storage bucket for policy documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('policy-documents', 'policy-documents', false);

-- Storage RLS policies for policy documents
CREATE POLICY "Users can view organization policy documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'policy-documents' AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can upload organization policy documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'policy-documents' AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can update organization policy documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'policy-documents' AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can delete organization policy documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'policy-documents' AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text FROM public.profiles WHERE id = auth.uid()
  )
);

-- IAM users table (from Microsoft/Google)
CREATE TABLE public.iam_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  provider TEXT NOT NULL CHECK (provider IN ('microsoft', 'google', 'jumpcloud')),
  mfa_enabled BOOLEAN NOT NULL DEFAULT false,
  last_sign_in TIMESTAMP WITH TIME ZONE,
  account_enabled BOOLEAN NOT NULL DEFAULT true,
  last_synced TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, external_id, provider)
);

ALTER TABLE public.iam_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organization IAM users"
ON public.iam_users FOR SELECT
USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "System can manage IAM users"
ON public.iam_users FOR ALL
USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Device inventory table
CREATE TABLE public.device_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT,
  os TEXT,
  os_version TEXT,
  provider TEXT NOT NULL CHECK (provider IN ('microsoft', 'google', 'jumpcloud')),
  compliance_status TEXT NOT NULL DEFAULT 'unknown' CHECK (compliance_status IN ('compliant', 'non_compliant', 'unknown')),
  last_check TIMESTAMP WITH TIME ZONE,
  last_synced TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, external_id, provider)
);

ALTER TABLE public.device_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organization devices"
ON public.device_inventory FOR SELECT
USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "System can manage devices"
ON public.device_inventory FOR ALL
USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Policy checklist table
CREATE TABLE public.policy_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  policy_name TEXT NOT NULL,
  policy_description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('yes', 'no', 'pending', 'uploaded')),
  document_url TEXT,
  attested_by UUID REFERENCES auth.users(id),
  attested_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, policy_name)
);

ALTER TABLE public.policy_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organization policies"
ON public.policy_checklist FOR SELECT
USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Users can manage organization policies"
ON public.policy_checklist FOR ALL
USING (organization_id = public.get_user_organization_id(auth.uid()));

-- Training content table
CREATE TABLE public.training_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  quiz_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  passing_score INTEGER NOT NULL DEFAULT 70,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.training_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organization training"
ON public.training_content FOR SELECT
USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Admins can manage training"
ON public.training_content FOR ALL
USING (
  organization_id = public.get_user_organization_id(auth.uid()) AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Training completion tracking
CREATE TABLE public.training_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_id UUID NOT NULL REFERENCES public.training_content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(training_id, user_id)
);

ALTER TABLE public.training_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completions"
ON public.training_completions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own completions"
ON public.training_completions FOR INSERT
WITH CHECK (user_id = auth.uid() AND organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Admins can view all organization completions"
ON public.training_completions FOR SELECT
USING (
  organization_id = public.get_user_organization_id(auth.uid()) AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- API connection configurations
CREATE TABLE public.api_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('microsoft', 'google', 'jumpcloud')),
  enabled BOOLEAN NOT NULL DEFAULT false,
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'success', 'error')),
  error_message TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, provider)
);

ALTER TABLE public.api_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organization connections"
ON public.api_connections FOR SELECT
USING (organization_id = public.get_user_organization_id(auth.uid()));

CREATE POLICY "Admins can manage connections"
ON public.api_connections FOR ALL
USING (
  organization_id = public.get_user_organization_id(auth.uid()) AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Add triggers for updated_at
CREATE TRIGGER update_iam_users_updated_at
BEFORE UPDATE ON public.iam_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_device_inventory_updated_at
BEFORE UPDATE ON public.device_inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_policy_checklist_updated_at
BEFORE UPDATE ON public.policy_checklist
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_content_updated_at
BEFORE UPDATE ON public.training_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_connections_updated_at
BEFORE UPDATE ON public.api_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Initialize default policy checklist items for new organizations
CREATE OR REPLACE FUNCTION public.initialize_policy_checklist()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.policy_checklist (organization_id, policy_name, policy_description)
  VALUES
    (NEW.id, 'PAIA Manual', 'Do you have a PAIA (Promotion of Access to Information Act) manual?'),
    (NEW.id, 'Privacy Policy', 'Do you have a documented privacy policy?'),
    (NEW.id, 'Data Breach Response Plan', 'Do you have a data breach response plan?'),
    (NEW.id, 'Information Security Policy', 'Do you have an information security policy?'),
    (NEW.id, 'Access Control Policy', 'Do you have an access control policy?'),
    (NEW.id, 'Data Retention Policy', 'Do you have a data retention and disposal policy?'),
    (NEW.id, 'Third-Party Agreement', 'Do you have data processing agreements with third parties?'),
    (NEW.id, 'Employee Training Records', 'Do you maintain records of employee privacy training?');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER initialize_org_policies
AFTER INSERT ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.initialize_policy_checklist();