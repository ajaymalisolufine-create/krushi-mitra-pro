import { WeatherWidget } from './WeatherWidget';
import { TrendingProducts } from './TrendingProducts';
import { BestSellingProducts } from './BestSellingProducts';
import { PromotionsCarousel } from './PromotionsCarousel';
import { NewsFeed } from './NewsFeed';
import { VideosSection } from './VideosSection';

export const DashboardView = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <WeatherWidget />
      <PromotionsCarousel />
      <TrendingProducts />
      <BestSellingProducts />
      <NewsFeed />
      <VideosSection />
    </div>
  );
};
