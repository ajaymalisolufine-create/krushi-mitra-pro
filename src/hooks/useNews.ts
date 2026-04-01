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

export interface News {
  id: string;
  title: string;
  content: string | null;
  source: string | null;
  category: string | null;
  image_url: string | null;
  external_url: string | null;
  video_url: string | null;
  translations: Record<string, any> | null;
  status: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export type NewsInsert = Omit<News, 'id' | 'created_at' | 'updated_at'>;
export type NewsUpdate = Partial<NewsInsert>;

const NEWS_QUERY_KEY = ['news'] as const;
const PUBLISHED_NEWS_QUERY_KEY = ['news', 'published'] as const;
const NEWS_FIELDS = 'id,title,content,source,category,image_url,external_url,video_url,translations,status,published_at,created_at,updated_at';

export const useNews = () => {
  return useQuery({
    queryKey: NEWS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select(NEWS_FIELDS)
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data as News[];
    },
    ...LIST_QUERY_OPTIONS,
  });
};

export const usePublishedNews = () => {
  return useQuery({
    queryKey: PUBLISHED_NEWS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select(NEWS_FIELDS)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data as News[];
    },
    ...LIST_QUERY_OPTIONS,
  });
};

export const useCreateNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (news: NewsInsert) => {
      const { data, error } = await supabase
        .from('news')
        .insert(news)
        .select(NEWS_FIELDS)
        .single();

      if (error) throw error;
      return data as News;
    },
    onMutate: async (news) => {
      await queryClient.cancelQueries({ queryKey: NEWS_QUERY_KEY });
      const previous = queryClient.getQueryData<News[]>(NEWS_QUERY_KEY);
      const optimisticId = createOptimisticId();
      const now = new Date().toISOString();

      queryClient.setQueryData<News[]>(NEWS_QUERY_KEY, (old) =>
        prependItem(old, {
          ...news,
          id: optimisticId,
          created_at: now,
          updated_at: now,
        }),
      );

      return { previous, optimisticId };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(NEWS_QUERY_KEY, context.previous);
      toast.error('Failed to publish news: ' + error.message);
    },
    onSuccess: (createdNews, _, context) => {
      queryClient.setQueryData<News[]>(NEWS_QUERY_KEY, (old) =>
        replaceItemById(old, context?.optimisticId ?? createdNews.id, createdNews),
      );
      void invalidateQueryGroups(queryClient, [PUBLISHED_NEWS_QUERY_KEY]);
      toast.success('News published successfully');
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
        .select(NEWS_FIELDS)
        .single();

      if (error) throw error;
      return data as News;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: NEWS_QUERY_KEY });
      const previous = queryClient.getQueryData<News[]>(NEWS_QUERY_KEY);
      queryClient.setQueryData<News[]>(NEWS_QUERY_KEY, (old) =>
        mergeItemById(old, id, { ...updates, updated_at: new Date().toISOString() } as Partial<News>),
      );
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(NEWS_QUERY_KEY, context.previous);
      toast.error('Failed to update news: ' + error.message);
    },
    onSuccess: (updatedNews) => {
      queryClient.setQueryData<News[]>(NEWS_QUERY_KEY, (old) =>
        replaceItemById(old, updatedNews.id, updatedNews),
      );
      void invalidateQueryGroups(queryClient, [PUBLISHED_NEWS_QUERY_KEY]);
      toast.success('News updated successfully');
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
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: NEWS_QUERY_KEY });
      const previous = queryClient.getQueryData<News[]>(NEWS_QUERY_KEY);
      queryClient.setQueryData<News[]>(NEWS_QUERY_KEY, (old) => removeItemById(old, id));
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(NEWS_QUERY_KEY, context.previous);
      toast.error('Failed to delete news: ' + error.message);
    },
    onSuccess: () => {
      void invalidateQueryGroups(queryClient, [PUBLISHED_NEWS_QUERY_KEY]);
      toast.success('News deleted successfully');
    },
  });
};
