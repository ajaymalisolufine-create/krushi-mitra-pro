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
    const { email, otp, name, phone, pincode, city, district, state, language } = await req.json();

    if (!email || !otp) {
      return new Response(
        JSON.stringify({ error: "Email and OTP are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find the latest unexpired, unverified OTP for this email
    const { data: otpRecord, error: fetchError } = await supabaseAdmin
      .from("otp_codes")
      .select("*")
      .eq("email", email)
      .eq("verified", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !otpRecord) {
      return new Response(
        JSON.stringify({ error: "OTP expired or not found. Please request a new one." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check max attempts (5)
    if (otpRecord.attempts >= 5) {
      return new Response(
        JSON.stringify({ error: "Too many failed attempts. Please request a new OTP." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Increment attempts
    await supabaseAdmin
      .from("otp_codes")
      .update({ attempts: otpRecord.attempts + 1 })
      .eq("id", otpRecord.id);

    // Verify OTP
    if (otpRecord.otp_code !== otp) {
      return new Response(
        JSON.stringify({ error: "Invalid OTP. Please try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark OTP as verified
    await supabaseAdmin
      .from("otp_codes")
      .update({ verified: true })
      .eq("id", otpRecord.id);

    // Create or get user using admin API
    let userId: string;

    // Prefer matching by phone first (true unique identifier).
    // Accept both E.164 (+91XXXXXXXXXX) and bare 10-digit formats.
    let existingProfile: any = null;
    if (phone) {
      const tenDigit = String(phone).replace(/\D/g, "").slice(-10);
      const e164 = `+91${tenDigit}`;
      const { data: pp } = await supabaseAdmin
        .from("user_profiles")
        .select("user_id, email")
        .or(`phone.eq.${e164},phone.eq.${tenDigit}`)
        .limit(1)
        .maybeSingle();
      if (pp) existingProfile = pp;
    }

    if (existingProfile?.user_id) {
      userId = existingProfile.user_id;
    } else {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = userList?.users?.find((u) => u.email === email);
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const randomPassword = crypto.randomUUID();
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
          password: randomPassword,
        });
        if (createError) throw createError;
        userId = newUser.user.id;
      }
    }

    // Upsert user profile (merge by user_id)
    const { error: profileError } = await supabaseAdmin.from("user_profiles").upsert(
      {
        user_id: userId,
        email,
        phone: phone || null,
        name: name || null,
        pincode: pincode || null,
        city: city || null,
        district: district || null,
        state: state || "Maharashtra",
        language: language || "mr",
      },
      { onConflict: "user_id" }
    );

    if (profileError) {
      console.error("Profile upsert error:", profileError);
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    // Create a session without changing the user's password. The previous temp-password
    // handoff could race or fail with "Invalid login credentials" on some auth nodes.
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (linkError) throw linkError;

    const tokenHash = linkData?.properties?.hashed_token;
    if (!tokenHash) throw new Error("Unable to create login session");

    const { data: signInData, error: signInError } = await supabaseClient.auth.verifyOtp({
      type: "magiclink",
      token_hash: tokenHash,
    });

    if (signInError) throw signInError;

    return new Response(
      JSON.stringify({
        success: true,
        session: signInData.session,
        user: signInData.user,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("verify-otp error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to verify OTP" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
