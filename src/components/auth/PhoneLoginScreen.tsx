import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from '@/hooks/use-toast';

interface PhoneLoginScreenProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const PhoneLoginScreen = ({ onComplete, onSkip }: PhoneLoginScreenProps) => {
  const { language, setPhone, trackInteraction } = useApp();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getText = (mr: string, hi: string, en: string) => {
    switch (language) {
      case 'mr': return mr;
      case 'hi': return hi;
      default: return en;
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

    setIsLoading(true);
    try {
      const fullPhone = `+91${cleanPhone}`;
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      });

      if (error) throw error;

      await trackInteraction('phone_login', 'otp_sent', { phone: fullPhone });
      setStep('otp');
      toast({
        title: getText('OTP पाठवला', 'OTP भेजा गया', 'OTP Sent'),
        description: getText('कृपया तुमच्या फोनवर आलेला OTP प्रविष्ट करा', 'कृपया अपने फोन पर आए OTP को दर्ज करें', 'Please enter the OTP sent to your phone'),
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
      const { error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

      setPhone(fullPhone);
      await trackInteraction('phone_login', 'login_success', { phone: fullPhone });
      
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

  return (
    <div className="min-h-screen bg-gradient-sunrise flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-card"
          >
            <Phone className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-xl font-bold text-foreground mb-2">
            {step === 'phone' 
              ? getText('मोबाइल नंबर प्रविष्ट करा', 'मोबाइल नंबर दर्ज करें', 'Enter Mobile Number')
              : getText('OTP प्रविष्ट करा', 'OTP दर्ज करें', 'Enter OTP')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {step === 'phone'
              ? getText('आम्ही तुम्हाला OTP पाठवू', 'हम आपको OTP भेजेंगे', 'We\'ll send you an OTP')
              : getText(`+91 ${phoneNumber} वर OTP पाठवला`, `+91 ${phoneNumber} पर OTP भेजा गया`, `OTP sent to +91 ${phoneNumber}`)}
          </p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-6">
          {step === 'phone' ? (
            <>
              <div className="flex gap-2">
                <div className="w-16 h-12 rounded-xl bg-muted flex items-center justify-center text-sm font-medium">
                  🇮🇳 +91
                </div>
                <Input
                  type="tel"
                  placeholder="9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="h-12 text-lg"
                  maxLength={10}
                />
              </div>
              <Button
                onClick={handleSendOTP}
                disabled={isLoading || phoneNumber.length !== 10}
                className="w-full h-12 bg-gradient-hero hover:opacity-90"
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
              <div className="flex justify-center">
                <InputOTP
                  value={otp}
                  onChange={setOtp}
                  maxLength={6}
                >
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
                className="w-full h-12 bg-gradient-hero hover:opacity-90"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  getText('सत्यापित करा', 'सत्यापित करें', 'Verify')
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setStep('phone')}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {getText('नंबर बदला', 'नंबर बदलें', 'Change Number')}
              </Button>
            </>
          )}
        </div>

        {/* Skip Option */}
        {onSkip && (
          <Button
            variant="ghost"
            onClick={onSkip}
            className="w-full mt-4 text-muted-foreground"
          >
            {getText('नंतर करा', 'बाद में करें', 'Skip for now')}
          </Button>
        )}
      </motion.div>
    </div>
  );
};
