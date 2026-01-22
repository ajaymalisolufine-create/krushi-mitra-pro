import { motion } from 'framer-motion';
import { Bell, FileText, AlertTriangle, Gift, CheckCircle, Download } from 'lucide-react';

interface Notification {
  id: number;
  type: 'info' | 'warning' | 'offer' | 'success';
  title: string;
  message: string;
  time: string;
  hasAttachment?: boolean;
  read: boolean;
}

const notifications: Notification[] = [
  {
    id: 1,
    type: 'offer',
    title: 'नवीन ऑफर! 🎉',
    message: 'THUNDER वर 20% सूट - फक्त या आठवड्यासाठी',
    time: '१ तास पूर्वी',
    read: false,
  },
  {
    id: 2,
    type: 'warning',
    title: 'हवामान सूचना ⚠️',
    message: 'पुढील ३ दिवसांत पावसाची शक्यता - फवारणी टाळा',
    time: '३ तास पूर्वी',
    read: false,
  },
  {
    id: 3,
    type: 'info',
    title: 'नवीन PDF मार्गदर्शक',
    message: 'द्राक्ष छाटणी तंत्र - संपूर्ण मार्गदर्शिका',
    time: 'काल',
    hasAttachment: true,
    read: true,
  },
  {
    id: 4,
    type: 'success',
    title: 'ऑर्डर पुष्टी ✓',
    message: 'तुमची TANGENT ऑर्डर यशस्वीरित्या नोंदवली गेली',
    time: '२ दिवसांपूर्वी',
    read: true,
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'info': return FileText;
    case 'warning': return AlertTriangle;
    case 'offer': return Gift;
    case 'success': return CheckCircle;
    default: return Bell;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'info': return 'bg-sky-blue/20 text-sky-blue';
    case 'warning': return 'bg-sunrise-orange/20 text-sunrise-orange';
    case 'offer': return 'bg-harvest-gold/20 text-accent';
    case 'success': return 'bg-secondary/20 text-secondary';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const NotificationsSection = () => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-5 h-5 text-primary" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <h2 className="text-lg font-semibold">सूचना</h2>
        </div>
        <button className="text-sm text-secondary font-medium">
          सर्व वाचलेले करा
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((notification, index) => {
          const Icon = getNotificationIcon(notification.type);
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-card rounded-xl p-4 shadow-card border border-border/50 cursor-pointer transition-all hover:shadow-card-hover ${
                !notification.read ? 'border-l-4 border-l-primary' : ''
              }`}
            >
              <div className="flex gap-3">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getNotificationColor(notification.type)}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-medium text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {notification.time}
                    </span>
                    {notification.hasAttachment && (
                      <button className="flex items-center gap-1 text-xs text-secondary font-medium">
                        <Download className="w-3 h-3" />
                        PDF डाउनलोड
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
