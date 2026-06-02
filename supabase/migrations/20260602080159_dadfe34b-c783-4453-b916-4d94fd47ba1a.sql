-- Restrict dealer contact details to authenticated users only
DROP POLICY IF EXISTS "Anyone can view dealers" ON public.dealers;

CREATE POLICY "Authenticated users can view dealers"
ON public.dealers
FOR SELECT
TO authenticated
USING (true);

-- Restrict app_settings public access: keep public branding/contact info readable,
-- but hide internal admin_email from anonymous/non-admin users
DROP POLICY IF EXISTS "Anyone can view app settings" ON public.app_settings;

CREATE POLICY "Public can view non-sensitive app settings"
ON public.app_settings
FOR SELECT
TO public
USING (
  key <> 'admin_email'
  OR has_role(auth.uid(), 'admin'::app_role)
);