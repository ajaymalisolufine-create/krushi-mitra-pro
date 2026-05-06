import { useApp } from '@/contexts/AppContext';

/**
 * Standardized screen labels (final list as per spec).
 */
export type TrackedScreen =
  | 'Browsing'
  | 'Banner'
  | 'Image'
  | 'News'
  | 'Offer'
  | 'Notification'
  | 'Video'
  | 'Product View'
  | 'Product Enquiry'
  | 'Trending Product'
  | 'Best Selling Product';

/**
 * Wrapper around trackInteraction that enforces standardized screen names
 * and a single "title" details field. Call from any click handler.
 */
export const useTracker = () => {
  const { trackInteraction } = useApp();

  const track = (screen: TrackedScreen, title: string, extra?: Record<string, unknown>) => {
    // Use screen name itself as activity_type so it shows clearly in admin.
    return trackInteraction(screen, screen, {
      title: title || '-',
      ...(extra || {}),
    });
  };

  return { track };
};
