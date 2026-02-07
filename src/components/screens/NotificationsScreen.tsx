import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Megaphone, Newspaper, Tag, ExternalLink, Calendar } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { usePublishedNews } from '@/hooks/useNews';
import { useActivePromotions } from '@/hooks/usePromotions';
import { useApp } from '@/contexts/AppContext';
import { format } from 'date-fns';

const translations = {
  mr: {
    title: 'सूचना',
    notifications: 'सूचना',
    news: 'बातम्या',
    offers: 'ऑफर्स',
    noNotifications: 'कोणतीही सूचना नाही',
    noNews: 'कोणत्याही बातम्या नाहीत',
    noOffers: 'कोणत्याही ऑफर्स नाहीत',
    validUntil: 'पर्यंत वैध',
  },
  hi: {
    title: 'सूचनाएं',
    notifications: 'सूचनाएं',
    news: 'समाचार',
    offers: 'ऑफर्स',
    noNotifications: 'कोई सूचना नहीं',
    noNews: 'कोई समाचार नहीं',
    noOffers: 'कोई ऑफर नहीं',
    validUntil: 'तक मान्य',
  },
  en: {
    title: 'Updates',
    notifications: 'Notifications',
    news: 'News',
    offers: 'Offers',
    noNotifications: 'No notifications',
    noNews: 'No news available',
    noOffers: 'No offers available',
    validUntil: 'Valid until',
  },
};

type TabType = 'notifications' | 'news' | 'offers';

export const NotificationsScreen = () => {
  const { language } = useApp();
  const t = translations[language as keyof typeof translations] || translations.en;
  
  const { data: notifications = [] } = useNotifications();
  const { data: news = [] } = usePublishedNews();
  const { data: promotions = [] } = useActivePromotions();

  const [activeTab, setActiveTab] = useState<TabType>('notifications');

  const tabs = [
    { id: 'notifications' as TabType, label: t.notifications, icon: Bell, count: notifications.filter(n => n.status === 'sent').length },
    { id: 'news' as TabType, label: t.news, icon: Newspaper, count: news.length },
    { id: 'offers' as TabType, label: t.offers, icon: Tag, count: promotions.length },
  ];

  const sentNotifications = notifications.filter(n => n.status === 'sent');

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Megaphone className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-bold">{t.title}</h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:bg-accent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'
                }`}>
                  {tab.count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {activeTab === 'notifications' && (
          <>
            {sentNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t.noNotifications}</p>
              </div>
            ) : (
              sentNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl p-4 shadow-card border border-border/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      {notification.sent_at && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(notification.sent_at), 'dd MMM yyyy, hh:mm a')}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </>
        )}

        {activeTab === 'news' && (
          <>
            {news.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Newspaper className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t.noNews}</p>
              </div>
            ) : (
              news.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl overflow-hidden shadow-card border border-border/50"
                >
                  {item.image_url && (
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {item.category && (
                        <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs font-medium rounded-full">
                          {item.category}
                        </span>
                      )}
                      {item.source && (
                        <span className="text-xs text-muted-foreground">{item.source}</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    {item.content && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.content}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(item.published_at), 'dd MMM yyyy')}
                      </p>
                      {item.external_url && (
                        <a 
                          href={item.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary font-medium"
                        >
                          Read more <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </>
        )}

        {activeTab === 'offers' && (
          <>
            {promotions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t.noOffers}</p>
              </div>
            ) : (
              promotions.map((promo, index) => (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl overflow-hidden shadow-card border border-primary/20"
                >
                  {promo.image_url && (
                    <img 
                      src={promo.image_url} 
                      alt={promo.title}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-sm">{promo.title}</h3>
                      {promo.discount && (
                        <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-bold rounded-full">
                          {promo.discount}
                        </span>
                      )}
                    </div>
                    {promo.description && (
                      <p className="text-sm text-muted-foreground">{promo.description}</p>
                    )}
                    {promo.valid_until && (
                      <p className="text-xs text-secondary font-medium mt-2">
                        {t.validUntil}: {format(new Date(promo.valid_until), 'dd MMM yyyy')}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};
