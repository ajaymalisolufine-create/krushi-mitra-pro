import { motion } from 'framer-motion';
import { Phone, MapPin, Mail, MessageCircle, ExternalLink, Loader2, AlertCircle, LogOut } from 'lucide-react';
import { useDealersByPincode } from '@/hooks/useDealers';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export const ContactScreen = () => {
  const { language, trackInteraction, pincode, signOut } = useApp();
  const { data: dealers = [], isLoading } = useDealersByPincode(pincode);
  
  const getText = (mr: string, hi: string, en: string) => {
    switch (language) {
      case 'mr': return mr;
      case 'hi': return hi;
      default: return en;
    }
  };

  const handleCall = async (phone: string, dealerName: string) => {
    await trackInteraction('contact', 'call_dealer', { dealer: dealerName, phone });
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = async (phone: string, dealerName: string) => {
    await trackInteraction('contact', 'whatsapp_dealer', { dealer: dealerName, phone });
    const message = encodeURIComponent(getText(
      'नमस्कार, मला सोल्युफाइन उत्पादनांबद्दल माहिती हवी आहे.',
      'नमस्ते, मुझे सोल्युफाइन उत्पादों के बारे में जानकारी चाहिए।',
      'Hello, I would like information about Solufine products.'
    ));
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleDirections = async (lat: number, lng: number, dealerName: string) => {
    await trackInteraction('contact', 'directions_dealer', { dealer: dealerName });
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.removeItem('onboarding_complete');
      toast({
        title: getText('लॉग आउट यशस्वी', 'लॉग आउट सफल', 'Logged Out'),
        description: getText('तुम्ही यशस्वीरित्या लॉग आउट झालात', 'आप सफलतापूर्वक लॉग आउट हो गए', 'You have been logged out successfully'),
      });
      window.location.reload();
    } catch {
      toast({
        title: getText('त्रुटी', 'त्रुटि', 'Error'),
        description: getText('लॉग आउट करता आले नाही', 'लॉग आउट नहीं हो सका', 'Failed to log out'),
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-bold text-foreground mb-2">
          {getText('संपर्क करा', 'संपर्क करें', 'Contact Us')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {getText('जवळचे विक्रेते शोधा', 'नजदीकी विक्रेता खोजें', 'Find dealers near you')}
        </p>
        {pincode && (
          <p className="text-xs text-primary mt-1 flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3" />
            {getText(`पिनकोड: ${pincode}`, `पिनकोड: ${pincode}`, `Pincode: ${pincode}`)}
          </p>
        )}
      </div>

      {/* Company Contact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-hero rounded-2xl p-5 text-white"
      >
        <h2 className="font-semibold mb-3">Solufine Agritech Pvt. Ltd.</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>Miraj, Maharashtra 416410</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>+91 9876543210</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>info@solufine.com</span>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant="secondary"
            className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={() => handleCall('+919876543210', 'Solufine HQ')}
          >
            <Phone className="w-4 h-4 mr-1" />
            {getText('कॉल', 'कॉल', 'Call')}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={() => handleWhatsApp('+919876543210', 'Solufine HQ')}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            WhatsApp
          </Button>
        </div>
      </motion.div>

      {/* Dealers List */}
      <div>
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          {pincode 
            ? getText(`${pincode} जवळचे विक्रेते`, `${pincode} के नजदीकी विक्रेता`, `Dealers Near ${pincode}`)
            : getText('जवळचे विक्रेते', 'नजदीकी विक्रेता', 'Nearby Dealers')
          }
        </h2>

        {dealers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl p-6 shadow-card border border-border text-center"
          >
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-2">
              {getText(
                'तुमच्या भागात विक्रेते नाहीत',
                'आपके क्षेत्र में कोई विक्रेता नहीं',
                'No dealers found in your area'
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              {getText(
                'कंपनीशी थेट संपर्क साधा',
                'कंपनी से सीधे संपर्क करें',
                'Contact the company directly'
              )}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {dealers.map((dealer, index) => (
              <motion.div
                key={dealer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl p-4 shadow-card border border-border"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{dealer.name}</h3>
                    <p className="text-sm text-muted-foreground">{dealer.city}</p>
                    {dealer.pincode && (
                      <p className="text-xs text-primary">📍 {dealer.pincode}</p>
                    )}
                  </div>
                  {dealer.lat && dealer.lng && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDirections(Number(dealer.lat), Number(dealer.lng), dealer.name)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {dealer.address && (
                  <p className="text-xs text-muted-foreground mb-3">{dealer.address}</p>
                )}
                <div className="flex gap-2">
                  {dealer.phone && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleCall(dealer.phone!, dealer.name)}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      {getText('कॉल', 'कॉल', 'Call')}
                    </Button>
                  )}
                  {dealer.phone && (
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleWhatsApp(dealer.phone!, dealer.name)}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      WhatsApp
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Logout Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {getText('लॉग आउट', 'लॉग आउट', 'Logout')}
        </Button>
      </motion.div>
    </div>
  );
};
