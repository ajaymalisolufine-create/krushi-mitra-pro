import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, Clock, Eye, X, ArrowLeft, Play, Loader2 } from 'lucide-react';
import { useActiveVideos } from '@/hooks/useVideos';
import { useApp } from '@/contexts/AppContext';
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeWatchUrl } from '@/lib/youtube';

const translations = {
  mr: { title: 'शिका व्हिडिओंमधून', close: 'बंद करा', noVideos: 'व्हिडिओ उपलब्ध नाहीत' },
  hi: { title: 'वीडियो से सीखें', close: 'बंद करें', noVideos: 'कोई वीडियो नहीं' },
  en: { title: 'Learn from Videos', close: 'Close', noVideos: 'No videos available' },
};

export const VideosSection = () => {
  const { data: videos = [], isLoading } = useActiveVideos();
  const { language } = useApp();
  const t = translations[language as keyof typeof translations] || translations.en;
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const latestVideos = videos.slice(0, 4);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (latestVideos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* YouTube Player Modal */}
      <AnimatePresence>
        {playingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4">
              <button onClick={() => setPlayingVideo(null)} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">{t.close}</span>
              </button>
              <button onClick={() => setPlayingVideo(null)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
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

      <div className="flex items-center gap-2">
        <PlayCircle className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">{t.title}</h2>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {latestVideos.map((video, index) => {
          const youtubeId = extractYouTubeId(video.youtube_url);
          const thumbnail = video.thumbnail_url || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null);

          return (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                if (youtubeId) {
                  setPlayingVideo(youtubeId);
                  return;
                }

                if (video.youtube_url) {
                  setPlayingVideo(null);
                  window.open(video.youtube_url, '_blank');
                }
              }}
              className="bg-card rounded-2xl overflow-hidden shadow-card border border-border/50 hover:shadow-card-hover transition-all cursor-pointer group"
            >
              <div className="relative aspect-video overflow-hidden">
                {thumbnail ? (
                  <img src={thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:bg-harvest-gold transition-colors">
                    <Play className="w-8 h-8 text-primary group-hover:text-white transition-colors fill-current ml-1" />
                  </motion.div>
                </div>
                {video.duration && (
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded-md text-white text-xs font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {video.duration}
                  </div>
                )}
                {video.category && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-secondary rounded-full text-white text-xs font-medium">
                    {video.category}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-2">{video.title}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="w-3 h-3" />
                  <span>{video.views || 0} views</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
