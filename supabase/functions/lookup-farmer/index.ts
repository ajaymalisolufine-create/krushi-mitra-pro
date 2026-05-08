import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { phone } = await req.json();
    if (!phone || !/^[6-9]\d{9}$/.test(String(phone).replace(/\D/g, '').slice(-10))) {
      return new Response(JSON.stringify({ error: "Invalid mobile number" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const tenDigit = String(phone).replace(/\D/g, '').slice(-10);
    const e164 = `+91${tenDigit}`;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data } = await supabaseAdmin
      .from("user_profiles")
      .select("name, email, phone, pincode, city, district, state, language, selected_crop")
      .or(`phone.eq.${e164},phone.eq.${tenDigit}`)
      .limit(1)
      .maybeSingle();

    return new Response(
      JSON.stringify({ exists: !!data, profile: data || null }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || "lookup failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
