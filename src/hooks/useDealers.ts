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

// Get dealers by pincode - matches exact pincode or serving_pincodes array
export const useDealersByPincode = (pincode: string | null) => {
  return useQuery({
    queryKey: ['dealers', 'pincode', pincode],
    queryFn: async () => {
      if (!pincode) {
        // If no pincode, return all active dealers
        const { data, error } = await supabase
          .from('dealers')
          .select('*')
          .eq('status', 'active')
          .order('name', { ascending: true });

        if (error) throw error;
        return data as Dealer[];
      }

      // Get dealers that match the pincode or have it in serving_pincodes
      const { data, error } = await supabase
        .from('dealers')
        .select('*')
        .eq('status', 'active')
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
      const { data, error } = await supabase
        .from('dealers')
        .insert(dealer)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['dealers'] });
      await queryClient.refetchQueries({ queryKey: ['dealers'] });
      toast.success('Dealer added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add dealer: ' + error.message);
    },
  });
};

export const useUpdateDealer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: DealerUpdate }) => {
      const { data, error } = await supabase
        .from('dealers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['dealers'] });
      await queryClient.refetchQueries({ queryKey: ['dealers'] });
      toast.success('Dealer updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update dealer: ' + error.message);
    },
  });
};

export const useDeleteDealer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dealers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['dealers'] });
      await queryClient.refetchQueries({ queryKey: ['dealers'] });
      toast.success('Dealer deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete dealer: ' + error.message);
    },
  });
};
