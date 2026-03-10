import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  title: string;
  message: string;
  target_type: string | null;
  target_value: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  status: string;
  category: string | null;
  redirect_target: string | null;
  image_url: string | null;
  popup_enabled: boolean;
  push_enabled: boolean;
  translations: Record<string, { title: string; message: string }> | null;
  created_at: string;
  updated_at: string;
}

export type NotificationInsert = Omit<Notification, 'id' | 'created_at' | 'updated_at'>;
export type NotificationUpdate = Partial<NotificationInsert>;

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notification: NotificationInsert) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create notification: ' + error.message);
    },
  });
};

export const useUpdateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: NotificationUpdate }) => {
      const { data, error } = await supabase
        .from('notifications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<Notification[]>(['notifications']);
      queryClient.setQueryData<Notification[]>(['notifications'], old =>
        old?.map(n => n.id === id ? { ...n, ...updates } as Notification : n) ?? []
      );
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(['notifications'], context.previous);
      toast.error('Failed to update notification: ' + error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onSuccess: () => {
      toast.success('Notification updated successfully');
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<Notification[]>(['notifications']);
      queryClient.setQueryData<Notification[]>(['notifications'], old =>
        old?.filter(n => n.id !== id) ?? []
      );
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(['notifications'], context.previous);
      toast.error('Failed to delete notification: ' + error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onSuccess: () => {
      toast.success('Notification deleted successfully');
    },
  });
};

// Hook for sent notifications (for the app)
export const useSentNotifications = () => {
  return useQuery({
    queryKey: ['notifications', 'sent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('status', 'sent')
        .order('sent_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
  });
};

// Hook for active popup notifications - show sent popups
export const useActivePopupNotifications = () => {
  return useQuery({
    queryKey: ['notifications', 'popup'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('popup_enabled', true)
        .in('status', ['sent', 'scheduled'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
    staleTime: 1000 * 60,
  });
};
