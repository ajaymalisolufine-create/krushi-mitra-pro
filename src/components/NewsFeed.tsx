import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, ExternalLink, Loader2, X, Calendar, ShoppingBag } from 'lucide-react';
import { usePublishedNews } from '@/hooks/useNews';
import { useApp } from '@/contexts/AppContext';
import { useTracker } from '@/hooks/useTracker';
import { useEnquire } from '@/hooks/useEnquire';
import { getTranslatedText } from '@/hooks/useTranslateContent';
import { filterByState } from '@/lib/stateFilter';
import { format } from 'date-fns';

const uiTranslations = {
  mr: { title: 'कृषी बातम्या', viewAll: 'सर्व पहा', noNews: 'बातम्या उपलब्ध नाहीत', readMore: 'अधिक वाचा', enquire: 'चौकशी करा', noContent: 'या राज्यासाठी सामग्री उपलब्ध नाही' },
  hi: { title: 'कृषि समाचार', viewAll: 'सभी देखें', noNews: 'कोई समाचार नहीं', readMore: 'और पढ़ें', enquire: 'पूछताछ करें', noContent: 'आपके राज्य के लिए कोई सामग्री उपलब्ध नहीं' },
  en: { title: 'Agri News', viewAll: 'View All', noNews: 'No news available', readMore: 'Read more', enquire: 'Enquire Now', noContent: 'No content available for your state' },
};

const getCategoryColor = (category: string | null) => {
  switch (category) {
    case 'export': case 'Export': return 'bg-secondary/20 text-secondary';
    case 'scheme': case 'Scheme': return 'bg-harvest-gold/20 text-accent';
    case 'weather': case 'Weather': return 'bg-sky-blue/20 text-sky-blue';
    case 'market': case 'Market': return 'bg-primary/20 text-primary';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const NewsFeed = () => {
  const { data: allNews = [], isLoading } = usePublishedNews();
  const { language, setActiveTab, userState } = useApp();
  const { track } = useTracker();
  const { enquire, isSubmitting } = useEnquire();
  const [selected, setSelected] = useState<any>(null);
  const t = uiTranslations[language as keyof typeof uiTranslations] || uiTranslations.en;

  const news = filterByState(allNews as any[], userState);
  const latestNews = news.slice(0, 3);

  const handleClick = (item: any) => {
    if (!item?.id) {
      console.warn('News item missing id', item);
      return;
    }
    track('News', item.title || '-', { newsId: item.id });
    setSelected(item);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  if (latestNews.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">{t.title}</h2>
        </div>
        <button onClick={() => setActiveTab('notifications')} className="text-sm text-secondary font-medium flex items-center gap-1">
          {t.viewAll} <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        {latestNews.map((item, index) => {
          const translated = getTranslatedText(
            (item as any).translations,
            language,
            item.title,
            item.content || ''
          );
          return (
            <motion.article key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
              onClick={() => handleClick(item)}
              className="bg-card rounded-xl p-4 shadow-card border border-border/50 hover:shadow-card-hover transition-shadow cursor-pointer active:scale-[0.98]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {item.category && (
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  )}
                  <h3 className="font-medium text-sm leading-tight mb-1">{translated.title}</h3>
                  {translated.message && <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{translated.message}</p>}
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
          );
        })}
      </div>

      {/* News detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-lg rounded-2xl overflow-hidden max-h-[85vh] overflow-y-auto shadow-xl">
              {selected.image_url && <img src={selected.image_url} alt={selected.title} className="w-full h-48 object-cover" />}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {selected.category && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(selected.category)}`}>{selected.category}</span>}
                    {selected.source && <span className="text-xs text-muted-foreground">{selected.source}</span>}
                  </div>
                  <button onClick={() => setSelected(null)} className="p-2 rounded-full hover:bg-muted"><X className="w-5 h-5" /></button>
                </div>
                {(() => {
                  const tr = getTranslatedText((selected as any).translations, language, selected.title, selected.content || '');
                  return (
                    <>
                      <h2 className="text-lg font-bold mb-3">{tr.title}</h2>
                      {tr.message && <p className="text-muted-foreground mb-4 whitespace-pre-line">{tr.message}</p>}
                    </>
                  );
                })()}
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
                  <Calendar className="w-3 h-3" /> {format(new Date(selected.published_at), 'dd MMM yyyy')}
                </p>
                {selected.external_url && (
                  <a href={selected.external_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary font-medium mb-4">
                    {t.readMore} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <button onClick={() => enquire({ sourceType: 'news', sourceId: selected.id, sourceTitle: selected.title })}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-harvest-gold to-sunrise-orange text-white rounded-full font-semibold text-sm disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
                  {t.enquire}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
