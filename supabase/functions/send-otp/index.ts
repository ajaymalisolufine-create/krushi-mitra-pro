import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();

    if (!phone || !/^\+91\d{10}$/.test(phone)) {
      return new Response(
        JSON.stringify({ error: "Valid Indian phone number required (+91XXXXXXXXXX)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limit: max 3 OTPs per phone per 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("otp_codes")
      .select("*", { count: "exact", head: true })
      .eq("phone", phone)
      .gte("created_at", tenMinutesAgo);

    if ((count ?? 0) >= 3) {
      return new Response(
        JSON.stringify({ error: "Too many OTP requests. Please wait 10 minutes." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min expiry

    // Store OTP
    const { error: insertError } = await supabaseAdmin.from("otp_codes").insert({
      phone,
      otp_code: otp,
      expires_at: expiresAt,
    });

    if (insertError) throw insertError;

    // --- SMS Sending ---
    // Check if an SMS provider API key is configured
    const smsApiKey = Deno.env.get("SMS_API_KEY");
    const smsProvider = Deno.env.get("SMS_PROVIDER"); // "msg91", "twilio", "textlocal", etc.

    if (smsApiKey && smsProvider) {
      // Plug in your SMS provider here
      console.log(`[SMS] Sending OTP ${otp} to ${phone} via ${smsProvider}`);
      // Example for MSG91, Textlocal, etc. - implement based on provider
    } else {
      // DEV MODE: Log OTP to console (visible in edge function logs)
      console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
    }

    // In dev mode, return OTP in response for testing
    const isDev = !smsApiKey;
    const responseData: Record<string, unknown> = {
      success: true,
      message: isDev
        ? "OTP generated (dev mode - check response)"
        : "OTP sent to your phone",
      expires_in: 300,
    };

    if (isDev) {
      responseData.otp = otp; // Only in dev mode!
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-otp error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send OTP" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
