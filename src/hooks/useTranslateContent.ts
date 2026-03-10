import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Translations {
  [lang: string]: { title: string; message: string };
}

interface TranslateOptions {
  category?: string;
  context?: string;
  benefits?: string[];
  retries?: number;
}

export const useTranslateContent = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateTranslations = async (
    title: string,
    contentType: 'notification' | 'product' | 'news' | 'promotion',
    options?: TranslateOptions
  ): Promise<Translations | null> => {
    if (!title.trim()) {
      toast.error('Enter a title first');
      return null;
    }

    setIsGenerating(true);
    const maxRetries = options?.retries ?? 2;
    let lastError: any = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const body: any = {
          title,
          contentType,
          category: options?.category,
          context: options?.context,
        };

        // Include benefits for product translations
        if (contentType === 'product' && options?.benefits && options.benefits.length > 0) {
          body.benefits = options.benefits;
        }

        const { data, error } = await supabase.functions.invoke('generate-notification-content', {
          body,
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        toast.success('AI translations generated!');
        return data.translations as Translations;
      } catch (err: any) {
        lastError = err;
        if (attempt < maxRetries && !err.message?.includes('Rate limit') && !err.message?.includes('credits')) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        break;
      }
    }

    toast.error(lastError?.message || 'Failed to generate translations');
    return null;
    // finally block removed to avoid premature state reset during retries
  };

  return { generateTranslations, isGenerating, setIsGenerating };
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
