import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are Solufine Krushi Mitra, an agricultural assistant for Solufine Agro Pvt. Ltd. You ONLY provide information about:

1. Solufine Products:
- THUNDER: Bio-stimulant for enhanced growth. Dosage: 2-3ml per liter of water. Best for grapes, pomegranate, and cotton.
- TANGENT: Micronutrient blend for healthy crops. Dosage: 1-2ml per liter. Suitable for all crops.
- MARINUS: Seaweed extract for stress tolerance. Dosage: 2ml per liter. Excellent for grapes and sugarcane.
- SHIELD: Plant protection formula. Dosage: 2-3ml per liter. For pest resistance.

2. Crop-specific advice for: Grapes (द्राक्षे), Chickpea (हरभरा), Cotton (कापूस), Sugarcane (ऊस), Pomegranate (डाळिंब), Onion (कांदा)

3. Spray schedules and timing based on crop growth stages

4. General agricultural best practices for Maharashtra region

IMPORTANT RULES:
- ONLY answer questions about agriculture and Solufine products
- If asked about anything unrelated to agriculture or Solufine, politely redirect to agricultural topics
- Respond in the same language as the user's query
- Keep responses concise and practical
- Include dosage and application info when discussing products
- Be helpful and encouraging to farmers`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages, language, selectedCrop } = body as {
      messages?: unknown;
      language?: unknown;
      selectedCrop?: unknown;
    };

    // --- Input validation / sanitization ---
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (messages.length > 30) {
      return new Response(
        JSON.stringify({ error: 'Too many messages' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const allowedRoles = new Set(['user', 'assistant']);
    const sanitizedMessages = [];
    for (const msg of messages) {
      if (!msg || typeof msg !== 'object') {
        return new Response(
          JSON.stringify({ error: 'Invalid message format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const { role, content } = msg as { role?: unknown; content?: unknown };
      if (typeof role !== 'string' || !allowedRoles.has(role)) {
        return new Response(
          JSON.stringify({ error: 'Invalid message role' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (typeof content !== 'string' || content.trim().length === 0) {
        return new Response(
          JSON.stringify({ error: 'Invalid message content' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (content.length > 2000) {
        return new Response(
          JSON.stringify({ error: 'Message too long' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      sanitizedMessages.push({ role, content: content.slice(0, 2000) });
    }

    const safeLanguage = language === 'mr' || language === 'hi' || language === 'en' ? language : 'mr';
    const safeCrop = typeof selectedCrop === 'string' ? selectedCrop.replace(/[\n\r]/g, ' ').slice(0, 60) : '';

    const systemMessage = {
      role: 'system',
      content: SYSTEM_PROMPT + (safeCrop ? `\n\nThe user is primarily growing: ${safeCrop}. Tailor advice to this crop when relevant.` : '') + `\n\nRespond in: ${safeLanguage === 'mr' ? 'Marathi' : safeLanguage === 'hi' ? 'Hindi' : 'English'}`,
    };

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [systemMessage, ...sanitizedMessages],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI Gateway error:', error);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantResponse = data.choices?.[0]?.message?.content || 'No response generated';

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    // Log full detail server-side only; return a generic message to the client.
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred. Please try again later.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
