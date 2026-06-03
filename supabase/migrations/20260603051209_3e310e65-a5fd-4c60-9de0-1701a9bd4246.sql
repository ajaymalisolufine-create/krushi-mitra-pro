-- Hide sensitive SMS provider credentials from public/non-admin readers.
-- The MSG91 auth key is a secret and must only be readable by admins.
DROP POLICY IF EXISTS "Public can view non-sensitive app settings" ON public.app_settings;

CREATE POLICY "Public can view non-sensitive app settings"
ON public.app_settings
FOR SELECT
TO public
USING (
  key NOT IN ('admin_email', 'msg91_auth_key')
  OR has_role(auth.uid(), 'admin'::app_role)
);