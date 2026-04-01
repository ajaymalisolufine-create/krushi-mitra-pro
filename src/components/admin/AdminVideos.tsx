import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, PlayCircle, Eye, Link, Loader2 } from 'lucide-react';
import { useVideos, useCreateVideo, useUpdateVideo, useDeleteVideo, type Video } from '@/hooks/useVideos';
import { extractYouTubeId } from '@/lib/youtube';

export const AdminVideos = () => {
  const { data: videos = [], isLoading } = useVideos();
  const createVideo = useCreateVideo();
  const updateVideo = useUpdateVideo();
  const deleteVideo = useDeleteVideo();
  const isSaving = createVideo.isPending || updateVideo.isPending;

  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    youtube_url: '',
    category: 'general',
    crop: '',
    status: 'active',
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this video?')) {
      deleteVideo.mutate(id);
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      youtube_url: video.youtube_url || '',
      category: video.category || 'general',
      crop: video.crop || '',
      status: video.status,
    });
    setShowModal(true);
  };

  const handleOpenCreate = () => {
    setEditingVideo(null);
    setFormData({
      title: '',
      youtube_url: '',
      category: 'general',
      crop: '',
      status: 'active',
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const videoData = {
      title: formData.title,
      youtube_url: formData.youtube_url || null,
      video_url: null,
      thumbnail_url: null,
      category: formData.category || null,
      crop: formData.crop || null,
      duration: null,
      views: 0,
      status: formData.status,
    };

    if (editingVideo) {
      updateVideo.mutate({ id: editingVideo.id, updates: videoData }, {
        onSuccess: () => setShowModal(false),
      });
    } else {
      createVideo.mutate(videoData, {
        onSuccess: () => setShowModal(false),
      });
    }
  };

  // Generate thumbnail from YouTube URL
  const getYouTubeThumbnail = (url: string) => {
    const youtubeId = extractYouTubeId(url);
    return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : '/placeholder.svg';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Videos</h1>
          <p className="text-muted-foreground">Manage video content ({videos.length} videos)</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Video
        </button>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-2xl overflow-hidden shadow-card border border-border/50"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video">
              <img
                src={video.thumbnail_url || (video.youtube_url ? getYouTubeThumbnail(video.youtube_url) : '/placeholder.svg')}
                alt={video.title}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <PlayCircle className="w-12 h-12 text-white" />
              </div>
              <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                video.status === 'active'
                  ? 'bg-secondary text-white'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {video.status}
              </span>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-semibold text-sm line-clamp-2 mb-2">{video.title}</h3>
              
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-medium">
                  {video.category}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="w-3 h-3" />
                  {video.views || 0}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(video)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(video.id)}
                  disabled={deleteVideo.isPending}
                  className="px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-6 w-full max-w-lg"
          >
            <h2 className="text-xl font-bold mb-4">
              {editingVideo ? 'Edit Video' : 'Add New Video'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Video Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., THUNDER Usage Guide"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">YouTube URL</label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="url"
                    value={formData.youtube_url}
                    onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="general">General</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="product-demo">Product Demo</option>
                    <option value="grape">Grape</option>
                    <option value="chickpea">Chickpea</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Crop</label>
                  <input
                    type="text"
                    value={formData.crop}
                    onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Grapes"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {isSaving ? 'Saving...' : editingVideo ? 'Update' : 'Add Video'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
