import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Dealer {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  lat: number | null;
  lng: number | null;
  pincode: string | null;
  serving_pincodes: string[] | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export type DealerInsert = Partial<Omit<Dealer, 'id' | 'created_at' | 'updated_at'>> & { name: string; status: string };
export type DealerUpdate = Partial<Omit<Dealer, 'id' | 'created_at' | 'updated_at'>>;

export const useDealers = () => {
  return useQuery({
    queryKey: ['dealers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dealers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Dealer[];
    },
  });
};

export const useActiveDealers = () => {
  return useQuery({
    queryKey: ['dealers', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dealers')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Dealer[];
    },
  });
};

export const useDealersByPincode = (pincode: string | null) => {
  return useQuery({
    queryKey: ['dealers', 'pincode', pincode],
    queryFn: async () => {
      if (!pincode) {
        const { data, error } = await supabase.from('dealers').select('*').eq('status', 'active').order('name', { ascending: true });
        if (error) throw error;
        return data as Dealer[];
      }
      const { data, error } = await supabase
        .from('dealers').select('*').eq('status', 'active')
        .or(`pincode.eq.${pincode},serving_pincodes.cs.{${pincode}}`)
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Dealer[];
    },
    enabled: true,
  });
};

export const useCreateDealer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dealer: DealerInsert) => {
      const { data, error } = await supabase.from('dealers').insert(dealer).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealers'] });
      toast.success('Dealer added successfully');
    },
    onError: (error) => toast.error('Failed to add dealer: ' + error.message),
  });
};

export const useUpdateDealer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: DealerUpdate }) => {
      const { data, error } = await supabase.from('dealers').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['dealers'] });
      const previous = queryClient.getQueryData<Dealer[]>(['dealers']);
      queryClient.setQueryData<Dealer[]>(['dealers'], old =>
        old?.map(d => d.id === id ? { ...d, ...updates } as Dealer : d) ?? []
      );
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(['dealers'], context.previous);
      toast.error('Failed to update dealer: ' + error.message);
    },
    onSettled: () => { queryClient.invalidateQueries({ queryKey: ['dealers'] }); },
    onSuccess: () => { toast.success('Dealer updated successfully'); },
  });
};

export const useDeleteDealer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('dealers').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['dealers'] });
      const previous = queryClient.getQueryData<Dealer[]>(['dealers']);
      queryClient.setQueryData<Dealer[]>(['dealers'], old => old?.filter(d => d.id !== id) ?? []);
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(['dealers'], context.previous);
      toast.error('Failed to delete dealer: ' + error.message);
    },
    onSettled: () => { queryClient.invalidateQueries({ queryKey: ['dealers'] }); },
    onSuccess: () => { toast.success('Dealer deleted successfully'); },
  });
};
