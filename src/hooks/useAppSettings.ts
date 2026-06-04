import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type PlatformSettings = {
  company_name?: string;
  admin_email?: string;
  support_email?: string;
  contact_phone?: string;
  whatsapp_phone?: string;
  website_url?: string;
  office_address?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_youtube?: string;
  social_twitter?: string;
  company_logo?: string;
  // SMS / OTP provider (MSG91) — stored in DB, editable from Admin Settings
  sms_enabled?: string;
  msg91_auth_key?: string;
  msg91_template_id?: string;
  msg91_sender_id?: string;
  // WhatsApp OTP provider (MSG91 OTP API) — uses app_otp Template Code + same auth key
  whatsapp_enabled?: string;
  msg91_whatsapp_template_id?: string;
};

export const useAppSettings = () => {
  return useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('app_settings').select('*');
      if (error) throw error;
      const map: PlatformSettings = {};
      (data || []).forEach((row: any) => {
        (map as any)[row.key] = row.value;
      });
      return map;
    },
    staleTime: 1000 * 60,
  });
};

export const useUpsertSetting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key, value } as any, { onConflict: 'key' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['app-settings'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to save'),
  });
};

/** Normalize a phone for tel:/wa.me usage (digits only, with country code). */
export const formatPhone = (raw?: string, fallbackCountryCode = '91') => {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return fallbackCountryCode + digits;
  return digits;
};
