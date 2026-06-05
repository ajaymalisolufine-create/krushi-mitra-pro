UPDATE public.app_settings AS auth_setting
SET value = extracted.auth_key,
    updated_at = now()
FROM (
  SELECT substring(value from 'authkey[''" ]*\s*,\s*[''"]([^''"]+)[''"]') AS auth_key
  FROM public.app_settings
  WHERE key = 'msg91_whatsapp_template_id'
) AS extracted
WHERE auth_setting.key = 'msg91_auth_key'
  AND coalesce(auth_setting.value, '') = ''
  AND extracted.auth_key IS NOT NULL
  AND extracted.auth_key <> '<authkey>';

UPDATE public.app_settings
SET value = regexp_replace(value, '(authkey[''" ]*\s*,\s*[''"])([^''"]+)([''"])', '\1<authkey>\3', 'i'),
    updated_at = now()
WHERE key = 'msg91_whatsapp_template_id'
  AND value ~* 'authkey[''" ]*\s*,\s*[''"][^''"]+[''"]';