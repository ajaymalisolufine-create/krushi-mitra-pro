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

export interface Video {
  id: string;
  title: string;
  youtube_url: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  category: string | null;
  crop: string | null;
  duration: string | null;
  views: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export type VideoInsert = Omit<Video, 'id' | 'created_at' | 'updated_at'>;
export type VideoUpdate = Partial<VideoInsert>;

const VIDEOS_QUERY_KEY = ['videos'] as const;
const ACTIVE_VIDEOS_QUERY_KEY = ['videos', 'active'] as const;
const VIDEO_FIELDS = 'id,title,youtube_url,video_url,thumbnail_url,category,crop,duration,views,status,created_at,updated_at';

export const useVideos = () => {
  return useQuery({
    queryKey: VIDEOS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select(VIDEO_FIELDS)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Video[];
    },
    ...LIST_QUERY_OPTIONS,
  });
};

export const useActiveVideos = () => {
  return useQuery({
    queryKey: ACTIVE_VIDEOS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select(VIDEO_FIELDS)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Video[];
    },
    ...LIST_QUERY_OPTIONS,
  });
};

export const useCreateVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (video: VideoInsert) => {
      const { data, error } = await supabase.from('videos').insert(video).select(VIDEO_FIELDS).single();
      if (error) throw error;
      return data as Video;
    },
    onMutate: async (video) => {
      await queryClient.cancelQueries({ queryKey: VIDEOS_QUERY_KEY });
      const previous = queryClient.getQueryData<Video[]>(VIDEOS_QUERY_KEY);
      const optimisticId = createOptimisticId();
      const now = new Date().toISOString();

      queryClient.setQueryData<Video[]>(VIDEOS_QUERY_KEY, (old) =>
        prependItem(old, {
          ...video,
          id: optimisticId,
          created_at: now,
          updated_at: now,
        }),
      );

      return { previous, optimisticId };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(VIDEOS_QUERY_KEY, context.previous);
      toast.error('Failed to add video: ' + error.message);
    },
    onSuccess: (createdVideo, _, context) => {
      queryClient.setQueryData<Video[]>(VIDEOS_QUERY_KEY, (old) =>
        replaceItemById(old, context?.optimisticId ?? createdVideo.id, createdVideo),
      );
      void invalidateQueryGroups(queryClient, [ACTIVE_VIDEOS_QUERY_KEY]);
      toast.success('Video added successfully');
    },
  });
};

export const useUpdateVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: VideoUpdate }) => {
      const { data, error } = await supabase.from('videos').update(updates).eq('id', id).select(VIDEO_FIELDS).single();
      if (error) throw error;
      return data as Video;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: VIDEOS_QUERY_KEY });
      const previous = queryClient.getQueryData<Video[]>(VIDEOS_QUERY_KEY);
      queryClient.setQueryData<Video[]>(VIDEOS_QUERY_KEY, (old) =>
        mergeItemById(old, id, { ...updates, updated_at: new Date().toISOString() } as Partial<Video>),
      );
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(VIDEOS_QUERY_KEY, context.previous);
      toast.error('Failed to update video: ' + error.message);
    },
    onSuccess: (updatedVideo) => {
      queryClient.setQueryData<Video[]>(VIDEOS_QUERY_KEY, (old) =>
        replaceItemById(old, updatedVideo.id, updatedVideo),
      );
      void invalidateQueryGroups(queryClient, [ACTIVE_VIDEOS_QUERY_KEY]);
      toast.success('Video updated successfully');
    },
  });
};

export const useDeleteVideo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: VIDEOS_QUERY_KEY });
      const previous = queryClient.getQueryData<Video[]>(VIDEOS_QUERY_KEY);
      queryClient.setQueryData<Video[]>(VIDEOS_QUERY_KEY, (old) => removeItemById(old, id));
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(VIDEOS_QUERY_KEY, context.previous);
      toast.error('Failed to delete video: ' + error.message);
    },
    onSuccess: () => {
      void invalidateQueryGroups(queryClient, [ACTIVE_VIDEOS_QUERY_KEY]);
      toast.success('Video deleted successfully');
    },
  });
};
