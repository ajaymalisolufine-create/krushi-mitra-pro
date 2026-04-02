import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Megaphone, Newspaper, Tag, ExternalLink, Calendar, X, Clock, MessageCircle, Phone } from 'lucide-react';
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
    close: 'बंद करा',
    whatsappShare: 'WhatsApp शेअर',
    contactDealer: 'विक्रेता संपर्क',
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
    close: 'बंद करें',
    whatsappShare: 'WhatsApp शेयर',
    contactDealer: 'विक्रेता संपर्क',
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
    close: 'Close',
    whatsappShare: 'Share on WhatsApp',
    contactDealer: 'Contact Dealer',
  },
};

type TabType = 'notifications' | 'news' | 'offers';

export const NotificationsScreen = () => {
  const { language } = useApp();
  const t = translations[language as keyof typeof translations] || translations.en;
  
  const { data: notifications = [] } = useNotifications();
  const { data: news = [] } = usePublishedNews();
  const { data: promotions = [] } = useActivePromotions();

  const [activeTab, setActiveTabRaw] = useState<TabType>('notifications');
  const setActiveTab = (tab: TabType) => {
    setActiveTabRaw(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [selectedPromo, setSelectedPromo] = useState<any>(null);

  const tabs = [
    { id: 'notifications' as TabType, label: t.notifications, icon: Bell, count: notifications.filter(n => n.status === 'sent' || n.status === 'scheduled').length },
    { id: 'news' as TabType, label: t.news, icon: Newspaper, count: news.length },
    { id: 'offers' as TabType, label: t.offers, icon: Tag, count: promotions.length },
  ];

  const visibleNotifications = notifications.filter(n => n.status === 'sent' || n.status === 'scheduled');

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Detail Modals */}
      <AnimatePresence>
        {selectedNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedNotification(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-lg rounded-2xl p-6 max-h-[85vh] overflow-y-auto shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <button onClick={() => setSelectedNotification(null)} className="p-2 rounded-full hover:bg-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-lg font-bold mb-2">{selectedNotification._displayTitle || selectedNotification.title}</h2>
              <p className="text-muted-foreground mb-4">{selectedNotification._displayMessage || selectedNotification.message}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {selectedNotification.sent_at
                  ? format(new Date(selectedNotification.sent_at), 'dd MMM yyyy, hh:mm a')
                  : selectedNotification.scheduled_at
                    ? format(new Date(selectedNotification.scheduled_at), 'dd MMM yyyy, hh:mm a')
                    : format(new Date(selectedNotification.created_at), 'dd MMM yyyy, hh:mm a')}
              </p>
            </motion.div>
          </motion.div>
        )}

        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedNews(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-lg rounded-2xl overflow-hidden max-h-[85vh] overflow-y-auto shadow-xl"
            >
              {selectedNews.image_url && (
                <img src={selectedNews.image_url} alt={selectedNews.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {selectedNews.category && (
                      <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs font-medium rounded-full">{selectedNews.category}</span>
                    )}
                    {selectedNews.source && <span className="text-xs text-muted-foreground">{selectedNews.source}</span>}
                  </div>
                  <button onClick={() => setSelectedNews(null)} className="p-2 rounded-full hover:bg-muted">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-lg font-bold mb-3">{selectedNews.title}</h2>
                {selectedNews.content && <p className="text-muted-foreground mb-4">{selectedNews.content}</p>}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{format(new Date(selectedNews.published_at), 'dd MMM yyyy')}</p>
                  {selectedNews.external_url && (
                    <a href={selectedNews.external_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary font-medium">
                      Read more <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {selectedPromo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPromo(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-lg rounded-2xl overflow-hidden max-h-[85vh] overflow-y-auto shadow-xl"
            >
              {selectedPromo.image_url && (
                <img src={selectedPromo.image_url} alt={selectedPromo.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  {selectedPromo.discount && (
                    <span className="px-4 py-2 bg-primary text-primary-foreground text-lg font-bold rounded-full">{selectedPromo.discount}</span>
                  )}
                  <button onClick={() => setSelectedPromo(null)} className="p-2 rounded-full hover:bg-muted">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-lg font-bold mb-2">{selectedPromo.title}</h2>
                {selectedPromo.description && <p className="text-muted-foreground mb-4">{selectedPromo.description}</p>}
                {selectedPromo.valid_until && (
                  <p className="text-xs text-secondary font-medium mb-4 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {t.validUntil}: {format(new Date(selectedPromo.valid_until), 'dd MMM yyyy')}
                  </p>
                )}
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-full font-medium text-sm">
                    <MessageCircle className="w-4 h-4" />
                    {t.whatsappShare}
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-muted text-foreground rounded-full font-medium text-sm">
                    <Phone className="w-4 h-4" />
                    {t.contactDealer}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            {visibleNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{t.noNotifications}</p>
              </div>
            ) : (
              visibleNotifications.map((notification, index) => {
                const trans = notification.translations;
                const lang = language as string;
                const displayTitle = (trans && trans[lang]?.title) || notification.title;
                const displayMessage = (trans && trans[lang]?.message) || notification.message;
                return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedNotification({ ...notification, _displayTitle: displayTitle, _displayMessage: displayMessage })}
                  className="bg-card rounded-xl p-4 shadow-card border border-border/50 cursor-pointer hover:shadow-card-hover transition-all active:scale-[0.98]"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{displayTitle}</h3>
                        {notification.status === 'scheduled' && (
                          <span className="px-1.5 py-0.5 text-xs bg-sky-blue/20 text-sky-blue rounded-full">Upcoming</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{displayMessage}</p>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {notification.sent_at
                          ? format(new Date(notification.sent_at), 'dd MMM yyyy, hh:mm a')
                          : notification.scheduled_at
                            ? format(new Date(notification.scheduled_at), 'dd MMM yyyy, hh:mm a')
                            : format(new Date(notification.created_at), 'dd MMM yyyy, hh:mm a')}
                      </p>
                    </div>
                  </div>
                </motion.div>
                );
              })
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
                  onClick={() => setSelectedNews(item)}
                  className="bg-card rounded-xl overflow-hidden shadow-card border border-border/50 cursor-pointer hover:shadow-card-hover transition-all active:scale-[0.98]"
                >
                  {item.image_url && (
                    <img src={item.image_url} alt={item.title} className="w-full h-32 object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {item.category && (
                        <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs font-medium rounded-full">{item.category}</span>
                      )}
                      {item.source && <span className="text-xs text-muted-foreground">{item.source}</span>}
                    </div>
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    {item.content && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.content}</p>}
                    <p className="text-xs text-muted-foreground mt-3">{format(new Date(item.published_at), 'dd MMM yyyy')}</p>
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
                  onClick={() => setSelectedPromo(promo)}
                  className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl overflow-hidden shadow-card border border-primary/20 cursor-pointer hover:shadow-card-hover transition-all active:scale-[0.98]"
                >
                  {promo.image_url && (
                    <img src={promo.image_url} alt={promo.title} className="w-full h-32 object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-sm">{promo.title}</h3>
                      {promo.discount && (
                        <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-bold rounded-full">{promo.discount}</span>
                      )}
                    </div>
                    {promo.description && <p className="text-sm text-muted-foreground">{promo.description}</p>}
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
