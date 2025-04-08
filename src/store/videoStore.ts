import { create } from 'zustand';
import { Video, VideoUploadParams } from '../types/video';
import { supabase } from '../services/supabase';
import { useAuthStore } from './authStore';

interface VideoStore {
  videos: Video[];
  isLoading: boolean;
  error: string | null;
  uploadVideo: (params: VideoUploadParams) => Promise<Video>;
  getVideos: () => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  getPublicVideo: (id: string) => Promise<Video>;
}

export const useVideoStore = create<VideoStore>((set, get) => ({
  videos: [],
  isLoading: false,
  error: null,

  uploadVideo: async ({ file, title, description, scriptId }) => {
    set({ isLoading: true, error: null });

    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      // Upload video to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded video
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      // Create video record in database
      const { data: video, error: dbError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title,
          description,
          url: publicUrl,
          public_url: publicUrl,
          script_id: scriptId,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      set((state) => ({
        videos: [video, ...state.videos],
        isLoading: false,
      }));

      return video;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  getVideos: async () => {
    set({ isLoading: true, error: null });

    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ videos: data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteVideo: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      // Get video data first to get the file path
      const { data: video, error: getError } = await supabase
        .from('videos')
        .select('url')
        .eq('id', id)
        .single();

      if (getError) throw getError;

      // Extract filename from the URL
      const urlParts = new URL(video.url);
      const filePath = `${user.id}/${urlParts.pathname.split('/').pop()}`;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('videos')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('videos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (dbError) throw dbError;

      set((state) => ({
        videos: state.videos.filter(v => v.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  getPublicVideo: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      set({ isLoading: false });
      return data;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));