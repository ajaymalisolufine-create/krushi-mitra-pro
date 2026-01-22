import { WeatherWidget } from './WeatherWidget';
import { NewsFeed } from './NewsFeed';
import { CropCalendar } from './CropCalendar';

export const DashboardView = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <WeatherWidget />
      <CropCalendar />
      <NewsFeed />
    </div>
  );
};
