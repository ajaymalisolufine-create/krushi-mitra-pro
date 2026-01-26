import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, Mic, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const AIAssistantScreen = () => {
  const { language, selectedCrop, trackInteraction } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getText = (mr: string, hi: string, en: string) => {
    switch (language) {
      case 'mr': return mr;
      case 'hi': return hi;
      default: return en;
    }
  };

  const getWelcomeMessage = () => {
    const cropText = selectedCrop ? ` (${selectedCrop})` : '';
    switch (language) {
      case 'mr':
        return `नमस्कार! मी सोल्युफाइन कृषी सहाय्यक आहे. 🌱\n\nमी तुम्हाला खालील विषयांवर मदत करू शकतो:\n- सोल्युफाइन उत्पादनांची माहिती\n- डोस आणि वापर मार्गदर्शन\n- पीक${cropText} संबंधित सल्ला\n\nतुमचा प्रश्न विचारा!`;
      case 'hi':
        return `नमस्ते! मैं सोल्युफाइन कृषि सहायक हूं। 🌱\n\nमैं आपकी निम्नलिखित विषयों में मदद कर सकता हूं:\n- सोल्युफाइन उत्पादों की जानकारी\n- खुराक और उपयोग मार्गदर्शन\n- फसल${cropText} संबंधित सलाह\n\nअपना सवाल पूछें!`;
      default:
        return `Hello! I'm the Solufine Agricultural Assistant. 🌱\n\nI can help you with:\n- Solufine product information\n- Dosage and usage guidance\n- Crop${cropText} related advice\n\nAsk your question!`;
    }
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: getWelcomeMessage(),
      }]);
    }
  }, [language, selectedCrop]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickReplies = language === 'mr' 
    ? ['THUNDER डोस काय आहे?', 'द्राक्षासाठी कोणते उत्पादन?', 'फवारणी वेळापत्रक']
    : language === 'hi'
    ? ['THUNDER की खुराक क्या है?', 'अंगूर के लिए कौन सा उत्पाद?', 'छिड़काव का समय']
    : ['What is THUNDER dosage?', 'Product for grapes?', 'Spray schedule'];

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    await trackInteraction('ai_assistant', 'send_message', { message: inputValue });

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [...messages.filter(m => m.id !== 'welcome'), userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          language,
          selectedCrop,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || getText(
          'माफ करा, मला समजले नाही. कृपया पुन्हा प्रयत्न करा.',
          'क्षमा करें, मैं समझ नहीं पाया। कृपया फिर से प्रयास करें।',
          'Sorry, I didn\'t understand. Please try again.'
        ),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getText(
          'माफ करा, तांत्रिक अडचण आली. कृपया पुन्हा प्रयत्न करा.',
          'क्षमा करें, तकनीकी समस्या आई। कृपया फिर से प्रयास करें।',
          'Sorry, there was a technical issue. Please try again.'
        ),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] -mx-4 -my-4">
      {/* Header */}
      <div className="bg-gradient-hero p-4 text-white flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold">{getText('कृषी मित्र AI', 'कृषि मित्र AI', 'Krushi Mitra AI')}</h3>
          <p className="text-xs text-white/80">{getText('ऑनलाइन', 'ऑनलाइन', 'Online')}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-card text-foreground rounded-bl-sm shadow-card border border-border'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                message.content
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-card px-4 py-3 rounded-2xl rounded-bl-sm shadow-card border border-border">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto bg-background border-t border-border">
        {quickReplies.map((reply) => (
          <button
            key={reply}
            onClick={() => setInputValue(reply)}
            className="px-3 py-1.5 bg-muted rounded-full text-xs font-medium text-muted-foreground whitespace-nowrap hover:bg-primary/10 hover:text-primary transition-colors"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border flex gap-2 bg-background">
        <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
          <Mic className="w-5 h-5 text-muted-foreground" />
        </button>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={getText('प्रश्न विचारा...', 'सवाल पूछें...', 'Ask a question...')}
          className="flex-1 px-4 py-2 bg-muted rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !inputValue.trim()}
          className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
