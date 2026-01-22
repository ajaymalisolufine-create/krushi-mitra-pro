import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, PlayCircle, Eye, Upload, Link } from 'lucide-react';

interface Video {
  id: number;
  title: string;
  thumbnail: string;
  youtubeUrl: string;
  category: string;
  views: string;
  status: 'published' | 'draft';
}

const initialVideos: Video[] = [
  {
    id: 1,
    title: 'THUNDER Usage for Grape Crop',
    thumbnail: 'https://images.unsplash.com/photo-1596363505729-4190a9506133?w=300&h=170&fit=crop',
    youtubeUrl: 'https://youtube.com/watch?v=example1',
    category: 'Grape',
    views: '12K',
    status: 'published',
  },
  {
    id: 2,
    title: 'TANGENT Bloom Booster Guide',
    thumbnail: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=300&h=170&fit=crop',
    youtubeUrl: 'https://youtube.com/watch?v=example2',
    category: 'Product',
    views: '8.5K',
    status: 'published',
  },
  {
    id: 3,
    title: 'Chickpea Season Management',
    thumbnail: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300&h=170&fit=crop',
    youtubeUrl: 'https://youtube.com/watch?v=example3',
    category: 'Chickpea',
    views: '5.2K',
    status: 'published',
  },
];

export const AdminVideos = () => {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this video?')) {
      setVideos(videos.filter((v) => v.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Videos</h1>
          <p className="text-muted-foreground">Manage video content</p>
        </div>
        <button
          onClick={() => {
            setEditingVideo(null);
            setShowModal(true);
          }}
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
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <PlayCircle className="w-12 h-12 text-white" />
              </div>
              <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                video.status === 'published'
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
                  {video.views}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingVideo(video);
                    setShowModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(video.id)}
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
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Video Title</label>
                <input
                  type="text"
                  defaultValue={editingVideo?.title}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., THUNDER Usage Guide"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">YouTube URL</label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="url"
                    defaultValue={editingVideo?.youtubeUrl}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Thumbnail</label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  defaultValue={editingVideo?.category}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option>Grape</option>
                  <option>Chickpea</option>
                  <option>Product</option>
                  <option>Organic</option>
                  <option>General</option>
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
                  onClick={(e) => {
                    e.preventDefault();
                    setShowModal(false);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {editingVideo ? 'Update' : 'Add Video'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
