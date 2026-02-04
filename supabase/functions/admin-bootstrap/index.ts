import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type JsonBody = {
  action?: "status" | "bootstrap";
  email?: string;
  password?: string;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "Server not configured" }, 500);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const getHasAdmins = async () => {
      const { count, error } = await adminClient
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");

      if (error) throw error;
      return (count ?? 0) > 0;
    };

    if (req.method === "GET") {
      const hasAdmins = await getHasAdmins();
      return jsonResponse({ hasAdmins });
    }

    let body: JsonBody = {};
    try {
      body = (await req.json()) as JsonBody;
    } catch {
      body = {};
    }

    const action = body.action ?? "status";

    if (action === "status") {
      const hasAdmins = await getHasAdmins();
      return jsonResponse({ hasAdmins });
    }

    if (action !== "bootstrap") {
      return jsonResponse({ error: "Invalid action" }, 400);
    }

    const email = (body.email ?? "").trim();
    const password = body.password ?? "";

    if (!email || !password) {
      return jsonResponse({ error: "Email and password are required" }, 400);
    }

    if (password.length < 6) {
      return jsonResponse({ error: "Password must be at least 6 characters" }, 400);
    }

    const hasAdmins = await getHasAdmins();
    if (hasAdmins) {
      return jsonResponse(
        { error: "Admin already configured. Please sign in." },
        403,
      );
    }

    const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      // Bootstrap admin should be able to sign in immediately
      email_confirm: true,
    });
    if (createErr || !created.user) {
      throw createErr ?? new Error("Failed to create user");
    }

    const { error: roleErr } = await adminClient
      .from("user_roles")
      .insert({ user_id: created.user.id, role: "admin" });
    if (roleErr) throw roleErr;

    return jsonResponse({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("admin-bootstrap error:", error);
    return jsonResponse({ error: message }, 500);
  }
});
