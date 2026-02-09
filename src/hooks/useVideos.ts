import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export const useVideos = () => {
  return useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Video[];
    },
  });
};

export const useActiveVideos = () => {
  return useQuery({
    queryKey: ['videos', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Video[];
    },
  });
};

export const useCreateVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (video: VideoInsert) => {
      const { data, error } = await supabase
        .from('videos')
        .insert(video)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['videos'] });
      await queryClient.refetchQueries({ queryKey: ['videos'] });
      toast.success('Video added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add video: ' + error.message);
    },
  });
};

export const useUpdateVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: VideoUpdate }) => {
      const { data, error } = await supabase
        .from('videos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['videos'] });
      await queryClient.refetchQueries({ queryKey: ['videos'] });
      toast.success('Video updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update video: ' + error.message);
    },
  });
};

export const useDeleteVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['videos'] });
      await queryClient.refetchQueries({ queryKey: ['videos'] });
      toast.success('Video deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete video: ' + error.message);
    },
  });
};
