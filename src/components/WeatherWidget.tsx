import { motion } from 'framer-motion';
import { Cloud, Sun, CloudRain, Wind, Droplets, MapPin } from 'lucide-react';

interface WeatherData {
  day: string;
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy';
  humidity: number;
}

const weekForecast: WeatherData[] = [
  { day: 'आज', temp: 32, condition: 'sunny', humidity: 45 },
  { day: 'उद्या', temp: 30, condition: 'cloudy', humidity: 55 },
  { day: 'बुध', temp: 28, condition: 'rainy', humidity: 78 },
  { day: 'गुरु', temp: 31, condition: 'sunny', humidity: 42 },
  { day: 'शुक्र', temp: 33, condition: 'sunny', humidity: 38 },
  { day: 'शनि', temp: 29, condition: 'cloudy', humidity: 60 },
  { day: 'रवि', temp: 27, condition: 'rainy', humidity: 82 },
];

const getWeatherIcon = (condition: string) => {
  switch (condition) {
    case 'sunny': return Sun;
    case 'cloudy': return Cloud;
    case 'rainy': return CloudRain;
    default: return Sun;
  }
};

const getConditionColor = (condition: string) => {
  switch (condition) {
    case 'sunny': return 'text-harvest-gold';
    case 'cloudy': return 'text-muted-foreground';
    case 'rainy': return 'text-sky-blue';
    default: return 'text-harvest-gold';
  }
};

export const WeatherWidget = () => {
  const today = weekForecast[0];
  const TodayIcon = getWeatherIcon(today.condition);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-hero rounded-2xl p-5 text-primary-foreground shadow-card overflow-hidden relative"
    >
      {/* Background decoration */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-harvest-gold/20 rounded-full blur-xl" />
      
      <div className="relative z-10">
        {/* Location */}
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-medium opacity-90">सांगली, महाराष्ट्र</span>
        </div>

        {/* Today's weather */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-5xl font-bold">{today.temp}°</p>
            <p className="text-sm opacity-80 mt-1">आजचे हवामान</p>
          </div>
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <TodayIcon className="w-16 h-16 text-harvest-gold" />
          </motion.div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <Droplets className="w-4 h-4" />
            <span className="text-sm">{today.humidity}%</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <Wind className="w-4 h-4" />
            <span className="text-sm">12 km/h</span>
          </div>
        </div>

        {/* 7-day forecast */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {weekForecast.slice(1).map((day, index) => {
            const DayIcon = getWeatherIcon(day.condition);
            return (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center gap-1 bg-white/10 rounded-xl px-3 py-2 min-w-[60px]"
              >
                <span className="text-xs opacity-80">{day.day}</span>
                <DayIcon className={`w-5 h-5 ${getConditionColor(day.condition)}`} />
                <span className="text-sm font-semibold">{day.temp}°</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
