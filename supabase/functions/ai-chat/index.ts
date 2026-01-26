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
    const { messages, language, selectedCrop } = await req.json();

    const systemMessage = {
      role: 'system',
      content: SYSTEM_PROMPT + (selectedCrop ? `\n\nThe user is primarily growing: ${selectedCrop}. Tailor advice to this crop when relevant.` : '') + `\n\nRespond in: ${language === 'mr' ? 'Marathi' : language === 'hi' ? 'Hindi' : 'English'}`,
    };

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [systemMessage, ...messages],
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
