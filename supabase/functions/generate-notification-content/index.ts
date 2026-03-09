import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, category, context, contentType } = await req.json();

    if (!title) {
      return new Response(
        JSON.stringify({ error: "Title is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const contentTypeContext: Record<string, string> = {
      notification: "notification for farmers about",
      product: "agricultural product description for",
      news: "agriculture news article about",
      promotion: "promotional offer for farmers about",
    };

    const categoryContext: Record<string, string> = {
      news: "agricultural news, government schemes, market updates, or farming innovations",
      offer: "product discounts, special deals, seasonal offers on fertilizers, pesticides, or farm inputs",
      video: "educational farming videos, crop care tutorials, product usage demonstrations",
      update: "app updates, new features, important announcements for farmers",
    };

    const type = contentType || "notification";
    const typeDesc = contentTypeContext[type] || contentTypeContext.notification;
    const catDesc = categoryContext[category] || "";

    const systemPrompt = `You are an expert agricultural marketing copywriter for Indian farmers. You write in a professional, trust-building, and conversion-focused tone — similar to top agricultural brands and marketplaces.

Rules:
- Write clear, persuasive descriptions that build trust with Indian farmers
- Use simple language that farmers in rural Maharashtra/India can understand
- Be professional and competitive, optimized for agriculture users
- Content must work perfectly even without any image or video
- Keep descriptions concise (2-3 sentences max for message)
- Include a sense of urgency or value proposition where appropriate
- DO NOT use excessive emojis (1-2 max if appropriate)
- Output must be ready to publish with proper formatting

You must respond with a JSON object containing translations in 3 languages with this exact structure:
{
  "en": { "title": "...", "message": "..." },
  "mr": { "title": "...", "message": "..." },
  "hi": { "title": "...", "message": "..." }
}

The translations must preserve the EXACT same meaning and intent across all languages. The Marathi and Hindi should feel natural, not machine-translated.`;

    const userPrompt = `Generate a compelling ${typeDesc} Indian farmers.

Title/Topic: "${title}"
${category ? `Category: ${category} (${catDesc})` : ""}
${context ? `Additional context/description: ${context}` : ""}

Create a compelling title and descriptive message for each language (English, Marathi, Hindi). The message should be 2-3 sentences that clearly explain the value to farmers and encourage action.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI generation failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content generated");
    }

    let parsed;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse generated content");
    }

    return new Response(
      JSON.stringify({
        translations: parsed,
        title_en: parsed.en?.title || title,
        message_en: parsed.en?.message || "",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-notification-content error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
