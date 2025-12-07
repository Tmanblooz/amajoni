-- Create table for storing sign-in logs from identity providers
CREATE TABLE public.sign_in_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  iam_user_id UUID REFERENCES public.iam_users(id) ON DELETE SET NULL,
  external_user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  provider TEXT NOT NULL,
  sign_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address TEXT,
  location_city TEXT,
  location_country TEXT,
  location_coordinates JSONB,
  device_info JSONB,
  user_agent TEXT,
  is_suspicious BOOLEAN DEFAULT false,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_factors JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failure', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_sign_in_logs_org_time ON public.sign_in_logs(organization_id, sign_in_time DESC);
CREATE INDEX idx_sign_in_logs_suspicious ON public.sign_in_logs(organization_id, is_suspicious) WHERE is_suspicious = true;
CREATE INDEX idx_sign_in_logs_email ON public.sign_in_logs(organization_id, email);

-- Enable RLS
ALTER TABLE public.sign_in_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view organization sign-in logs"
  ON public.sign_in_logs FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "System can insert sign-in logs"
  ON public.sign_in_logs FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

-- Create table for identity alerts
CREATE TABLE public.identity_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  sign_in_log_id UUID REFERENCES public.sign_in_logs(id) ON DELETE CASCADE,
  iam_user_id UUID REFERENCES public.iam_users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  recommended_action TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for alerts
CREATE INDEX idx_identity_alerts_org_status ON public.identity_alerts(organization_id, status);

-- Enable RLS
ALTER TABLE public.identity_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for alerts
CREATE POLICY "Users can view organization alerts"
  ON public.identity_alerts FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can update organization alerts"
  ON public.identity_alerts FOR UPDATE
  USING (organization_id = get_user_organization_id(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_identity_alerts_updated_at
  BEFORE UPDATE ON public.identity_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.identity_alerts;