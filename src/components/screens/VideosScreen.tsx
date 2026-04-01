import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Eye, Clock, Filter, Video, X, ArrowLeft } from 'lucide-react';
import { useActiveVideos } from '@/hooks/useVideos';
import { useApp } from '@/contexts/AppContext';
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeWatchUrl } from '@/lib/youtube';

const translations = {
  mr: {
    title: 'व्हिडिओ',
    noVideos: 'कोणतेही व्हिडिओ उपलब्ध नाहीत',
    views: 'दृश्ये',
    all: 'सर्व',
    watchNow: 'आता पहा',
    close: 'बंद करा',
  },
  hi: {
    title: 'वीडियो',
    noVideos: 'कोई वीडियो उपलब्ध नहीं',
    views: 'दृश्य',
    all: 'सभी',
    watchNow: 'अभी देखें',
    close: 'बंद करें',
  },
  en: {
    title: 'Videos',
    noVideos: 'No videos available',
    views: 'views',
    all: 'All',
    watchNow: 'Watch Now',
    close: 'Close',
  },
};

export const VideosScreen = () => {
  const { language, selectedCrops = [] } = useApp();
  const t = translations[language as keyof typeof translations] || translations.en;
  
  const { data: videos = [], isLoading } = useActiveVideos();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const categories = ['all', ...new Set(videos.map(v => v.category).filter(Boolean) as string[])];
  
  const videoCrops = ['all', ...new Set(videos.map(v => v.crop).filter(Boolean) as string[])];
  const [selectedCrop, setSelectedCrop] = useState<string>('all');

  const filteredVideos = videos.filter(video => {
    const categoryMatch = selectedCategory === 'all' || video.category === selectedCategory;
    const cropMatch = selectedCrop === 'all' || video.crop === selectedCrop;
    return categoryMatch && cropMatch;
  });

  const handleVideoClick = (video: typeof videos[0]) => {
    if (video.youtube_url) {
      const youtubeId = extractYouTubeId(video.youtube_url);
      if (youtubeId) {
        setPlayingVideo(youtubeId);
        return;
      }

      window.open(video.youtube_url, '_blank');
      return;
    }

    if (video.video_url) {
      window.open(video.video_url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="h-8 bg-muted rounded animate-pulse w-32" />
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-muted rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* In-App YouTube Player Modal */}
      <AnimatePresence>
        {playingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4">
              <button
                onClick={() => setPlayingVideo(null)}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">{t.close}</span>
              </button>
              <button
                onClick={() => setPlayingVideo(null)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center px-4 pb-4">
              <div className="w-full max-w-3xl aspect-video rounded-xl overflow-hidden">
                <iframe
                  src={getYouTubeEmbedUrl(playingVideo)}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 mb-4">
        <Video className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-bold">{t.title}</h1>
      </div>

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:bg-accent'
              }`}
            >
              {category === 'all' ? t.all : category}
            </motion.button>
          ))}
        </div>
      )}

      {/* Crop Filter */}
      {videoCrops.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-2" />
          {videoCrops.map((crop) => (
            <motion.button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-medium transition-all ${
                selectedCrop === crop
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {crop === 'all' ? t.all : crop}
            </motion.button>
          ))}
        </div>
      )}

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>{t.noVideos}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredVideos.map((video, index) => {
            const youtubeId = video.youtube_url ? extractYouTubeId(video.youtube_url) : null;
            const thumbnailUrl = video.thumbnail_url || 
              (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null);

            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleVideoClick(video)}
                className="bg-card rounded-xl overflow-hidden shadow-card border border-border/50 cursor-pointer hover:shadow-card-hover transition-all group"
              >
                <div className="relative aspect-video bg-muted">
                  {thumbnailUrl ? (
                    <img 
                      src={thumbnailUrl} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                      <Video className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg"
                    >
                      <Play className="w-6 h-6 text-primary-foreground fill-current ml-1" />
                    </motion.div>
                  </div>

                  {video.duration && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {video.duration}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-sm line-clamp-2">{video.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {video.views !== null && video.views > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {video.views.toLocaleString()} {t.views}
                      </span>
                    )}
                    {video.category && (
                      <span className="px-2 py-0.5 bg-secondary/10 text-secondary rounded-full">
                        {video.category}
                      </span>
                    )}
                    {video.crop && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                        {video.crop}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
