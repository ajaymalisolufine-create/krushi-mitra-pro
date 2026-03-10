import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export const usePromotions = () => {
  return useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Promotion[];
    },
  });
};

export const useActivePromotions = () => {
  return useQuery({
    queryKey: ['promotions', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Promotion[];
    },
  });
};

export const useCreatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promotion: PromotionInsert) => {
      const { data, error } = await supabase
        .from('promotions')
        .insert(promotion)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast.success('Promotion created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create promotion: ' + error.message);
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
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['promotions'] });
      const previous = queryClient.getQueryData<Promotion[]>(['promotions']);
      queryClient.setQueryData<Promotion[]>(['promotions'], old =>
        old?.map(p => p.id === id ? { ...p, ...updates } as Promotion : p) ?? []
      );
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(['promotions'], context.previous);
      toast.error('Failed to update promotion: ' + error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
    onSuccess: () => {
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
      await queryClient.cancelQueries({ queryKey: ['promotions'] });
      const previous = queryClient.getQueryData<Promotion[]>(['promotions']);
      queryClient.setQueryData<Promotion[]>(['promotions'], old =>
        old?.filter(p => p.id !== id) ?? []
      );
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(['promotions'], context.previous);
      toast.error('Failed to delete promotion: ' + error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
    onSuccess: () => {
      toast.success('Promotion deleted successfully');
    },
  });
};
