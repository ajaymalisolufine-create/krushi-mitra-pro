import { toast } from 'sonner';

const APP_URL = 'https://krushi-mitra-pro.lovable.app';

export interface SharePayload {
  title: string;
  text?: string;
  url?: string;
}

/**
 * Opens the device's native share sheet (Web Share API) when available.
 * Falls back to copying the share text to the clipboard.
 */
export const shareContent = async ({ title, text, url }: SharePayload) => {
  const shareUrl = url || APP_URL;
  const shareData: ShareData = {
    title,
    text: [title, text].filter(Boolean).join('\n\n'),
    url: shareUrl,
  };

  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share(shareData);
      return;
    }
  } catch (err: any) {
    // User cancelled the share sheet — do nothing.
    if (err?.name === 'AbortError') return;
  }

  // Fallback: copy link to clipboard.
  try {
    const fallbackText = `${shareData.text}\n${shareUrl}`;
    await navigator.clipboard.writeText(fallbackText);
    toast.success('Link copied to clipboard');
  } catch {
    toast.error('Unable to share on this device');
  }
};
