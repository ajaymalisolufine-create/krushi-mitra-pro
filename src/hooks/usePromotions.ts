import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  LIST_QUERY_OPTIONS,
  createOptimisticId,
  invalidateQueryGroups,
  mergeItemById,
  prependItem,
  removeItemById,
  replaceItemById,
} from './query-cache';

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  discount: string | null;
  image_url: string | null;
  video_url: string | null;
  external_url: string | null;
  translations: Record<string, any> | null;
  valid_from: string;
  valid_until: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export type PromotionInsert = Omit<Promotion, 'id' | 'created_at' | 'updated_at'>;
export type PromotionUpdate = Partial<PromotionInsert>;

const PROMOTIONS_QUERY_KEY = ['promotions'] as const;
const ACTIVE_PROMOTIONS_QUERY_KEY = ['promotions', 'active'] as const;
const PROMOTION_FIELDS = 'id,title,description,discount,image_url,video_url,external_url,translations,valid_from,valid_until,status,created_at,updated_at';

export const usePromotions = () => {
  return useQuery({
    queryKey: PROMOTIONS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select(PROMOTION_FIELDS)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Promotion[];
    },
    ...LIST_QUERY_OPTIONS,
  });
};

export const useActivePromotions = () => {
  return useQuery({
    queryKey: ACTIVE_PROMOTIONS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select(PROMOTION_FIELDS)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Promotion[];
    },
    ...LIST_QUERY_OPTIONS,
  });
};

export const useCreatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promotion: PromotionInsert) => {
      const { data, error } = await supabase
        .from('promotions')
        .insert(promotion)
        .select(PROMOTION_FIELDS)
        .single();

      if (error) throw error;
      return data as Promotion;
    },
    onMutate: async (promotion) => {
      await queryClient.cancelQueries({ queryKey: PROMOTIONS_QUERY_KEY });
      const previous = queryClient.getQueryData<Promotion[]>(PROMOTIONS_QUERY_KEY);
      const optimisticId = createOptimisticId();
      const now = new Date().toISOString();

      queryClient.setQueryData<Promotion[]>(PROMOTIONS_QUERY_KEY, (old) =>
        prependItem(old, {
          ...promotion,
          id: optimisticId,
          created_at: now,
          updated_at: now,
        }),
      );

      return { previous, optimisticId };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(PROMOTIONS_QUERY_KEY, context.previous);
      toast.error('Failed to create promotion: ' + error.message);
    },
    onSuccess: (createdPromotion, _, context) => {
      queryClient.setQueryData<Promotion[]>(PROMOTIONS_QUERY_KEY, (old) =>
        replaceItemById(old, context?.optimisticId ?? createdPromotion.id, createdPromotion),
      );
      void invalidateQueryGroups(queryClient, [ACTIVE_PROMOTIONS_QUERY_KEY]);
      toast.success('Promotion created successfully');
    },
  });
};

export const useUpdatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PromotionUpdate }) => {
      const { data, error } = await supabase
        .from('promotions')
        .update(updates)
        .eq('id', id)
        .select(PROMOTION_FIELDS)
        .single();

      if (error) throw error;
      return data as Promotion;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: PROMOTIONS_QUERY_KEY });
      const previous = queryClient.getQueryData<Promotion[]>(PROMOTIONS_QUERY_KEY);
      queryClient.setQueryData<Promotion[]>(PROMOTIONS_QUERY_KEY, (old) =>
        mergeItemById(old, id, { ...updates, updated_at: new Date().toISOString() } as Partial<Promotion>),
      );
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(PROMOTIONS_QUERY_KEY, context.previous);
      toast.error('Failed to update promotion: ' + error.message);
    },
    onSuccess: (updatedPromotion) => {
      queryClient.setQueryData<Promotion[]>(PROMOTIONS_QUERY_KEY, (old) =>
        replaceItemById(old, updatedPromotion.id, updatedPromotion),
      );
      void invalidateQueryGroups(queryClient, [ACTIVE_PROMOTIONS_QUERY_KEY]);
      toast.success('Promotion updated successfully');
    },
  });
};

export const useDeletePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: PROMOTIONS_QUERY_KEY });
      const previous = queryClient.getQueryData<Promotion[]>(PROMOTIONS_QUERY_KEY);
      queryClient.setQueryData<Promotion[]>(PROMOTIONS_QUERY_KEY, (old) => removeItemById(old, id));
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(PROMOTIONS_QUERY_KEY, context.previous);
      toast.error('Failed to delete promotion: ' + error.message);
    },
    onSuccess: () => {
      void invalidateQueryGroups(queryClient, [ACTIVE_PROMOTIONS_QUERY_KEY]);
      toast.success('Promotion deleted successfully');
    },
  });
};
