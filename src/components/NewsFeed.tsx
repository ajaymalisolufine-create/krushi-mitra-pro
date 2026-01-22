import { motion } from 'framer-motion';
import { Newspaper, ExternalLink } from 'lucide-react';

interface NewsItem {
  id: number;
  title: string;
  source: string;
  time: string;
  category: string;
}

const newsItems: NewsItem[] = [
  {
    id: 1,
    title: 'द्राक्ष निर्यातीत महाराष्ट्र अग्रेसर; यंदा २० टक्के वाढ अपेक्षित',
    source: 'अॅग्री न्यूज',
    time: '२ तास पूर्वी',
    category: 'निर्यात',
  },
  {
    id: 2,
    title: 'हरभरा पिकासाठी नवीन सरकारी योजना जाहीर',
    source: 'शेतकरी मित्र',
    time: '५ तास पूर्वी',
    category: 'योजना',
  },
  {
    id: 3,
    title: 'पाऊस अंदाज: पुढील आठवड्यात मध्यम स्वरूपाचा पाऊस',
    source: 'हवामान विभाग',
    time: '८ तास पूर्वी',
    category: 'हवामान',
  },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'निर्यात': return 'bg-secondary/20 text-secondary';
    case 'योजना': return 'bg-harvest-gold/20 text-accent';
    case 'हवामान': return 'bg-sky-blue/20 text-sky-blue';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const NewsFeed = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">कृषी बातम्या</h2>
        </div>
        <button className="text-sm text-secondary font-medium flex items-center gap-1">
          सर्व पहा <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        {newsItems.map((news, index) => (
          <motion.article
            key={news.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl p-4 shadow-card border border-border/50 hover:shadow-card-hover transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${getCategoryColor(news.category)}`}>
                  {news.category}
                </span>
                <h3 className="font-medium text-sm leading-tight mb-2">{news.title}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{news.source}</span>
                  <span>•</span>
                  <span>{news.time}</span>
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
};
