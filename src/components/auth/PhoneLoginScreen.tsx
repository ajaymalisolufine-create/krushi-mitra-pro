import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mail, Loader2, MapPin, User, Navigation, RefreshCw, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from '@/hooks/use-toast';
import { indianStates } from '@/lib/crops';

interface PhoneLoginScreenProps {
  onComplete: () => void;
}

type Step = 'phone' | 'form' | 'otp';

export const PhoneLoginScreen = ({ onComplete }: PhoneLoginScreenProps) => {
  const { language, setPincode, trackInteraction } = useApp();
  const [step, setStep] = useState<Step>('phone');
  const [isExisting, setIsExisting] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pincode, setPincodeLocal] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [latLng, setLatLng] = useState<{ lat: number; lng: number } | null>(null);

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [gpsError, setGpsError] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);

  const getText = (mr: string, hi: string, en: string) =>
    language === 'mr' ? mr : language === 'hi' ? hi : en;

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validatePincode = (c: string) => /^[1-9][0-9]{5}$/.test(c);
  const validatePhone = (p: string) => /^[6-9]\d{9}$/.test(p);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const fetchGps = useCallback(async (silent = false) => {
    if (!navigator.geolocation) {
      setGpsError(true);
      if (!silent) toast({ title: getText('त्रुटी', 'त्रुटि', 'Error'), description: getText('GPS उपलब्ध नाही', 'GPS उपलब्ध नहीं', 'GPS not available'), variant: 'destructive' });
      return false;
    }
    setIsFetchingLocation(true);
    setGpsError(false);
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 15000, enableHighAccuracy: true })
      );
      const { latitude, longitude } = pos.coords;
      setLatLng({ lat: latitude, lng: longitude });
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
        const d = await r.json();
        if (d.address) {
          if (d.address.postcode) setPincodeLocal(d.address.postcode);
          const v = d.address.village || d.address.town || d.address.city;
          if (v) setCity(v);
          if (d.address.county || d.address.state_district) setDistrict(d.address.county || d.address.state_district);
          if (d.address.state) {
            const m = indianStates.find(s =>
              d.address.state.toLowerCase().includes(s.toLowerCase()) ||
              s.toLowerCase().includes(d.address.state.toLowerCase())
            );
            if (m) setState(m);
          }
        }
      } catch { /* nominatim fail ok */ }
      toast({ title: getText('स्थान मिळाले', 'स्थान प्राप्त', 'Location detected'), description: getText('माहिती भरली', 'जानकारी भरी', 'Auto-filled') });
      return true;
    } catch {
      setGpsError(true);
      if (!silent) {
        toast({
          title: getText('स्थान आवश्यक', 'स्थान आवश्यक', 'Location Required'),
          description: getText(
            'AgriConsult वापरण्यासाठी स्थान परवानगी आवश्यक आहे',
            'AgriConsult उपयोग के लिए स्थान अनुमति आवश्यक है',
            'Location access is required to use AgriConsult Farmer Advisory Platform.'
          ),
          variant: 'destructive',
        });
      }
      return false;
    } finally {
      setIsFetchingLocation(false);
    }
  }, [language]);

  // Step 1: Lookup phone
  const checkPhone = async () => {
    if (!validatePhone(phone)) {
      toast({ title: getText('त्रुटी', 'त्रुटि', 'Error'), description: getText('कृपया वैध 10 अंकी मोबाइल नंबर प्रविष्ट करा', 'कृपया वैध 10 अंकी मोबाइल नंबर दर्ज करें', 'Please enter valid 10-digit mobile number.'), variant: 'destructive' });
      return;
    }
    setCheckingPhone(true);
    try {
      const { data, error } = await supabase.functions.invoke('lookup-farmer', { body: { phone } });
      if (error) throw error;
      if (data?.exists && data?.profile) {
        const p = data.profile;
        setIsExisting(true);
        setName(p.name || '');
        setEmail(p.email || '');
        setPincodeLocal(p.pincode || '');
        setCity(p.city || '');
        setDistrict(p.district || '');
        setState(p.state || '');
        toast({ title: getText('स्वागत आहे!', 'स्वागत है!', 'Welcome back!'), description: getText('तुमची माहिती आधीपासून आहे', 'आपकी जानकारी पहले से है', 'Your details already exist.') });
        // existing → still need GPS for security/refresh? Per spec, GPS mandatory at registration. For existing users we skip the form and go to OTP.
        if (!p.email) {
          // edge case: profile w/o email — must collect
          setStep('form');
        } else {
          await sendOtpInternal(p.email);
        }
      } else {
        setIsExisting(false);
        // New farmer → require GPS upfront
        const ok = await fetchGps();
        if (!ok) return;
        setStep('form');
      }
    } catch (e: any) {
      toast({ title: getText('त्रुटी', 'त्रुटि', 'Error'), description: e.message || 'Lookup failed', variant: 'destructive' });
    } finally {
      setCheckingPhone(false);
    }
  };

  const sendOtpInternal = async (toEmail: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', { body: { email: toEmail } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.otp) setGeneratedOtp(data.otp);
      await trackInteraction('phone_login', 'otp_sent', { phone, email: toEmail });
      setStep('otp');
      setResendTimer(60);
      toast({
        title: getText('OTP तयार झाला', 'OTP तैयार हुआ', 'OTP Generated'),
        description: getText(`तुमचा 6 अंकी OTP: ${data?.otp || ''}`, `आपका 6 अंकी OTP: ${data?.otp || ''}`, `Your 6-digit OTP: ${data?.otp || ''}`),
        duration: 30000,
      });
    } catch (e: any) {
      toast({ title: getText('त्रुटी', 'त्रुटि', 'Error'), description: e.message || 'Failed to send OTP', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    name.trim().length > 0 &&
    validateEmail(email) &&
    validatePhone(phone) &&
    validatePincode(pincode) &&
    state.length > 0 &&
    !!latLng;

  const submitForm = async () => {
    if (!latLng) {
      const ok = await fetchGps();
      if (!ok) return;
    }
    if (!name.trim()) return toast({ title: getText('त्रुटी', 'त्रुटि', 'Error'), description: getText('कृपया नाव प्रविष्ट करा', 'कृपया नाम दर्ज करें', 'Please enter your name'), variant: 'destructive' });
    if (!validateEmail(email)) return toast({ title: getText('त्रुटी', 'त्रुटि', 'Error'), description: getText('कृपया वैध ईमेल प्रविष्ट करा', 'कृपया वैध ईमेल दर्ज करें', 'Please enter a valid email'), variant: 'destructive' });
    if (!validatePincode(pincode)) return toast({ title: getText('त्रुटी', 'त्रुटि', 'Error'), description: getText('कृपया वैध 6 अंकी पिनकोड प्रविष्ट करा', 'कृपया वैध 6 अंकी पिनकोड दर्ज करें', 'Please enter a valid 6-digit pincode'), variant: 'destructive' });
    if (!state) return toast({ title: getText('त्रुटी', 'त्रुटि', 'Error'), description: getText('कृपया राज्य निवडा', 'कृपया राज्य चुनें', 'Please select a state'), variant: 'destructive' });
    await sendOtpInternal(email);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({ title: getText('त्रुटी', 'त्रुटि', 'Error'), description: getText('कृपया 6 अंकी OTP प्रविष्ट करा', 'कृपया 6 अंकी OTP दर्ज करें', 'Please enter the 6-digit OTP'), variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: {
          email,
          otp,
          name: name || null,
          phone: phone ? `+91${phone}` : null,
          pincode,
          city: city || null,
          district: district || null,
          state: state || 'Maharashtra',
          language,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.session) {
        await supabase.auth.setSession({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
      }
      setPincode(pincode);
      localStorage.setItem('user_pincode', pincode);
      localStorage.setItem('user_state', state);
      localStorage.setItem('user_name', name);
      localStorage.setItem('user_phone', phone);
      if (latLng) localStorage.setItem('user_gps', JSON.stringify(latLng));

      await trackInteraction('phone_login', 'login_success', { phone, email, state, city, district, isExisting, gps: latLng });
      toast({ title: getText('यशस्वी!', 'सफल!', 'Success!'), description: getText('तुम्ही लॉग इन झालात', 'आप लॉग इन हो गए', 'You are now logged in') });
      onComplete();
    } catch (e: any) {
      toast({ title: getText('त्रुटी', 'त्रुटि', 'Error'), description: e.message || 'Failed to verify OTP', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    await sendOtpInternal(email);
  };

  return (
    <div className="min-h-screen bg-gradient-sunrise flex flex-col items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-card">
            {step === 'phone' ? <Phone className="w-7 h-7 text-white" /> : <Mail className="w-7 h-7 text-white" />}
          </motion.div>
          <h1 className="text-lg font-bold text-foreground mb-1">
            {step === 'phone' && getText('मोबाइल नंबर', 'मोबाइल नंबर', 'Enter Mobile Number')}
            {step === 'form' && getText('नोंदणी करा', 'रजिस्टर करें', 'Register')}
            {step === 'otp' && getText('OTP प्रविष्ट करा', 'OTP दर्ज करें', 'Enter OTP')}
          </h1>
          <p className="text-xs text-muted-foreground">
            {step === 'phone' && getText('आम्ही तपासू की तुम्ही आधीच नोंदणी केली आहे का', 'हम जांचेंगे कि आप पहले से पंजीकृत हैं या नहीं', 'We will check if you are already registered')}
            {step === 'form' && getText('तुमची माहिती भरा', 'अपनी जानकारी भरें', 'Fill your details')}
            {step === 'otp' && getText(`${email} साठी OTP तयार`, `${email} के लिए OTP तैयार`, `OTP generated for ${email}`)}
          </p>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-card border border-border space-y-4">
          {step === 'phone' && (
            <>
              <div>
                <label className="block text-xs font-medium mb-1">
                  <Phone className="w-3 h-3 inline mr-1" />
                  {getText('मोबाइल नंबर', 'मोबाइल नंबर', 'Mobile Number')} *
                </label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-muted rounded-md border border-input text-sm text-muted-foreground">+91</span>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onKeyDown={(e) => { if (e.key === 'Enter' && validatePhone(phone)) checkPhone(); }}
                    className="h-11 flex-1 text-base"
                    maxLength={10}
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{getText('10 अंकी, फक्त अंक', '10 अंक, केवल संख्या', '10 digits, numbers only')}</p>
              </div>
              <Button onClick={checkPhone} disabled={checkingPhone || !validatePhone(phone)} className="w-full h-11 bg-gradient-hero hover:opacity-90">
                {checkingPhone ? <Loader2 className="w-5 h-5 animate-spin" /> : getText('पुढे', 'आगे बढ़ें', 'Continue')}
              </Button>
            </>
          )}

          {step === 'form' && (
            <>
              <div className={`p-3 rounded-lg border ${latLng ? 'bg-secondary/10 border-secondary/30' : 'bg-destructive/10 border-destructive/30'}`}>
                <div className="flex items-start gap-2">
                  {latLng ? <CheckCircle className="w-4 h-4 text-secondary mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />}
                  <div className="flex-1">
                    <p className="text-xs font-medium">
                      {latLng
                        ? getText('स्थान आढळले', 'स्थान मिला', 'Location detected')
                        : getText('स्थान परवानगी आवश्यक', 'स्थान अनुमति आवश्यक', 'Location access is required')}
                    </p>
                    {!latLng && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {getText('AgriConsult वापरण्यासाठी', 'AgriConsult उपयोग के लिए', 'to use AgriConsult Farmer Advisory Platform')}
                      </p>
                    )}
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={() => fetchGps()} disabled={isFetchingLocation} className="h-7 text-xs">
                    {isFetchingLocation ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3 mr-1" />}
                    {latLng ? getText('परत मिळवा', 'पुनः लें', 'Retry') : getText('परवानगी द्या', 'अनुमति दें', 'Allow')}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1"><Phone className="w-3 h-3 inline mr-1" />{getText('मोबाइल नंबर', 'मोबाइल नंबर', 'Mobile Number')} *</label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-muted rounded-md border border-input text-sm text-muted-foreground">+91</span>
                  <Input type="tel" value={phone} disabled className="h-10 flex-1 opacity-70" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1"><User className="w-3 h-3 inline mr-1" />{getText('नाव', 'नाम', 'Name')} *</label>
                <Input type="text" placeholder={getText('तुमचे नाव', 'आपका नाम', 'Your name')} value={name} onChange={(e) => setName(e.target.value)} className="h-10" />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1"><Mail className="w-3 h-3 inline mr-1" />{getText('ईमेल', 'ईमेल', 'Email')} *</label>
                <Input type="email" placeholder="farmer@example.com" value={email} onChange={(e) => setEmail(e.target.value.trim())} className="h-10" />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">{getText('राज्य', 'राज्य', 'State')} *</label>
                <select value={state} onChange={(e) => setState(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="">{getText('राज्य निवडा', 'राज्य चुनें', 'Select State')}</option>
                  {indianStates.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" />{getText('पिनकोड', 'पिनकोड', 'Pincode')} *</label>
                <Input type="tel" placeholder="416410" value={pincode} onChange={(e) => setPincodeLocal(e.target.value.replace(/\D/g, '').slice(0, 6))} className="h-10" maxLength={6} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">{getText('गाव/शहर', 'गांव/शहर', 'Village/City')} *</label>
                  <Input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="h-10" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">{getText('जिल्हा', 'जिला', 'District')} *</label>
                  <Input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} className="h-10" />
                </div>
              </div>

              <Button onClick={submitForm} disabled={isLoading || !isFormValid} className="w-full h-11 bg-gradient-hero hover:opacity-90">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : getText('OTP पाठवा', 'OTP भेजें', 'Send OTP')}
              </Button>
              {!latLng && (
                <p className="text-[11px] text-destructive text-center">
                  {getText('स्थान परवानगीशिवाय नोंदणी पूर्ण करता येणार नाही', 'स्थान अनुमति बिना पंजीकरण पूरा नहीं होगा', 'Cannot complete registration without location permission')}
                </p>
              )}
            </>
          )}

          {step === 'otp' && (
            <>
              {generatedOtp && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{getText('तुमचा OTP', 'आपका OTP', 'Your OTP Code')}</p>
                  <p className="text-2xl font-bold text-primary tracking-widest">{generatedOtp}</p>
                </div>
              )}
              <div className="flex justify-center">
                <InputOTP value={otp} onChange={setOtp} maxLength={6}>
                  <InputOTPGroup>
                    {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} />)}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button onClick={handleVerifyOTP} disabled={isLoading || otp.length !== 6} className="w-full h-11 bg-gradient-hero hover:opacity-90">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : getText('सत्यापित करा', 'सत्यापित करें', 'Verify')}
              </Button>
              <Button variant="ghost" onClick={handleResendOtp} disabled={resendTimer > 0 || isLoading} className="w-full text-sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                {resendTimer > 0
                  ? getText(`${resendTimer}s नंतर पुन्हा पाठवा`, `${resendTimer}s बाद पुनः भेजें`, `Resend in ${resendTimer}s`)
                  : getText('OTP पुन्हा पाठवा', 'OTP पुनः भेजें', 'Resend OTP')}
              </Button>
              <Button variant="ghost" onClick={() => { setStep(isExisting ? 'phone' : 'form'); setOtp(''); setGeneratedOtp(null); }} className="w-full text-xs">
                {getText('मागे जा', 'पीछे जाएं', 'Go Back')}
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
