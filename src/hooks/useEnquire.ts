import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

export type EnquirySource = 'product' | 'offer' | 'promotion' | 'news' | 'video';

interface EnquireParams {
  sourceType: EnquirySource;
  sourceId?: string | null;
  sourceTitle: string;
  productId?: string | null;
  productName?: string | null;
  trackScreen?: 'Product Enquiry' | 'Offer' | 'News' | 'Video';
}

const successMsg: Record<string, string> = {
  mr: 'चौकशी नोंदवली! आम्ही लवकरच संपर्क करू.',
  hi: 'पूछताछ दर्ज की गई! हम जल्द ही संपर्क करेंगे.',
  en: 'Enquiry submitted! We will contact you soon.',
};
const errorMsg: Record<string, string> = {
  mr: 'चौकशी अयशस्वी',
  hi: 'पूछताछ विफल',
  en: 'Enquiry failed',
};

export const useEnquire = () => {
  const { language, user, phone, pincode, selectedCrops, trackInteraction } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const enquire = async (params: EnquireParams): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const payload = {
        user_id: user?.id || null,
        product_id: params.productId || null,
        product_name: params.productName || params.sourceTitle,
        source_type: params.sourceType,
        source_id: params.sourceId || null,
        source_title: params.sourceTitle,
        status: 'new',
        name: localStorage.getItem('user_name') || null,
        phone: phone || localStorage.getItem('user_phone') || null,
        pincode: pincode || null,
        city: localStorage.getItem('user_city') || null,
        district: localStorage.getItem('user_district') || null,
        state: localStorage.getItem('user_state') || null,
        village: localStorage.getItem('user_village') || null,
        language,
        selected_crops: selectedCrops?.length > 0 ? selectedCrops : null,
      };
      const { error } = await supabase.from('product_enquiries').insert(payload);
      if (error) throw error;

      // Activity log for analytics — standardized screen name
      const screen =
        params.trackScreen ||
        (params.sourceType === 'product'
          ? 'Product Enquiry'
          : params.sourceType === 'promotion' || params.sourceType === 'offer'
          ? 'Offer'
          : params.sourceType === 'news'
          ? 'News'
          : 'Video');
      await trackInteraction(screen, screen, {
        title: params.sourceTitle,
        source_type: params.sourceType,
        source_id: params.sourceId,
      });

      toast.success(successMsg[language] || successMsg.en);
      return true;
    } catch (e) {
      console.error('Enquire failed', e);
      toast.error(errorMsg[language] || errorMsg.en);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { enquire, isSubmitting };
};
