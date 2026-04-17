import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AppProvider } from "@/contexts/AppContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import InstallApp from "./pages/InstallApp";
import { PopupNotification } from "./components/PopupNotification";

const AdminLayout = lazy(() => import("./components/admin/AdminLayout").then((module) => ({ default: module.AdminLayout })));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard").then((module) => ({ default: module.AdminDashboard })));
const AdminProducts = lazy(() => import("./components/admin/AdminProducts").then((module) => ({ default: module.AdminProducts })));
const AdminPromotions = lazy(() => import("./components/admin/AdminPromotions").then((module) => ({ default: module.AdminPromotions })));
const AdminVideos = lazy(() => import("./components/admin/AdminVideos").then((module) => ({ default: module.AdminVideos })));
const AdminNews = lazy(() => import("./components/admin/AdminNews").then((module) => ({ default: module.AdminNews })));
const AdminNotifications = lazy(() => import("./components/admin/AdminNotifications").then((module) => ({ default: module.AdminNotifications })));
const AdminDealers = lazy(() => import("./components/admin/AdminDealers").then((module) => ({ default: module.AdminDealers })));
const AdminSettings = lazy(() => import("./components/admin/AdminSettings").then((module) => ({ default: module.AdminSettings })));
const AdminBanners = lazy(() => import("./components/admin/AdminBanners").then((module) => ({ default: module.AdminBanners })));
const AdminFarmerActivity = lazy(() => import("./components/admin/AdminFarmerActivity").then((module) => ({ default: module.AdminFarmerActivity })));
const AdminLeads = lazy(() => import("./components/admin/AdminLeads").then((module) => ({ default: module.AdminLeads })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      gcTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
    mutations: {
      retry: 0,
    },
  },
});

const RouteLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PopupNotification />
        <BrowserRouter>
          <Suspense fallback={<RouteLoader />}>
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
                <Route path="farmer-activity" element={<AdminFarmerActivity />} />
                <Route path="leads" element={<AdminLeads />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
