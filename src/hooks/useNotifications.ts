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

const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;
const NOTIFICATIONS_SENT_QUERY_KEY = ['notifications', 'sent'] as const;
const NOTIFICATIONS_POPUP_QUERY_KEY = ['notifications', 'popup'] as const;
const NOTIFICATION_FIELDS = 'id,title,message,target_type,target_value,scheduled_at,sent_at,status,category,redirect_target,image_url,popup_enabled,push_enabled,translations,created_at,updated_at';

export const useNotifications = () => {
  return useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select(NOTIFICATION_FIELDS)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
    ...LIST_QUERY_OPTIONS,
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notification: NotificationInsert) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select(NOTIFICATION_FIELDS)
        .single();

      if (error) throw error;
      return data as Notification;
    },
    onMutate: async (notification) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const previous = queryClient.getQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY);
      const optimisticId = createOptimisticId();
      const now = new Date().toISOString();

      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, (old) =>
        prependItem(old, {
          ...notification,
          id: optimisticId,
          created_at: now,
          updated_at: now,
        }),
      );

      return { previous, optimisticId };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
      toast.error('Failed to create notification: ' + error.message);
    },
    onSuccess: (createdNotification, _, context) => {
      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, (old) =>
        replaceItemById(old, context?.optimisticId ?? createdNotification.id, createdNotification),
      );
      void invalidateQueryGroups(queryClient, [NOTIFICATIONS_SENT_QUERY_KEY, NOTIFICATIONS_POPUP_QUERY_KEY]);
      toast.success('Notification created successfully');
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
        .select(NOTIFICATION_FIELDS)
        .single();

      if (error) throw error;
      return data as Notification;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const previous = queryClient.getQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY);
      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, (old) =>
        mergeItemById(old, id, { ...updates, updated_at: new Date().toISOString() } as Partial<Notification>),
      );
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
      toast.error('Failed to update notification: ' + error.message);
    },
    onSuccess: (updatedNotification) => {
      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, (old) =>
        replaceItemById(old, updatedNotification.id, updatedNotification),
      );
      void invalidateQueryGroups(queryClient, [NOTIFICATIONS_SENT_QUERY_KEY, NOTIFICATIONS_POPUP_QUERY_KEY]);
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
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const previous = queryClient.getQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY);
      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, (old) => removeItemById(old, id));
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
      toast.error('Failed to delete notification: ' + error.message);
    },
    onSuccess: () => {
      void invalidateQueryGroups(queryClient, [NOTIFICATIONS_SENT_QUERY_KEY, NOTIFICATIONS_POPUP_QUERY_KEY]);
      toast.success('Notification deleted successfully');
    },
  });
};

// Hook for sent notifications (for the app)
export const useSentNotifications = () => {
  return useQuery({
    queryKey: NOTIFICATIONS_SENT_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select(NOTIFICATION_FIELDS)
        .eq('status', 'sent')
        .order('sent_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
    ...LIST_QUERY_OPTIONS,
  });
};

// Hook for active popup notifications - show sent popups
export const useActivePopupNotifications = () => {
  return useQuery({
    queryKey: NOTIFICATIONS_POPUP_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select(NOTIFICATION_FIELDS)
        .eq('popup_enabled', true)
        .in('status', ['sent', 'scheduled'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
    ...LIST_QUERY_OPTIONS,
    staleTime: 1000 * 60,
  });
};
