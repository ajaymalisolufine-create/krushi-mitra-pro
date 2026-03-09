import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { batch_id } = await req.json();
    if (!batch_id) return new Response(JSON.stringify({ error: "batch_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Find products that were just imported and need translations
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, description, translations")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw error;

    const needsTranslation = (products || []).filter((p: any) => {
      const t = p.translations || {};
      return p.description && (!t.mr || !t.hi);
    });

    if (!lovableApiKey || needsTranslation.length === 0) {
      return new Response(JSON.stringify({ translated: 0, message: "No translations needed or API key missing" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let translatedCount = 0;

    // Process in small batches to avoid timeouts
    const batchSize = 5;
    for (let i = 0; i < Math.min(needsTranslation.length, 20); i += batchSize) {
      const batch = needsTranslation.slice(i, i + batchSize);

      for (const product of batch) {
        try {
          const prompt = `Translate the following agricultural product description to Marathi and Hindi. Product: "${product.name}". Description: "${product.description}". Return JSON only: {"mr": {"title": "...", "message": "..."}, "hi": {"title": "...", "message": "..."}, "en": {"title": "${product.name}", "message": "${product.description}"}}`;

          const aiRes = await fetch("https://api.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${lovableApiKey}` },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-lite",
              messages: [{ role: "user", content: prompt }],
              max_tokens: 1000,
            }),
          });

          if (aiRes.ok) {
            const aiData = await aiRes.json();
            const content = aiData.choices?.[0]?.message?.content || "";
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const translations = JSON.parse(jsonMatch[0]);
              const merged = { ...(product.translations || {}), ...translations };
              await supabase.from("products").update({ translations: merged }).eq("id", product.id);
              translatedCount++;
            }
          }
        } catch (e) {
          console.error(`Translation failed for ${product.name}:`, e);
        }
      }
    }

    return new Response(JSON.stringify({ translated: translatedCount }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
