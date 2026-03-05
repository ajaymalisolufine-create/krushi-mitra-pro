import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, Loader2 } from 'lucide-react';
import { usePublishedNews } from '@/hooks/useNews';
import { useApp } from '@/contexts/AppContext';
import { format } from 'date-fns';

const translations = {
  mr: { title: 'कृषी बातम्या', viewAll: 'सर्व पहा', noNews: 'बातम्या उपलब्ध नाहीत' },
  hi: { title: 'कृषि समाचार', viewAll: 'सभी देखें', noNews: 'कोई समाचार नहीं' },
  en: { title: 'Agri News', viewAll: 'View All', noNews: 'No news available' },
};

const getCategoryColor = (category: string | null) => {
  switch (category) {
    case 'export': case 'निर्यात': return 'bg-secondary/20 text-secondary';
    case 'scheme': case 'योजना': return 'bg-harvest-gold/20 text-accent';
    case 'weather': case 'हवामान': return 'bg-sky-blue/20 text-sky-blue';
    case 'market': return 'bg-primary/20 text-primary';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const NewsFeed = () => {
  const { data: news = [], isLoading } = usePublishedNews();
  const { language, setActiveTab } = useApp();
  const t = translations[language as keyof typeof translations] || translations.en;

  const latestNews = news.slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (latestNews.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">{t.title}</h2>
        </div>
        <button 
          onClick={() => setActiveTab('updates')}
          className="text-sm text-secondary font-medium flex items-center gap-1"
        >
          {t.viewAll} <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        {latestNews.map((item, index) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl p-4 shadow-card border border-border/50 hover:shadow-card-hover transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                {item.category && (
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                )}
                <h3 className="font-medium text-sm leading-tight mb-2">{item.title}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {item.source && <span>{item.source}</span>}
                  {item.source && <span>•</span>}
                  <span>{format(new Date(item.published_at), 'dd MMM yyyy')}</span>
                </div>
              </div>
              {item.image_url && (
                <img src={item.image_url} alt={item.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
};
