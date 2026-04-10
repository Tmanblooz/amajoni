-- Fix 1: Restrict identity_alerts UPDATE to admins only
DROP POLICY IF EXISTS "Users can update organization alerts" ON public.identity_alerts;
CREATE POLICY "Admins can update organization alerts"
  ON public.identity_alerts FOR UPDATE
  TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin'::app_role)
  );

-- Fix 2: Remove direct INSERT on training_completions (force server-side submission)
DROP POLICY IF EXISTS "Users can insert own completions" ON public.training_completions;