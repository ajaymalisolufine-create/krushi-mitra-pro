import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, Clock, Eye, Filter, X, ArrowLeft, Play } from 'lucide-react';

interface Video {
  id: number;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
  category: string;
  youtubeId?: string;
}

const videos: Video[] = [
  {
    id: 1,
    title: 'द्राक्ष पिकासाठी THUNDER वापर पद्धत',
    thumbnail: 'https://images.unsplash.com/photo-1596363505729-4190a9506133?w=400&h=225&fit=crop',
    duration: '8:45',
    views: '12K',
    category: 'द्राक्ष',
  },
  {
    id: 2,
    title: 'फुलोरा वाढवण्यासाठी TANGENT - संपूर्ण मार्गदर्शन',
    thumbnail: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=225&fit=crop',
    duration: '12:30',
    views: '8.5K',
    category: 'उत्पादन',
  },
  {
    id: 3,
    title: 'हरभरा पिकाचे व्यवस्थापन - संपूर्ण हंगाम',
    thumbnail: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=225&fit=crop',
    duration: '15:20',
    views: '5.2K',
    category: 'हरभरा',
  },
  {
    id: 4,
    title: 'सेंद्रिय शेतीचे फायदे - MARINUS कसे वापरावे',
    thumbnail: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4e7?w=400&h=225&fit=crop',
    duration: '10:15',
    views: '3.8K',
    category: 'सेंद्रिय',
  },
];

export const VideosSection = () => {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  return (
    <div className="space-y-4">
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
                <span className="text-sm font-medium">बंद करा</span>
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
                  src={`https://www.youtube.com/embed/${playingVideo}?autoplay=1&rel=0`}
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">शिका व्हिडिओंमधून</h2>
        </div>
        <button className="flex items-center gap-1 text-sm text-secondary font-medium">
          <Filter className="w-4 h-4" />
          फिल्टर
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {['सर्व', 'द्राक्ष', 'हरभरा', 'उत्पादन', 'सेंद्रिय'].map((cat, index) => (
          <button
            key={cat}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              index === 0
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-foreground hover:border-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => {
              if (video.youtubeId) {
                setPlayingVideo(video.youtubeId);
              }
            }}
            className="bg-card rounded-2xl overflow-hidden shadow-card border border-border/50 hover:shadow-card-hover transition-all cursor-pointer group"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:bg-harvest-gold transition-colors"
                >
                  <Play className="w-8 h-8 text-primary group-hover:text-white transition-colors fill-current ml-1" />
                </motion.div>
              </div>

              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded-md text-white text-xs font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {video.duration}
              </div>

              {/* Category Badge */}
              <div className="absolute top-2 left-2 px-2 py-1 bg-secondary rounded-full text-white text-xs font-medium">
                {video.category}
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-2">
                {video.title}
              </h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="w-3 h-3" />
                <span>{video.views} views</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
