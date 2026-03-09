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
    const { phone, otp, name, pincode, city, district, state, language } = await req.json();

    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ error: "Phone and OTP are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find the latest unexpired, unverified OTP for this phone
    const { data: otpRecord, error: fetchError } = await supabaseAdmin
      .from("otp_codes")
      .select("*")
      .eq("phone", phone)
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
    // First check if user exists with this phone
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u) => u.phone === phone);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user with phone
      const randomPassword = crypto.randomUUID();
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        phone,
        phone_confirm: true,
        password: randomPassword,
      });

      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // Upsert user profile
    const { error: profileError } = await supabaseAdmin.from("user_profiles").upsert(
      {
        user_id: userId,
        phone,
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

    // Generate a session token for the user
    // Use signInWithPassword won't work since we used random password
    // Instead, generate a magic link token or use admin to create session
    // We'll use admin.generateLink to create a magic link
    const { data: tokenData, error: tokenError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        phone,
      });

    // Since generateLink with phone may not work, let's use a workaround:
    // Set a known password temporarily, sign in, then the session persists
    const tempPassword = `otp_verified_${crypto.randomUUID()}`;
    await supabaseAdmin.auth.admin.updateUser(userId, { password: tempPassword });

    // Create a regular client to sign in
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { data: signInData, error: signInError } =
      await supabaseClient.auth.signInWithPassword({
        phone,
        password: tempPassword,
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
