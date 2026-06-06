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
  templateInput: string,
  phone: string,
  otp: string,
): Promise<{ ok: boolean; detail?: unknown }> {
  const mobile = `91${String(phone).replace(/\D/g, "").slice(-10)}`;
  const rawTemplate = String(templateInput || "").trim();
  const clean = (value?: string | null) => {
    const trimmed = String(value || "").trim();
    return trimmed && !/^<.*>$/.test(trimmed) ? trimmed : "";
  };
  const quoted = (key: string) => {
    const m = rawTemplate.match(new RegExp(`['"]${key}['"]\\s*:\\s*(?:['"]([^'"]*)['"]|null)`, "i"));
    return clean(m?.[1]);
  };
  const headerAuth = rawTemplate.match(/authkey['"]?\s*,\s*['"]([^'"]+)['"]/i)?.[1]
    || rawTemplate.match(/['"]authkey['"]\s*:\s*['"]([^'"]+)['"]/i)?.[1];
  const effectiveAuthKey = clean(Deno.env.get("MSG91_AUTH_KEY")) || clean(authKey) || clean(headerAuth);

  if (!effectiveAuthKey || !rawTemplate) {
    return { ok: false, detail: "Missing MSG91 WhatsApp auth key or template code" };
  }

  const looksLikeOutboundSnippet = /whatsapp-outbound-message|integrated_number|to_and_components|messaging_product/i.test(rawTemplate);

  try {
    if (looksLikeOutboundSnippet) {
      const integratedNumber = quoted("integrated_number");
      const templateName = rawTemplate.match(/['"]template['"]\s*:\s*\{[\s\S]*?['"]name['"]\s*:\s*['"]([^'"]+)['"]/i)?.[1]
        || quoted("name")
        || clean(rawTemplate);
      const languageCode = rawTemplate.match(/['"]language['"]\s*:\s*\{[\s\S]*?['"]code['"]\s*:\s*['"]([^'"]+)['"]/i)?.[1]
        || "en";
      const namespaceMatch = rawTemplate.match(/['"]namespace['"]\s*:\s*(?:['"]([^'"]*)['"]|null)/i);
      const namespace = clean(namespaceMatch?.[1]);

      if (!integratedNumber || !templateName) {
        return { ok: false, detail: "Invalid MSG91 WhatsApp JavaScript snippet: integrated_number or template name missing" };
      }

      const res = await fetch("https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          authkey: effectiveAuthKey,
        },
        body: JSON.stringify({
          integrated_number: integratedNumber,
          content_type: "template",
          payload: {
            messaging_product: "whatsapp",
            type: "template",
            template: {
              name: templateName,
              language: { code: languageCode, policy: "deterministic" },
              namespace: namespace || null,
              to_and_components: [
                {
                  to: [mobile],
                  components: {
                    body_1: { type: "text", value: otp },
                    button_1: { subtype: "url", type: "text", value: otp },
                  },
                },
              ],
            },
          },
        }),
      });
      const detail = await res.json().catch(() => ({}));
      const ok = res.ok && (detail?.type ? detail.type !== "error" : true) && detail?.status !== "fail";
      if (!ok) console.error("MSG91 WhatsApp outbound failed:", JSON.stringify(detail));
      return { ok, detail };
    }

    const url = new URL("https://control.msg91.com/api/v5/otp");
    url.searchParams.set("template_id", rawTemplate);
    url.searchParams.set("mobile", mobile);
    url.searchParams.set("otp", otp);
    url.searchParams.set("authkey", effectiveAuthKey);
    url.searchParams.set("realTimeResponse", "1");

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        authkey: effectiveAuthKey,
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
      const msg91AuthKey = Deno.env.get("MSG91_AUTH_KEY") || cfg.msg91_auth_key || "";

      // WhatsApp channel (MSG91 OTP API + app_otp Template Code)
      // Note: the auth key may live in the saved Auth Key field OR be embedded
      // inside the pasted JavaScript snippet — sendViaMsg91Whatsapp resolves both.
      const waEnabled = cfg.whatsapp_enabled === "true" || cfg.whatsapp_enabled === "1";
      if (waEnabled && cfg.msg91_whatsapp_template_id) {
        const result = await sendViaMsg91Whatsapp(
          msg91AuthKey,
          cfg.msg91_whatsapp_template_id,
          phone,
          otp,
        );
        whatsappSent = result.ok;
        if (!result.ok) {
          console.error("[OTP] WhatsApp delivery failed:", JSON.stringify(result.detail));
        }
      }

      // SMS channel (MSG91 Flow API) — used as fallback or when WhatsApp didn't send
      const smsEnabled = cfg.sms_enabled === "true" || cfg.sms_enabled === "1";
      if (!whatsappSent && smsEnabled && msg91AuthKey && cfg.msg91_template_id) {
        const result = await sendViaMsg91(
          msg91AuthKey,
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
