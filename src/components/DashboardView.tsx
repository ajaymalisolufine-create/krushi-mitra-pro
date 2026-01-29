import { WeatherWidget } from './WeatherWidget';
import { TrendingProducts } from './TrendingProducts';
import { BestSellingProducts } from './BestSellingProducts';

export const DashboardView = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <WeatherWidget />
      <TrendingProducts />
      <BestSellingProducts />
    </div>
  );
};
