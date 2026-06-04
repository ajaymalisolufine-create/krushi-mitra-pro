import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Send the OTP over SMS using MSG91 (low-cost India provider).
 * Credentials are stored in the app_settings table (editable from Admin Settings),
 * NOT in Lovable secrets, so the admin can update them manually any time.
 * Returns true only when MSG91 accepts the request.
 */
async function sendViaMsg91(
  authKey: string,
  templateId: string,
  senderId: string | null,
  phone: string,
  otp: string,
): Promise<{ ok: boolean; detail?: unknown }> {
  const mobile = `91${String(phone).replace(/\D/g, "").slice(-10)}`;
  try {
    const res = await fetch("https://control.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        authkey: authKey,
      },
      body: JSON.stringify({
        template_id: templateId,
        short_url: "0",
        ...(senderId ? { sender: senderId } : {}),
        recipients: [
          {
            mobiles: mobile,
            // Common variable names used in MSG91 OTP templates.
            // Map the one your DLT template actually uses (e.g. ##otp##).
            otp,
            OTP: otp,
            var1: otp,
          },
        ],
      }),
    });
    const detail = await res.json().catch(() => ({}));
    const ok = res.ok && (detail?.type ? detail.type !== "error" : true);
    if (!ok) console.error("MSG91 send failed:", JSON.stringify(detail));
    return { ok, detail };
  } catch (e) {
    console.error("MSG91 request error:", e);
    return { ok: false, detail: String(e) };
  }
}

/**
 * Send the OTP over WhatsApp using the MSG91 OTP API.
 * Uses the "app_otp" Template Code (configured for WhatsApp channel in MSG91)
 * plus the same MSG91 Auth Key. We pass our own pre-generated OTP so it matches
 * the code stored in otp_codes (verified by verify-otp).
 */
async function sendViaMsg91Whatsapp(
  authKey: string,
  templateId: string,
  phone: string,
  otp: string,
): Promise<{ ok: boolean; detail?: unknown }> {
  const mobile = `91${String(phone).replace(/\D/g, "").slice(-10)}`;
  try {
    const url = new URL("https://control.msg91.com/api/v5/otp");
    url.searchParams.set("template_id", templateId);
    url.searchParams.set("mobile", mobile);
    url.searchParams.set("otp", otp);
    url.searchParams.set("authkey", authKey);
    url.searchParams.set("realTimeResponse", "1");

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        authkey: authKey,
      },
      body: JSON.stringify({ otp }),
    });
    const detail = await res.json().catch(() => ({}));
    const ok = res.ok && (detail?.type ? detail.type !== "error" : true);
    if (!ok) console.error("MSG91 WhatsApp send failed:", JSON.stringify(detail));
    return { ok, detail };
  } catch (e) {
    console.error("MSG91 WhatsApp request error:", e);
    return { ok: false, detail: String(e) };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, phone } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: "Valid email address required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limit: max 3 OTPs per email per 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("otp_codes")
      .select("*", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", tenMinutesAgo);

    if ((count ?? 0) >= 3) {
      return new Response(
        JSON.stringify({ error: "Too many OTP requests. Please wait 10 minutes." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Store OTP
    const { error: insertError } = await supabaseAdmin.from("otp_codes").insert({
      email,
      phone: phone || email, // backward compat - phone column stores identifier
      otp_code: otp,
      expires_at: expiresAt,
    });

    if (insertError) throw insertError;

    // Load OTP provider config from app_settings (manually editable in Admin Settings)
    let smsSent = false;
    let whatsappSent = false;
    if (phone) {
      const { data: rows } = await supabaseAdmin
        .from("app_settings")
        .select("key, value")
        .in("key", [
          "sms_enabled",
          "msg91_auth_key",
          "msg91_template_id",
          "msg91_sender_id",
          "whatsapp_enabled",
          "msg91_whatsapp_template_id",
        ]);

      const cfg: Record<string, string> = {};
      (rows || []).forEach((r: { key: string; value: string }) => { cfg[r.key] = r.value; });

      // WhatsApp channel (MSG91 OTP API + app_otp Template Code)
      const waEnabled = cfg.whatsapp_enabled === "true" || cfg.whatsapp_enabled === "1";
      if (waEnabled && cfg.msg91_auth_key && cfg.msg91_whatsapp_template_id) {
        const result = await sendViaMsg91Whatsapp(
          cfg.msg91_auth_key,
          cfg.msg91_whatsapp_template_id,
          phone,
          otp,
        );
        whatsappSent = result.ok;
      }

      // SMS channel (MSG91 Flow API) — used as fallback or when WhatsApp didn't send
      const smsEnabled = cfg.sms_enabled === "true" || cfg.sms_enabled === "1";
      if (!whatsappSent && smsEnabled && cfg.msg91_auth_key && cfg.msg91_template_id) {
        const result = await sendViaMsg91(
          cfg.msg91_auth_key,
          cfg.msg91_template_id,
          cfg.msg91_sender_id || null,
          phone,
          otp,
        );
        smsSent = result.ok;
      }
    }

    const delivered = whatsappSent || smsSent;
    console.log(
      `[OTP] Generated for ${email} (phone: ${phone || "n/a"}) — WhatsApp: ${whatsappSent}, SMS: ${smsSent}`,
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: whatsappSent
          ? "OTP sent to your WhatsApp number"
          : smsSent
          ? "OTP sent to your mobile number"
          : "OTP generated",
        sms_sent: smsSent,
        whatsapp_sent: whatsappSent,
        expires_in: 300,
        // Only expose the code when no real delivery happened (dev / fallback).
        ...(delivered ? {} : { otp }),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-otp error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send OTP" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
