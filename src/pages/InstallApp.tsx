import { useState, useEffect } from "react";
import { Download, Smartphone, Share, MoreVertical, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallApp = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
      <div className="p-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-6">
        <img src="/pwa-icon-512.png" alt="Krushi Mitra" className="w-24 h-24 rounded-2xl shadow-lg" />
        <h1 className="text-2xl font-bold text-green-800">Install Krushi Mitra</h1>

        {isInstalled ? (
          <div className="bg-green-100 text-green-800 p-4 rounded-xl">
            <p className="font-medium">✅ App is already installed!</p>
            <p className="text-sm mt-1">Open it from your home screen.</p>
          </div>
        ) : deferredPrompt ? (
          <Button
            onClick={handleInstall}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white gap-2 text-lg px-8 py-6 rounded-xl"
          >
            <Download className="h-5 w-5" />
            Install App
          </Button>
        ) : isIOS ? (
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4 max-w-sm">
            <p className="font-semibold text-gray-700">iPhone / iPad वर Install करा:</p>
            <div className="space-y-3 text-left text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg"><Share className="h-5 w-5 text-blue-600" /></div>
                <p>1. Safari मध्ये <strong>Share</strong> बटण दाबा</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg"><Plus className="h-5 w-5 text-blue-600" /></div>
                <p>2. <strong>"Add to Home Screen"</strong> निवडा</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg"><Smartphone className="h-5 w-5 text-green-600" /></div>
                <p>3. Home Screen वरून App उघडा</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4 max-w-sm">
            <p className="font-semibold text-gray-700">Android वर Install करा:</p>
            <div className="space-y-3 text-left text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg"><MoreVertical className="h-5 w-5 text-blue-600" /></div>
                <p>1. Browser मध्ये <strong>⋮ Menu</strong> दाबा</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg"><Download className="h-5 w-5 text-blue-600" /></div>
                <p>2. <strong>"Install App"</strong> किंवा <strong>"Add to Home Screen"</strong> निवडा</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg"><Smartphone className="h-5 w-5 text-green-600" /></div>
                <p>3. Home Screen वरून App उघडा</p>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-4">No app store needed • Works offline • Free</p>
      </div>
    </div>
  );
};

export default InstallApp;
