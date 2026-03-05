import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import InstallApp from "./pages/InstallApp";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminProducts } from "./components/admin/AdminProducts";
import { AdminPromotions } from "./components/admin/AdminPromotions";
import { AdminVideos } from "./components/admin/AdminVideos";
import { AdminNews } from "./components/admin/AdminNews";
import { AdminNotifications } from "./components/admin/AdminNotifications";
import { AdminDealers } from "./components/admin/AdminDealers";
import { AdminSettings } from "./components/admin/AdminSettings";
import { AdminBanners } from "./components/admin/AdminBanners";
import { PopupNotification } from "./components/PopupNotification";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PopupNotification />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/install" element={<InstallApp />} />
            
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="promotions" element={<AdminPromotions />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="videos" element={<AdminVideos />} />
              <Route path="news" element={<AdminNews />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="dealers" element={<AdminDealers />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
