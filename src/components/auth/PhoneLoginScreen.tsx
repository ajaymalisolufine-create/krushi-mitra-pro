import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Loader2, ArrowLeft, MapPin, User, Navigation } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from '@/hooks/use-toast';
import { indianStates } from '@/lib/crops';

interface PhoneLoginScreenProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const PhoneLoginScreen = ({ onComplete, onSkip }: PhoneLoginScreenProps) => {
  const { language, setPhone, setPincode, trackInteraction } = useApp();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [pincode, setPincodeLocal] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const getText = (mr: string, hi: string, en: string) => {
    switch (language) {
      case 'mr': return mr;
      case 'hi': return hi;
      default: return en;
    }
  };

  const validatePincode = (code: string) => /^[1-9][0-9]{5}$/.test(code);

  const fetchLocationFromGPS = async () => {
    setIsFetchingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
      });

      const { latitude, longitude } = position.coords;
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
      const data = await res.json();
      
      if (data.address) {
        if (data.address.postcode) setPincodeLocal(data.address.postcode);
        if (data.address.city || data.address.town || data.address.village) {
          setCity(data.address.city || data.address.town || data.address.village || '');
        }
        if (data.address.county || data.address.state_district) {
          setDistrict(data.address.county || data.address.state_district || '');
        }
        if (data.address.state) {
          const matchedState = indianStates.find(s => 
            data.address.state.toLowerCase().includes(s.toLowerCase()) ||
            s.toLowerCase().includes(data.address.state.toLowerCase())
          );
          if (matchedState) setState(matchedState);
        }
        toast({
          title: getText('स्थान मिळाले', 'स्थान प्राप्त हुआ', 'Location Found'),
          description: getText('माहिती भरली गेली', 'जानकारी भरी गई', 'Details auto-filled'),
        });
      }
    } catch (error) {
      toast({
        title: getText('त्रुटी', 'त्रुटि', 'Error'),
        description: getText('स्थान मिळवता आले नाही', 'स्थान प्राप्त नहीं हो सका', 'Could not get location. Please fill manually.'),
        variant: 'destructive',
      });
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const handleSendOTP = async () => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      toast({
        title: getText('त्रुटी', 'त्रुटि', 'Error'),
        description: getText('कृपया वैध 10 अंकी मोबाइल नंबर प्रविष्ट करा', 'कृपया वैध 10 अंकी मोबाइल नंबर दर्ज करें', 'Please enter a valid 10-digit mobile number'),
        variant: 'destructive',
      });
      return;
    }

    if (!validatePincode(pincode)) {
      toast({
        title: getText('त्रुटी', 'त्रुटि', 'Error'),
        description: getText('कृपया वैध 6 अंकी पिनकोड प्रविष्ट करा', 'कृपया वैध 6 अंकी पिनकोड दर्ज करें', 'Please enter a valid 6-digit pincode'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = `+91${cleanPhone}`;
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: fullPhone },
      });

      if (error) throw new Error(error.message || 'Failed to send OTP');
      if (data?.error) throw new Error(data.error);

      // Dev mode: show OTP if returned
      if (data?.otp) {
        setDevOtp(data.otp);
      }

      await trackInteraction('phone_login', 'otp_sent', { phone: fullPhone, pincode });
      setStep('otp');
      toast({
        title: getText('OTP पाठवला', 'OTP भेजा गया', 'OTP Sent'),
        description: data?.otp
          ? getText(`Dev Mode OTP: ${data.otp}`, `Dev Mode OTP: ${data.otp}`, `Dev Mode OTP: ${data.otp}`)
          : getText('कृपया तुमच्या फोनवर आलेला OTP प्रविष्ट करा', 'कृपया अपने फोन पर आए OTP को दर्ज करें', 'Please enter the OTP sent to your phone'),
      });
    } catch (error: any) {
      toast({
        title: getText('त्रुटी', 'त्रुटि', 'Error'),
        description: error.message || getText('OTP पाठवता आला नाही', 'OTP भेजने में विफल', 'Failed to send OTP'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: getText('त्रुटी', 'त्रुटि', 'Error'),
        description: getText('कृपया 6 अंकी OTP प्रविष्ट करा', 'कृपया 6 अंकी OTP दर्ज करें', 'Please enter the 6-digit OTP'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = `+91${phoneNumber.replace(/\D/g, '')}`;
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: {
          phone: fullPhone,
          otp,
          name: name || null,
          pincode,
          city: city || null,
          district: district || null,
          state: state || 'Maharashtra',
          language,
        },
      });

      if (error) throw new Error(error.message || 'Failed to verify OTP');
      if (data?.error) throw new Error(data.error);

      // Set the session from the response
      if (data?.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      setPhone(fullPhone);
      setPincode(pincode);
      localStorage.setItem('user_pincode', pincode);
      localStorage.setItem('user_state', state);
      localStorage.setItem('user_name', name);
      
      await trackInteraction('phone_login', 'login_success', { phone: fullPhone, pincode, state, city, district });
      
      toast({
        title: getText('यशस्वी!', 'सफल!', 'Success!'),
        description: getText('तुम्ही लॉग इन झालात', 'आप लॉग इन हो गए', 'You are now logged in'),
      });
      
      onComplete();
    } catch (error: any) {
      toast({
        title: getText('त्रुटी', 'त्रुटि', 'Error'),
        description: error.message || getText('OTP सत्यापित करता आला नाही', 'OTP सत्यापित करने में विफल', 'Failed to verify OTP'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isPhoneFormValid = phoneNumber.length === 10 && validatePincode(pincode);

  return (
    <div className="min-h-screen bg-gradient-sunrise flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-card"
          >
            <Phone className="w-7 h-7 text-white" />
          </motion.div>
          <h1 className="text-lg font-bold text-foreground mb-1">
            {step === 'phone' 
              ? getText('नोंदणी करा', 'रजिस्टर करें', 'Register')
              : getText('OTP प्रविष्ट करा', 'OTP दर्ज करें', 'Enter OTP')}
          </h1>
          <p className="text-xs text-muted-foreground">
            {step === 'phone'
              ? getText('तुमची माहिती भरा', 'अपनी जानकारी भरें', 'Fill your details')
              : getText(`+91 ${phoneNumber} वर OTP पाठवला`, `+91 ${phoneNumber} पर OTP भेजा गया`, `OTP sent to +91 ${phoneNumber}`)}
          </p>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-card border border-border space-y-4">
          {step === 'phone' ? (
            <>
              {/* GPS Auto-fill */}
              <Button
                type="button"
                variant="outline"
                onClick={fetchLocationFromGPS}
                disabled={isFetchingLocation}
                className="w-full flex items-center gap-2"
              >
                {isFetchingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4 text-primary" />
                )}
                {getText('GPS ने स्थान भरा', 'GPS से स्थान भरें', 'Auto-fill with GPS')}
              </Button>

              {/* Name */}
              <div>
                <label className="block text-xs font-medium mb-1">
                  <User className="w-3 h-3 inline mr-1" />
                  {getText('नाव', 'नाम', 'Name')}
                </label>
                <Input
                  type="text"
                  placeholder={getText('तुमचे नाव', 'आपका नाम', 'Your name')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium mb-1">
                  {getText('मोबाइल नंबर', 'मोबाइल नंबर', 'Mobile Number')} *
                </label>
                <div className="flex gap-2">
                  <div className="w-14 h-10 rounded-lg bg-muted flex items-center justify-center text-xs font-medium">
                    🇮🇳 +91
                  </div>
                  <Input
                    type="tel"
                    placeholder="9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="h-10"
                    maxLength={10}
                  />
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-medium mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-primary" />
                  {getText('पिनकोड', 'पिनकोड', 'Pincode')} *
                </label>
                <Input
                  type="tel"
                  placeholder="416410"
                  value={pincode}
                  onChange={(e) => setPincodeLocal(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="h-10"
                  maxLength={6}
                />
              </div>

              {/* City & District */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    {getText('शहर/गाव', 'शहर/गांव', 'City/Village')}
                  </label>
                  <Input
                    type="text"
                    placeholder={getText('शहर', 'शहर', 'City')}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    {getText('जिल्हा', 'जिला', 'District')}
                  </label>
                  <Input
                    type="text"
                    placeholder={getText('जिल्हा', 'जिला', 'District')}
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-medium mb-1">
                  {getText('राज्य', 'राज्य', 'State')} *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {indianStates.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <Button
                onClick={handleSendOTP}
                disabled={isLoading || !isPhoneFormValid}
                className="w-full h-11 bg-gradient-hero hover:opacity-90"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  getText('OTP पाठवा', 'OTP भेजें', 'Send OTP')
                )}
              </Button>
            </>
          ) : (
            <>
              {/* Dev mode OTP hint */}
              {devOtp && (
                <div className="bg-accent/20 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">{getText('Dev Mode OTP', 'Dev Mode OTP', 'Dev Mode OTP')}</p>
                  <p className="text-lg font-bold text-primary tracking-widest">{devOtp}</p>
                </div>
              )}

              <div className="flex justify-center">
                <InputOTP value={otp} onChange={setOtp} maxLength={6}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.length !== 6}
                className="w-full h-11 bg-gradient-hero hover:opacity-90"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  getText('सत्यापित करा', 'सत्यापित करें', 'Verify')
                )}
              </Button>
              <Button variant="ghost" onClick={() => { setStep('phone'); setDevOtp(null); }} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {getText('नंबर बदला', 'नंबर बदलें', 'Change Number')}
              </Button>
            </>
          )}
        </div>

        {onSkip && (
          <Button variant="ghost" onClick={onSkip} className="w-full mt-4 text-muted-foreground">
            {getText('नंतर करा', 'बाद में करें', 'Skip for now')}
          </Button>
        )}
      </motion.div>
    </div>
  );
};
