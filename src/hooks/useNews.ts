import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface News {
  id: string;
  title: string;
  content: string | null;
  source: string | null;
  category: string | null;
  image_url: string | null;
  external_url: string | null;
  status: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export type NewsInsert = Omit<News, 'id' | 'created_at' | 'updated_at'>;
export type NewsUpdate = Partial<NewsInsert>;

export const useNews = () => {
  return useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data as News[];
    },
  });
};

export const usePublishedNews = () => {
  return useQuery({
    queryKey: ['news', 'published'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data as News[];
    },
  });
};

export const useCreateNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (news: NewsInsert) => {
      const { data, error } = await supabase
        .from('news')
        .insert(news)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success('News published successfully');
    },
    onError: (error) => {
      toast.error('Failed to publish news: ' + error.message);
    },
  });
};

export const useUpdateNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: NewsUpdate }) => {
      const { data, error } = await supabase
        .from('news')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success('News updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update news: ' + error.message);
    },
  });
};

export const useDeleteNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success('News deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete news: ' + error.message);
    },
  });
};
