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

const DEALERS_QUERY_KEY = ['dealers'] as const;
const ACTIVE_DEALERS_QUERY_KEY = ['dealers', 'active'] as const;
const DEALERS_BY_PINCODE_QUERY_KEY = ['dealers', 'pincode'] as const;
const DEALER_FIELDS = 'id,name,address,city,phone,email,lat,lng,pincode,serving_pincodes,status,created_at,updated_at';

export const useDealers = () => {
  return useQuery({
    queryKey: DEALERS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dealers')
        .select(DEALER_FIELDS)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Dealer[];
    },
    ...LIST_QUERY_OPTIONS,
  });
};

export const useActiveDealers = () => {
  return useQuery({
    queryKey: ACTIVE_DEALERS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dealers')
        .select(DEALER_FIELDS)
        .eq('status', 'active')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Dealer[];
    },
    ...LIST_QUERY_OPTIONS,
  });
};

export const useDealersByPincode = (pincode: string | null) => {
  return useQuery({
    queryKey: [...DEALERS_BY_PINCODE_QUERY_KEY, pincode],
    queryFn: async () => {
      if (!pincode) {
        const { data, error } = await supabase.from('dealers').select(DEALER_FIELDS).eq('status', 'active').order('name', { ascending: true });
        if (error) throw error;
        return data as Dealer[];
      }
      const { data, error } = await supabase
        .from('dealers').select(DEALER_FIELDS).eq('status', 'active')
        .or(`pincode.eq.${pincode},serving_pincodes.cs.{${pincode}}`)
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Dealer[];
    },
    enabled: true,
    ...LIST_QUERY_OPTIONS,
  });
};

export const useCreateDealer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dealer: DealerInsert) => {
      const { data, error } = await supabase.from('dealers').insert(dealer).select(DEALER_FIELDS).single();
      if (error) throw error;
      return data as Dealer;
    },
    onMutate: async (dealer) => {
      await queryClient.cancelQueries({ queryKey: DEALERS_QUERY_KEY });
      const previous = queryClient.getQueryData<Dealer[]>(DEALERS_QUERY_KEY);
      const optimisticId = createOptimisticId();
      const now = new Date().toISOString();

      queryClient.setQueryData<Dealer[]>(DEALERS_QUERY_KEY, (old) =>
        prependItem(old, {
          id: optimisticId,
          created_at: now,
          updated_at: now,
          name: dealer.name,
          address: dealer.address ?? null,
          city: dealer.city ?? null,
          phone: dealer.phone ?? null,
          email: dealer.email ?? null,
          lat: dealer.lat ?? null,
          lng: dealer.lng ?? null,
          pincode: dealer.pincode ?? null,
          serving_pincodes: dealer.serving_pincodes ?? null,
          status: dealer.status,
        }),
      );

      return { previous, optimisticId };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(DEALERS_QUERY_KEY, context.previous);
      toast.error('Failed to add dealer: ' + error.message);
    },
    onSuccess: (createdDealer, _, context) => {
      queryClient.setQueryData<Dealer[]>(DEALERS_QUERY_KEY, (old) =>
        replaceItemById(old, context?.optimisticId ?? createdDealer.id, createdDealer),
      );
      void invalidateQueryGroups(queryClient, [ACTIVE_DEALERS_QUERY_KEY, DEALERS_BY_PINCODE_QUERY_KEY]);
      toast.success('Dealer added successfully');
    },
  });
};

export const useUpdateDealer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: DealerUpdate }) => {
      const { data, error } = await supabase.from('dealers').update(updates).eq('id', id).select(DEALER_FIELDS).single();
      if (error) throw error;
      return data as Dealer;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: DEALERS_QUERY_KEY });
      const previous = queryClient.getQueryData<Dealer[]>(DEALERS_QUERY_KEY);
      queryClient.setQueryData<Dealer[]>(DEALERS_QUERY_KEY, (old) =>
        mergeItemById(old, id, { ...updates, updated_at: new Date().toISOString() } as Partial<Dealer>),
      );
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(DEALERS_QUERY_KEY, context.previous);
      toast.error('Failed to update dealer: ' + error.message);
    },
    onSuccess: (updatedDealer) => {
      queryClient.setQueryData<Dealer[]>(DEALERS_QUERY_KEY, (old) =>
        replaceItemById(old, updatedDealer.id, updatedDealer),
      );
      void invalidateQueryGroups(queryClient, [ACTIVE_DEALERS_QUERY_KEY, DEALERS_BY_PINCODE_QUERY_KEY]);
      toast.success('Dealer updated successfully');
    },
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
      await queryClient.cancelQueries({ queryKey: DEALERS_QUERY_KEY });
      const previous = queryClient.getQueryData<Dealer[]>(DEALERS_QUERY_KEY);
      queryClient.setQueryData<Dealer[]>(DEALERS_QUERY_KEY, (old) => removeItemById(old, id));
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(DEALERS_QUERY_KEY, context.previous);
      toast.error('Failed to delete dealer: ' + error.message);
    },
    onSuccess: () => {
      void invalidateQueryGroups(queryClient, [ACTIVE_DEALERS_QUERY_KEY, DEALERS_BY_PINCODE_QUERY_KEY]);
      toast.success('Dealer deleted successfully');
    },
  });
};
