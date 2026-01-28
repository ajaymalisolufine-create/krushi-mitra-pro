import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Sun, CloudRain, Wind, Droplets, MapPin, Loader2, CloudSnow, Thermometer } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  description: string;
}

interface ForecastDay {
  day: string;
  temp: number;
  condition: string;
}

const OPENWEATHER_API_KEY = '4d8fb5b93d4af21d66a2948710284366'; // Free tier key

const getWeatherIcon = (iconCode: string) => {
  if (iconCode.includes('01') || iconCode.includes('02')) return Sun;
  if (iconCode.includes('03') || iconCode.includes('04')) return Cloud;
  if (iconCode.includes('09') || iconCode.includes('10')) return CloudRain;
  if (iconCode.includes('13')) return CloudSnow;
  return Sun;
};

const stateLocations: Record<string, { city: string; lat: number; lon: number }> = {
  'Maharashtra': { city: 'Sangli', lat: 16.8524, lon: 74.5815 },
  'Karnataka': { city: 'Belgaum', lat: 15.8497, lon: 74.4977 },
  'Gujarat': { city: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
  'Madhya Pradesh': { city: 'Indore', lat: 22.7196, lon: 75.8577 },
  'Rajasthan': { city: 'Jaipur', lat: 26.9124, lon: 75.7873 },
  'Punjab': { city: 'Ludhiana', lat: 30.9010, lon: 75.8573 },
  'Uttar Pradesh': { city: 'Lucknow', lat: 26.8467, lon: 80.9462 },
  'Tamil Nadu': { city: 'Chennai', lat: 13.0827, lon: 80.2707 },
  'Andhra Pradesh': { city: 'Vijayawada', lat: 16.5062, lon: 80.6480 },
  'Telangana': { city: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
};

export const WeatherWidget = () => {
  const { language } = useApp();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userState] = useState('Maharashtra'); // Default state

  const location = stateLocations[userState] || stateLocations['Maharashtra'];

  const getText = (mr: string, hi: string, en: string) => {
    switch (language) {
      case 'mr': return mr;
      case 'hi': return hi;
      default: return en;
    }
  };

  const getDayName = (date: Date, index: number) => {
    if (index === 0) return getText('आज', 'आज', 'Today');
    if (index === 1) return getText('उद्या', 'कल', 'Tomorrow');
    const days = language === 'mr' 
      ? ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि']
      : language === 'hi'
      ? ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Current weather
        const currentRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
        );
        
        if (!currentRes.ok) throw new Error('Weather data unavailable');
        
        const currentData = await currentRes.json();
        
        setWeather({
          temp: Math.round(currentData.main.temp),
          humidity: currentData.main.humidity,
          windSpeed: Math.round(currentData.wind.speed * 3.6), // m/s to km/h
          condition: currentData.weather[0].main,
          icon: currentData.weather[0].icon,
          description: currentData.weather[0].description,
        });

        // 5-day forecast
        const forecastRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
        );
        
        if (forecastRes.ok) {
          const forecastData = await forecastRes.json();
          const dailyForecasts: ForecastDay[] = [];
          const processedDates = new Set<string>();

          for (const item of forecastData.list) {
            const date = new Date(item.dt * 1000);
            const dateStr = date.toDateString();
            
            if (!processedDates.has(dateStr) && dailyForecasts.length < 6) {
              processedDates.add(dateStr);
              dailyForecasts.push({
                day: getDayName(date, dailyForecasts.length),
                temp: Math.round(item.main.temp),
                condition: item.weather[0].icon,
              });
            }
          }
          setForecast(dailyForecasts);
        }
      } catch (err) {
        setError('Unable to load weather');
        console.error('Weather fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, [location.lat, location.lon, language]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-hero rounded-2xl p-5 text-primary-foreground shadow-card flex items-center justify-center h-48"
      >
        <Loader2 className="w-8 h-8 animate-spin" />
      </motion.div>
    );
  }

  if (error || !weather) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-hero rounded-2xl p-5 text-primary-foreground shadow-card"
      >
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-medium opacity-90">{location.city}</span>
        </div>
        <div className="text-center py-4">
          <Thermometer className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm opacity-80">{getText('हवामान उपलब्ध नाही', 'मौसम उपलब्ध नहीं', 'Weather unavailable')}</p>
        </div>
      </motion.div>
    );
  }

  const WeatherIcon = getWeatherIcon(weather.icon);

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
          <span className="text-sm font-medium opacity-90">{location.city}, {userState}</span>
        </div>

        {/* Today's weather */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-5xl font-bold">{weather.temp}°</p>
            <p className="text-sm opacity-80 mt-1 capitalize">{weather.description}</p>
          </div>
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <WeatherIcon className="w-16 h-16 text-harvest-gold" />
          </motion.div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <Droplets className="w-4 h-4" />
            <span className="text-sm">{weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <Wind className="w-4 h-4" />
            <span className="text-sm">{weather.windSpeed} km/h</span>
          </div>
        </div>

        {/* Forecast */}
        {forecast.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {forecast.slice(1).map((day, index) => {
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
                  <DayIcon className="w-5 h-5 text-harvest-gold" />
                  <span className="text-sm font-semibold">{day.temp}°</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};
