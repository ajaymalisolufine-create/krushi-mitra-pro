import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Translations {
  [lang: string]: { title: string; message: string };
}

export const useTranslateContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateTranslations = async (
    title: string,
    contentType: 'notification' | 'product' | 'news' | 'promotion',
    options?: { category?: string; context?: string }
  ): Promise<Translations | null> => {
    if (!title.trim()) {
      toast.error('Enter a title first');
      return null;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-notification-content', {
        body: {
          title,
          contentType,
          category: options?.category,
          context: options?.context,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('AI translations generated!');
      return data.translations as Translations;
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate translations');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateTranslations, isGenerating };
};

// Helper to get translated text from a translations JSONB object
export const getTranslatedText = (
  translations: Record<string, { title: string; message: string }> | null | undefined,
  language: string,
  fallbackTitle: string,
  fallbackMessage?: string
): { title: string; message: string } => {
  if (!translations || typeof translations !== 'object') {
    return { title: fallbackTitle, message: fallbackMessage || '' };
  }

  const t = translations[language] || translations['en'];
  if (t) {
    return { title: t.title || fallbackTitle, message: t.message || fallbackMessage || '' };
  }

  return { title: fallbackTitle, message: fallbackMessage || '' };
};
